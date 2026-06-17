import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Article } from 'src/article/entities/article.entity';
import { WorkOrder } from 'src/work-order/entities/work-order.entity';
import { CreateArticleReturnDto } from './dto/create-article-return.dto';
import { ArticleReturn } from './entities/article-return.entity';

@Injectable()
export class ArticleReturnService {
  constructor(
    @InjectModel(ArticleReturn.name)
    private readonly returnModel: Model<ArticleReturn>,
    @InjectModel(Article.name)
    private readonly articleModel: Model<Article>,
    @InjectModel(WorkOrder.name)
    private readonly workOrderModel: Model<WorkOrder>,
  ) {}

  async create(dto: CreateArticleReturnDto) {
    this.validateObjectId(dto.originalArticle, 'Article retourné invalide.');
    this.validateObjectId(dto.employee, 'Employé invalide.');
    if (dto.originalWorkOrder) {
      this.validateObjectId(dto.originalWorkOrder, 'Transaction originale invalide.');
    }

    const returnType = dto.returnType;
    if (!['REPAIRED', 'REPLACED', 'REFUNDED'].includes(returnType)) {
      throw new BadRequestException('Type de retour invalide.');
    }

    const originalArticle = await this.articleModel.findById(dto.originalArticle).exec();
    if (!originalArticle) {
      throw new NotFoundException('Article retourné introuvable.');
    }

    const originalWorkOrder = dto.originalWorkOrder
      ? await this.workOrderModel.findById(dto.originalWorkOrder).exec()
      : null;
    if (dto.originalWorkOrder && !originalWorkOrder) {
      throw new NotFoundException('Transaction originale introuvable.');
    }

    const payload: any = {
      originalWorkOrder: dto.originalWorkOrder ?? null,
      originalArticle: dto.originalArticle,
      customerName: dto.customerName ?? '',
      employee: dto.employee,
      returnDate: dto.returnDate ? new Date(dto.returnDate) : new Date(),
      returnType,
      notes: dto.notes ?? '',
      repairAction: dto.repairAction ?? '',
      replacementArticle: null,
      replacementQuantity: 0,
      refundedAmount: 0,
      revenueImpact: 0,
    };

    let decrementedReplacement: { id: string; qty: number } | null = null;
    let replacementArticle: Article | null = null;

    try {
      if (returnType === 'REPLACED') {
        const qty = Number(dto.replacementQuantity ?? 1);
        if (!Number.isFinite(qty) || qty <= 0) {
          throw new BadRequestException('La quantité de remplacement doit être supérieure à 0.');
        }
        this.validateObjectId(dto.replacementArticle, 'Article de remplacement invalide.');

        const updated = await this.articleModel
          .findOneAndUpdate(
            { _id: dto.replacementArticle, shopQuantity: { $gte: qty } },
            { $inc: { shopQuantity: -qty } },
            { new: true },
          )
          .exec();

        if (!updated) {
          const replacement = await this.articleModel
            .findById(dto.replacementArticle)
            .select('name shopQuantity')
            .exec();
          if (!replacement) {
            throw new NotFoundException('Article de remplacement introuvable.');
          }
          throw new ConflictException(
            `Stock magasin insuffisant pour: ${replacement.name} (disponible: ${replacement.shopQuantity}, demandé: ${qty}).`,
          );
        }

        decrementedReplacement = { id: dto.replacementArticle as string, qty };
        replacementArticle = updated;
        payload.revenueImpact = -this.roundMoney(Number((updated as any).purchasePrice ?? 0) * qty);
        payload.replacementArticle = dto.replacementArticle;
        payload.replacementQuantity = qty;
      }

      if (returnType === 'REFUNDED') {
        const amount = Number(originalWorkOrder?.price ?? originalArticle.sellingPrice ?? 0);
        if (!Number.isFinite(amount) || amount < 0) {
          throw new BadRequestException('Montant remboursé invalide.');
        }
        payload.refundedAmount = this.roundMoney(amount);
        payload.revenueImpact = -this.roundMoney(amount);

        if (dto.originalWorkOrder) {
          await this.workOrderModel
            .findByIdAndUpdate(dto.originalWorkOrder, {
              refunded: true,
              refundedAt: payload.returnDate,
              refundedAmount: payload.refundedAmount,
            })
            .exec();
        }
      }

      const created = await this.returnModel.create(payload);
      // REPAIRED has zero revenue impact and no stock movement, so it does not
      // emit a WorkOrder revenue row — it lives only in the returns table.
      if (returnType !== 'REPAIRED') {
        await this.workOrderModel.create({
          name: this.returnWorkOrderName(returnType, originalArticle, replacementArticle),
          description: dto.notes ?? '',
          quantity: returnType === 'REPLACED' ? payload.replacementQuantity : Number(originalWorkOrder?.quantity ?? 1),
          price: payload.revenueImpact,
          duration: 0,
          category: returnType === 'REPLACED' ? 'Replaced Return' : 'Refunded Return',
          customerName: payload.customerName,
          employee: payload.employee,
          entryType: 'article',
          transactionType: returnType === 'REPLACED' ? 'RETURN_REPLACED' : 'RETURN_REFUNDED',
          article: returnType === 'REPLACED' ? payload.replacementArticle : payload.originalArticle,
          status: 'done',
          refunded: returnType === 'REFUNDED',
          refundedAt: returnType === 'REFUNDED' ? payload.returnDate : null,
          refundedAmount: returnType === 'REFUNDED' ? payload.refundedAmount : 0,
          createdAt: payload.returnDate,
          updatedAt: payload.returnDate,
        });
      }
      return this.findOne(String(created._id));
    } catch (err) {
      if (decrementedReplacement) {
        await this.articleModel
          .updateOne(
            { _id: decrementedReplacement.id },
            { $inc: { shopQuantity: decrementedReplacement.qty } },
          )
          .exec();
      }
      throw err;
    }
  }

  async findAll() {
    return this.returnModel
      .find()
      .sort({ returnDate: -1, createdAt: -1 })
      .populate('originalArticle', 'name reference type')
      .populate('replacementArticle', 'name reference type')
      .populate('employee', 'firstName lastName')
      .populate('originalWorkOrder', 'name customerName quantity price refunded')
      .exec();
  }

  async findOne(id: string) {
    this.validateObjectId(id, 'Retour introuvable.');
    const articleReturn = await this.returnModel
      .findById(id)
      .populate('originalArticle', 'name reference type')
      .populate('replacementArticle', 'name reference type')
      .populate('employee', 'firstName lastName')
      .populate('originalWorkOrder', 'name customerName quantity price refunded')
      .exec();
    if (!articleReturn) {
      throw new NotFoundException('Retour introuvable.');
    }
    return articleReturn;
  }

  private validateObjectId(value: unknown, message: string): asserts value is string {
    if (!value || !Types.ObjectId.isValid(String(value))) {
      throw new BadRequestException(message);
    }
  }

  private roundMoney(value: number): number {
    return Math.round(value * 1000) / 1000;
  }

  private returnWorkOrderName(
    returnType: 'REPLACED' | 'REFUNDED',
    originalArticle: Article,
    replacementArticle: Article | null,
  ): string {
    if (returnType === 'REPLACED') {
      return `Replaced Return - ${(replacementArticle as any)?.name ?? originalArticle.name}`;
    }
    return `Refunded Return - ${originalArticle.name}`;
  }
}
