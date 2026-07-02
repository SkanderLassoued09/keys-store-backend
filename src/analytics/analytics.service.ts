import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WorkOrder } from '../work-order/entities/work-order.entity';
import { EmployeeLedger } from '../employee-ledger/entities/employee-ledger.entity';
import { WorkTask } from '../work-task/entities/work-task.entity';
import { Employee } from '../employee/entities/employee.entity';
import { Article } from '../article/entities/article.entity';
import { Category } from '../category/entities/category.entity';
import { Provider } from '../provider/entities/provider.entity';

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
    @InjectModel(Article.name)
    private readonly articleModel: Model<Article>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<Category>,
    @InjectModel(Provider.name)
    private readonly providerModel: Model<Provider>,
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

  // ---------------------------------------------------------------------------
  // Business Intelligence dashboard — ONE endpoint. A single faceted pipeline
  // over WorkOrder (joined to Article for cost/category/supplier) produces every
  // section, plus a few tiny reuse passes (categories/providers/articles lists,
  // employee ledger + tasks). No per-row/per-entity queries → no N+1.
  //
  // Same conventions as the rest of the app:
  //   revenue       = Σ price               (RETURN_* rows carry NEGATIVE price)
  //   purchase cost = Σ purchasePrice × qty  (non-return article lines only)
  //   commission    = Σ calculatedPrime      (snapshotted at sale time; 0 on returns)
  // All money math is done here so the frontend only renders.
  // ---------------------------------------------------------------------------
  async business(startDate?: string, endDate?: string) {
    const { start, end, days } = this.resolveRange(startDate, endDate);
    // Adaptive time bucket: single day → hourly, up to ~2 months → daily, else monthly.
    const granularity: 'hour' | 'day' | 'month' =
      days <= 1 ? 'hour' : days <= 62 ? 'day' : 'month';
    const fmt =
      granularity === 'hour'
        ? '%Y-%m-%dT%H:00'
        : granularity === 'day'
          ? '%Y-%m-%d'
          : '%Y-%m';

    const isReturn = { $in: ['$transactionType', RETURN_TYPES] };
    const isSaleArticle = {
      $and: [{ $not: ['$_ret'] }, { $eq: ['$_entry', 'article'] }],
    };
    const saleArticleCost = {
      $cond: [isSaleArticle, { $multiply: ['$_purchase', '$_qty'] }, 0],
    };

    const [facet] = await this.workOrderModel
      .aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        {
          $addFields: {
            _ret: isReturn,
            _entry: { $ifNull: ['$entryType', 'article'] },
            _price: { $ifNull: ['$price', 0] },
            _qty: { $ifNull: ['$quantity', 0] },
            _prime: { $ifNull: ['$calculatedPrime', 0] },
          },
        },
        // Join the parent article for purchase cost / real category / supplier.
        {
          $lookup: {
            from: 'articles',
            localField: 'article',
            foreignField: '_id',
            as: '_art',
          },
        },
        { $addFields: { _art: { $arrayElemAt: ['$_art', 0] } } },
        {
          $addFields: {
            _purchase: { $ifNull: ['$_art.purchasePrice', 0] },
            _catId: '$_art.category',
            _supId: '$_art.fournisseur',
            _artName: { $ifNull: ['$_art.name', '$name'] },
          },
        },
        {
          $facet: {
            kpis: [
              {
                $group: {
                  _id: null,
                  totalRevenue: { $sum: { $cond: ['$_ret', 0, '$_price'] } },
                  netRevenue: { $sum: '$_price' },
                  purchaseCost: { $sum: saleArticleCost },
                  articlesSold: {
                    $sum: { $cond: [isSaleArticle, '$_qty', 0] },
                  },
                  servicesCompleted: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $not: ['$_ret'] },
                            { $eq: ['$_entry', 'service'] },
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                  totalSales: { $sum: { $cond: ['$_ret', 0, 1] } },
                  totalReturns: { $sum: { $cond: ['$_ret', 1, 0] } },
                  totalCommissions: { $sum: '$_prime' },
                },
              },
            ],
            trend: [
              {
                $group: {
                  _id: { $dateToString: { format: fmt, date: '$createdAt' } },
                  revenue: { $sum: '$_price' },
                  cost: { $sum: saleArticleCost },
                  salesRevenue: { $sum: { $cond: ['$_ret', 0, '$_price'] } },
                  salesCount: { $sum: { $cond: ['$_ret', 0, 1] } },
                },
              },
              { $sort: { _id: 1 } },
            ],
            hourly: [
              {
                $group: {
                  _id: { $hour: '$createdAt' },
                  revenue: { $sum: '$_price' },
                },
              },
              { $sort: { _id: 1 } },
            ],
            salesMix: [
              {
                $group: {
                  _id: null,
                  articleRevenue: {
                    $sum: { $cond: [isSaleArticle, '$_price', 0] },
                  },
                  serviceRevenue: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $not: ['$_ret'] },
                            { $eq: ['$_entry', 'service'] },
                          ],
                        },
                        '$_price',
                        0,
                      ],
                    },
                  },
                },
              },
            ],
            byEmployee: [
              { $match: { employee: { $ne: null } } },
              {
                $group: {
                  _id: '$employee',
                  articleRevenue: {
                    $sum: { $cond: [isSaleArticle, '$_price', 0] },
                  },
                  serviceRevenue: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $not: ['$_ret'] },
                            { $eq: ['$_entry', 'service'] },
                          ],
                        },
                        '$_price',
                        0,
                      ],
                    },
                  },
                  totalRevenue: { $sum: { $cond: ['$_ret', 0, '$_price'] } },
                  articlesSold: { $sum: { $cond: [isSaleArticle, '$_qty', 0] } },
                  servicesCompleted: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $not: ['$_ret'] },
                            { $eq: ['$_entry', 'service'] },
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                  returnsProcessed: { $sum: { $cond: ['$_ret', 1, 0] } },
                  articleCommission: {
                    $sum: {
                      $cond: [{ $eq: ['$_entry', 'article'] }, '$_prime', 0],
                    },
                  },
                  serviceCommission: {
                    $sum: {
                      $cond: [{ $eq: ['$_entry', 'service'] }, '$_prime', 0],
                    },
                  },
                  totalCommission: { $sum: '$_prime' },
                  salesCount: { $sum: { $cond: ['$_ret', 0, 1] } },
                },
              },
            ],
            byCategory: [
              { $match: { _entry: 'article' } },
              {
                $group: {
                  _id: '$_catId',
                  revenue: { $sum: { $cond: ['$_ret', 0, '$_price'] } },
                  quantitySold: { $sum: { $cond: ['$_ret', 0, '$_qty'] } },
                  cost: { $sum: saleArticleCost },
                  returns: { $sum: { $cond: ['$_ret', 1, 0] } },
                },
              },
            ],
            byArticle: [
              { $match: { _entry: 'article', article: { $ne: null } } },
              {
                $group: {
                  _id: '$article',
                  name: { $first: '$_artName' },
                  quantitySold: { $sum: { $cond: ['$_ret', 0, '$_qty'] } },
                  revenue: { $sum: { $cond: ['$_ret', 0, '$_price'] } },
                  cost: { $sum: saleArticleCost },
                  returns: { $sum: { $cond: ['$_ret', 1, 0] } },
                },
              },
            ],
            bySupplier: [
              { $match: { _entry: 'article' } },
              {
                $group: {
                  _id: '$_supId',
                  revenue: { $sum: { $cond: ['$_ret', 0, '$_price'] } },
                  articlesSold: { $sum: { $cond: ['$_ret', 0, '$_qty'] } },
                  cost: { $sum: saleArticleCost },
                  returns: { $sum: { $cond: ['$_ret', 1, 0] } },
                },
              },
            ],
            returnsSummary: [
              { $match: { _ret: true } },
              {
                $group: {
                  _id: '$transactionType',
                  count: { $sum: 1 },
                  moneyLost: { $sum: '$_price' },
                },
              },
            ],
          },
        },
      ])
      .exec();

    // ---- Small reuse passes (lists + ledger + tasks) ------------------------
    const [cats, provs, articles, employees, ledgerAgg, taskAgg] =
      await Promise.all([
        this.categoryModel.find().select('name').lean().exec(),
        this.providerModel.find().select('name').lean().exec(),
        this.articleModel
          .find()
          .select('name reference shopQuantity stockQuantity')
          .lean()
          .exec(),
        this.employeeModel
          .find({ isActive: { $ne: false } })
          .select('firstName lastName')
          .lean()
          .exec(),
        this.ledgerModel
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
          .exec(),
        this.workTaskModel
          .aggregate([
            {
              $match: {
                employee: { $ne: null },
                status: 'DONE',
                createdAt: { $gte: start, $lte: end },
              },
            },
            { $group: { _id: '$employee', tasksCount: { $sum: 1 } } },
          ])
          .exec(),
      ]);

    const catName = new Map(cats.map((c: any) => [String(c._id), c.name]));
    const provName = new Map(provs.map((p: any) => [String(p._id), p.name]));

    // ---- KPIs ---------------------------------------------------------------
    const k: any = facet?.kpis?.[0] ?? {};
    const totalRevenue = this.round(k.totalRevenue ?? 0);
    const netRevenue = this.round(k.netRevenue ?? 0);
    const purchaseCost = this.round(k.purchaseCost ?? 0);
    const grossProfit = this.round(netRevenue - purchaseCost);
    const totalSales = k.totalSales ?? 0;
    const totalReturns = k.totalReturns ?? 0;
    const kpis = {
      totalRevenue,
      netRevenue,
      grossProfit,
      purchaseCost,
      profitMargin: netRevenue ? this.round((grossProfit / netRevenue) * 100) : 0,
      averageTicket: totalSales ? this.round(totalRevenue / totalSales) : 0,
      totalSales,
      totalReturns,
      articlesSold: k.articlesSold ?? 0,
      servicesCompleted: k.servicesCompleted ?? 0,
      totalCommissions: this.round(k.totalCommissions ?? 0),
      returnRate: totalSales
        ? this.round((totalReturns / totalSales) * 100)
        : 0,
    };

    // ---- Trend + average-ticket evolution -----------------------------------
    const trend = (facet?.trend ?? []).map((b: any) => ({
      bucket: b._id,
      revenue: this.round(b.revenue ?? 0),
      profit: this.round((b.revenue ?? 0) - (b.cost ?? 0)),
      avgTicket: b.salesCount
        ? this.round((b.salesRevenue ?? 0) / b.salesCount)
        : 0,
    }));

    // ---- Busy hours (single-day filter only) --------------------------------
    const hourlyMap = new Map(
      (facet?.hourly ?? []).map((h: any) => [h._id, h.revenue]),
    );
    const hourly =
      granularity === 'hour'
        ? Array.from({ length: 24 }, (_, h) => ({
            hour: h,
            revenue: this.round((hourlyMap.get(h) as number) ?? 0),
          }))
        : [];

    // ---- Sales mix ----------------------------------------------------------
    const mix: any = facet?.salesMix?.[0] ?? {};
    const salesMix = {
      articleRevenue: this.round(mix.articleRevenue ?? 0),
      serviceRevenue: this.round(mix.serviceRevenue ?? 0),
    };

    // ---- Employees ----------------------------------------------------------
    const empMap = new Map(
      (facet?.byEmployee ?? []).map((r: any) => [String(r._id), r]),
    );
    const ledgerMap = new Map(ledgerAgg.map((r: any) => [String(r._id), r]));
    const taskMap = new Map(taskAgg.map((r: any) => [String(r._id), r]));
    const employeesOut = employees
      .map((emp: any) => {
        const id = String(emp._id);
        const e: any = empMap.get(id) ?? {};
        const l: any = ledgerMap.get(id) ?? {};
        const t: any = taskMap.get(id) ?? {};
        const salesCount = e.salesCount ?? 0;
        const totalRev = this.round(e.totalRevenue ?? 0);
        const servicesCompleted = e.servicesCompleted ?? 0;
        return {
          employeeId: id,
          fullName: `${emp.firstName ?? ''} ${emp.lastName ?? ''}`.trim(),
          articleRevenue: this.round(e.articleRevenue ?? 0),
          serviceRevenue: this.round(e.serviceRevenue ?? 0),
          totalRevenue: totalRev,
          articlesSold: e.articlesSold ?? 0,
          servicesCompleted,
          returnsProcessed: e.returnsProcessed ?? 0,
          articleCommission: this.round(e.articleCommission ?? 0),
          serviceCommission: this.round(e.serviceCommission ?? 0),
          totalCommission: this.round(e.totalCommission ?? 0),
          averageSale: salesCount ? this.round(totalRev / salesCount) : 0,
          productivityScore:
            days > 0
              ? Math.round(((salesCount + servicesCompleted) / days) * 100) / 100
              : 0,
          tasksCompleted: t.tasksCount ?? 0,
          salaryAdvances: this.round(l.advancesTaken ?? 0),
          materialsBorrowed: this.round(l.materialsBorrowedValue ?? 0),
        };
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    // ---- Categories ---------------------------------------------------------
    const categories = (facet?.byCategory ?? [])
      .map((c: any) => {
        const revenue = this.round(c.revenue ?? 0);
        const qty = c.quantitySold ?? 0;
        return {
          categoryId: c._id ? String(c._id) : null,
          name: c._id
            ? (catName.get(String(c._id)) ?? 'Sans catégorie')
            : 'Sans catégorie',
          revenue,
          quantitySold: qty,
          avgSellingPrice: qty ? this.round(revenue / qty) : 0,
          grossProfit: this.round((c.revenue ?? 0) - (c.cost ?? 0)),
          returns: c.returns ?? 0,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);

    // ---- Articles (best / worst) --------------------------------------------
    const artStats = (facet?.byArticle ?? []).map((a: any) => ({
      articleId: String(a._id),
      name: a.name ?? '—',
      quantitySold: a.quantitySold ?? 0,
      revenue: this.round(a.revenue ?? 0),
      profit: this.round((a.revenue ?? 0) - (a.cost ?? 0)),
      returns: a.returns ?? 0,
    }));
    const bestArticles = [...artStats]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
    const soldMap = new Map(artStats.map((a) => [a.articleId, a]));
    const worstArticles = articles
      .map((a: any) => {
        const s: any = soldMap.get(String(a._id));
        return {
          articleId: String(a._id),
          name: a.name,
          quantitySold: s?.quantitySold ?? 0,
          revenue: s?.revenue ?? 0,
          shopQuantity: a.shopQuantity ?? 0,
          stockQuantity: a.stockQuantity ?? 0,
        };
      })
      .sort(
        (a, b) => a.quantitySold - b.quantitySold || a.revenue - b.revenue,
      )
      .slice(0, 10);

    // ---- Suppliers ----------------------------------------------------------
    const suppliers = (facet?.bySupplier ?? [])
      .map((s: any) => ({
        supplierId: s._id ? String(s._id) : null,
        name: s._id
          ? (provName.get(String(s._id)) ?? 'Sans fournisseur')
          : 'Sans fournisseur',
        revenue: this.round(s.revenue ?? 0),
        articlesSold: s.articlesSold ?? 0,
        profit: this.round((s.revenue ?? 0) - (s.cost ?? 0)),
        returns: s.returns ?? 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // ---- Returns analysis ---------------------------------------------------
    let refundCount = 0;
    let replacementCount = 0;
    let moneyLost = 0;
    for (const r of facet?.returnsSummary ?? []) {
      if (r._id === 'RETURN_REFUNDED') refundCount = r.count;
      else if (r._id === 'RETURN_REPLACED') replacementCount = r.count;
      moneyLost += Math.abs(r.moneyLost ?? 0);
    }
    const returns = {
      refundCount,
      replacementCount,
      moneyLost: this.round(moneyLost),
      returnRate: kpis.returnRate,
      topArticles: [...artStats]
        .filter((a) => a.returns > 0)
        .sort((a, b) => b.returns - a.returns)
        .slice(0, 10)
        .map((a) => ({ name: a.name, count: a.returns })),
      topCategories: categories
        .filter((c) => c.returns > 0)
        .sort((a, b) => b.returns - a.returns)
        .slice(0, 10)
        .map((c) => ({ name: c.name, count: c.returns })),
    };

    // ---- Summary highlights -------------------------------------------------
    const highestRevenueBucket = [...trend].sort(
      (a, b) => b.revenue - a.revenue,
    )[0];
    const highestProfitBucket = [...trend].sort(
      (a, b) => b.profit - a.profit,
    )[0];
    const summary = {
      bestEmployee: employeesOut[0]
        ? { name: employeesOut[0].fullName, value: employeesOut[0].totalRevenue }
        : null,
      bestCategory: categories[0]
        ? { name: categories[0].name, value: categories[0].revenue }
        : null,
      bestArticle: bestArticles[0]
        ? { name: bestArticles[0].name, value: bestArticles[0].revenue }
        : null,
      highestRevenueDay: highestRevenueBucket
        ? {
            bucket: highestRevenueBucket.bucket,
            value: highestRevenueBucket.revenue,
          }
        : null,
      highestProfitDay: highestProfitBucket
        ? {
            bucket: highestProfitBucket.bucket,
            value: highestProfitBucket.profit,
          }
        : null,
      returnRate: kpis.returnRate,
    };

    return {
      range: {
        start: start.toISOString(),
        end: end.toISOString(),
        days,
        granularity,
      },
      kpis,
      trend,
      hourly,
      salesMix,
      employees: employeesOut,
      categories,
      bestArticles,
      worstArticles,
      suppliers,
      returns,
      summary,
    };
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
