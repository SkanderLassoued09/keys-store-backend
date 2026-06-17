import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WorkOrder } from '../work-order/entities/work-order.entity';
import { EmployeeLedger } from '../employee-ledger/entities/employee-ledger.entity';
import { WorkTask } from '../work-task/entities/work-task.entity';
import { Employee } from '../employee/entities/employee.entity';

const RETURN_TYPES = ['RETURN_REPLACED', 'RETURN_REFUNDED'];

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(WorkOrder.name)
    private readonly workOrderModel: Model<WorkOrder>,
    @InjectModel(EmployeeLedger.name)
    private readonly ledgerModel: Model<EmployeeLedger>,
    @InjectModel(WorkTask.name)
    private readonly workTaskModel: Model<WorkTask>,
    @InjectModel(Employee.name)
    private readonly employeeModel: Model<Employee>,
  ) {}

  // One pass per collection (4 aggregations total, NOT per-employee), merged
  // in-memory keyed by employee id — no N+1, all raw math done server-side.
  async employees(startDate?: string, endDate?: string) {
    const { start, end, days } = this.resolveRange(startDate, endDate);

    const isReturn = { $in: ['$transactionType', RETURN_TYPES] };

    const woAgg = await this.workOrderModel
      .aggregate([
        {
          $match: {
            employee: { $ne: null },
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: '$employee',
            // Gross sales value handled (returns excluded — tracked separately).
            totalEarned: {
              $sum: { $cond: [isReturn, 0, { $ifNull: ['$price', 0] }] },
            },
            // Employee commission/prime earned on those lines.
            bonus: { $sum: { $ifNull: ['$calculatedPrime', 0] } },
            articlesSold: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $not: [isReturn] },
                      { $eq: [{ $ifNull: ['$entryType', 'article'] }, 'article'] },
                    ],
                  },
                  { $ifNull: ['$quantity', 0] },
                  0,
                ],
              },
            },
            servicesHandled: {
              $sum: { $cond: [{ $eq: ['$entryType', 'service'] }, 1, 0] },
            },
            workOrdersCount: { $sum: { $cond: [isReturn, 0, 1] } },
            returnsCount: { $sum: { $cond: [isReturn, 1, 0] } },
          },
        },
      ])
      .exec();

    const ledgerAgg = await this.ledgerModel
      .aggregate([
        { $match: { date: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: '$employee',
            advancesTaken: {
              $sum: {
                $cond: [
                  { $eq: ['$type', 'SALARY_ADVANCE'] },
                  { $ifNull: ['$amount', 0] },
                  0,
                ],
              },
            },
            materialsBorrowedValue: {
              $sum: {
                $cond: [
                  { $eq: ['$type', 'MATERIAL_BORROW'] },
                  { $ifNull: ['$amount', 0] },
                  0,
                ],
              },
            },
          },
        },
      ])
      .exec();

    const taskAgg = await this.workTaskModel
      .aggregate([
        {
          $match: {
            employee: { $ne: null },
            createdAt: { $gte: start, $lte: end },
          },
        },
        { $group: { _id: '$employee', tasksCount: { $sum: 1 } } },
      ])
      .exec();

    const employees = await this.employeeModel
      .find({ isActive: { $ne: false } })
      .select('firstName lastName')
      .lean()
      .exec();

    const woMap = new Map(woAgg.map((r: any) => [String(r._id), r]));
    const ledgerMap = new Map(ledgerAgg.map((r: any) => [String(r._id), r]));
    const taskMap = new Map(taskAgg.map((r: any) => [String(r._id), r]));

    return employees.map((emp: any) => {
      const id = String(emp._id);
      const wo: any = woMap.get(id) ?? {};
      const led: any = ledgerMap.get(id) ?? {};
      const tk: any = taskMap.get(id) ?? {};
      const workOrdersCount = wo.workOrdersCount ?? 0;
      const servicesHandled = wo.servicesHandled ?? 0;
      const productivityScore =
        days > 0
          ? Math.round(((workOrdersCount + servicesHandled) / days) * 100) / 100
          : 0;

      return {
        employeeId: id,
        fullName: `${emp.firstName ?? ''} ${emp.lastName ?? ''}`.trim(),
        totalEarned: this.round(wo.totalEarned ?? 0),
        bonus: this.round(wo.bonus ?? 0),
        articlesSold: wo.articlesSold ?? 0,
        servicesHandled,
        workOrdersCount,
        returnsCount: wo.returnsCount ?? 0,
        advancesTaken: this.round(led.advancesTaken ?? 0),
        materialsBorrowedValue: this.round(led.materialsBorrowedValue ?? 0),
        tasksCount: tk.tasksCount ?? 0,
        productivityScore,
      };
    });
  }

  private resolveRange(startDate?: string, endDate?: string) {
    const now = new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('Plage de dates invalide.');
    }
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    const days = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / 86400000),
    );
    return { start, end, days };
  }

  private round(value: number): number {
    return Math.round(value * 1000) / 1000;
  }
}
