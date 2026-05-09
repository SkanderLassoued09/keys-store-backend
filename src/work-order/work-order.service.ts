// src/modules/service/service.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Article } from 'src/article/entities/article.entity';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { WorkOrder } from './entities/work-order.entity';

@Injectable()
export class WorkOrderService {
  constructor(
    @InjectModel(WorkOrder.name)
    private readonly workOrderModel: Model<WorkOrder>,
    @InjectModel(Article.name)
    private readonly articleModel: Model<Article>,
  ) {}

  async create(
    createWorkOrderDto: CreateWorkOrderDto,
  ): Promise<WorkOrder | any> {
    try {
      const createdWorkOrder = new this.workOrderModel(createWorkOrderDto);
      return createdWorkOrder.save();
    } catch (error) {
      console.log('error', error);
    }
  }

  async findAll(): Promise<WorkOrder[] | any> {
    try {
      return this.workOrderModel
        .find()
        .populate('employee client machine')
        .exec();
    } catch (error) {
      console.log('error', error);
    }
  }

  // Bulk insert with stock decrement.
  //
  // Standalone Mongo doesn't support multi-document transactions, so we use
  // the "compensating actions" pattern:
  //   1. For each article line, atomically decrement Article.stockQuantity
  //      with a $gte guard so concurrent confirmations can't oversell.
  //   2. If any decrement fails (insufficient stock), undo the prior
  //      decrements and throw 409.
  //   3. insertMany the WorkOrders. If that fails, undo all decrements.
  // Service entries (entryType === 'service') skip stock entirely.
  async createBulkOrderService(createBulkWorkOrderDto: any) {
    const entries: any[] = createBulkWorkOrderDto?.orderServices ?? [];
    if (!Array.isArray(entries) || entries.length === 0) {
      throw new BadRequestException('Aucune entrée à enregistrer.');
    }

    // Boundary validation: every line must have a positive integer quantity.
    for (const entry of entries) {
      const qty = Number(entry?.quantity);
      if (!Number.isFinite(qty) || qty <= 0) {
        throw new BadRequestException(
          `Quantité invalide pour "${entry?.name ?? 'entrée'}" (doit être > 0).`,
        );
      }
    }

    // Aggregate quantities per article._id so duplicate selections of the
    // same article in one submit hit the guard once with the correct total.
    const neededByArticle = new Map<string, number>();
    for (const entry of entries) {
      if (entry?.entryType === 'service') continue;
      if (!entry?.article) continue;
      if (!Types.ObjectId.isValid(entry.article)) {
        throw new BadRequestException(
          `Référence article invalide pour "${entry?.name ?? 'entrée'}".`,
        );
      }
      const id = String(entry.article);
      neededByArticle.set(
        id,
        (neededByArticle.get(id) ?? 0) + Number(entry.quantity),
      );
    }

    const decremented: Array<{ id: string; qty: number }> = [];
    // Per-article commission % captured during the decrement loop. The
    // updated doc returned by findOneAndUpdate is authoritative — it carries
    // the article's CURRENT commissionPercent at sale time.
    const articlePercentById = new Map<string, number>();
    const rollback = async () => {
      for (const { id, qty } of decremented) {
        try {
          await this.articleModel
            .updateOne({ _id: id }, { $inc: { stockQuantity: qty } })
            .exec();
        } catch (rollbackErr) {
          // Last-resort log; don't mask the original error.
          console.error('Stock rollback failed for', id, rollbackErr);
        }
      }
    };

    try {
      for (const [id, qty] of neededByArticle.entries()) {
        const updated = await this.articleModel
          .findOneAndUpdate(
            { _id: id, stockQuantity: { $gte: qty } },
            { $inc: { stockQuantity: -qty } },
            { new: true },
          )
          .exec();

        if (!updated) {
          // Either the article doesn't exist or stock is insufficient.
          // Pull the doc once for a useful error message.
          const existing = await this.articleModel
            .findById(id)
            .select('name stockQuantity')
            .exec();
          await rollback();
          if (!existing) {
            throw new NotFoundException(
              `Article introuvable (id: ${id}).`,
            );
          }
          throw new ConflictException(
            `Stock insuffisant pour: ${existing.name} (disponible: ${existing.stockQuantity}, demandé: ${qty}).`,
          );
        }

        decremented.push({ id, qty });
        articlePercentById.set(
          String(updated._id),
          Number((updated as any).commissionPercent ?? 0),
        );
      }

      // Snapshot commission per line: articles use the parent Article's
      // current rate (authoritative); services trust the modal payload.
      // calculatedPrime is always recomputed server-side to prevent
      // tampering and keep reports honest.
      const enriched = entries.map((e) => {
        const isService = e?.entryType === 'service';
        const percent = isService
          ? Math.max(0, Number(e?.commissionPercent ?? 0))
          : (articlePercentById.get(String(e?.article)) ?? 0);
        const price = Number(e?.price ?? 0);
        const calculatedPrime =
          Math.round(((price * percent) / 100) * 1000) / 1000;
        return {
          ...e,
          commissionPercent: percent,
          calculatedPrime,
        };
      });

      const inserted = await this.workOrderModel.insertMany(enriched, {
        ordered: true,
      });
      return inserted;
    } catch (err) {
      // Compensate any successful decrements before propagating.
      // (If the error originated inside the loop, rollback already ran.)
      if (decremented.length && !(err instanceof ConflictException) && !(err instanceof NotFoundException)) {
        await rollback();
      }
      throw err;
    }
  }

  async findOne(id: string): Promise<WorkOrder | any> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new NotFoundException(`WorkOrder with id ${id} not found`);
      }
      const workOrder = await this.workOrderModel
        .findById(id)
        .populate('employee client machine')
        .exec();
      if (!workOrder) {
        throw new NotFoundException(`WorkOrder with id ${id} not found`);
      }
      return workOrder;
    } catch (error) {
      console.log('error', error);
    }
  }

  async update(
    id: string,
    updateWorkOrderDto: UpdateWorkOrderDto,
  ): Promise<WorkOrder | any> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new NotFoundException(`WorkOrder with id ${id} not found`);
      }
      const updatedWorkOrder = await this.workOrderModel
        .findByIdAndUpdate(id, updateWorkOrderDto, { new: true })
        .populate('employee client machine')
        .exec();
      if (!updatedWorkOrder) {
        throw new NotFoundException(`WorkOrder with id ${id} not found`);
      }
      return updatedWorkOrder;
    } catch (error) {
      console.log('error', error);
    }
  }

  async remove(id: string): Promise<{ message: string } | any> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new NotFoundException(`WorkOrder with id ${id} not found`);
      }
      const deleted = await this.workOrderModel.findByIdAndDelete(id).exec();
      if (!deleted) {
        throw new NotFoundException(`WorkOrder with id ${id} not found`);
      }
      return { message: 'WorkOrder deleted successfully' };
    } catch (error) {
      console.log('error', error);
    }
  }
}
