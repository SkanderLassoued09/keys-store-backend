import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Article } from 'src/article/entities/article.entity';
import { CreateStockTransferDto } from './dto/create-stock-transfer.dto';
import { StockTransfer } from './entities/stock-transfer.entity';

@Injectable()
export class StockTransferService {
  constructor(
    @InjectModel(StockTransfer.name)
    private readonly transferModel: Model<StockTransfer>,
    @InjectModel(Article.name)
    private readonly articleModel: Model<Article>,
  ) {}

  // Single-document atomic transfer: Mongo guarantees atomicity for a single
  // findOneAndUpdate, so the $gte guard + dual $inc cannot oversell or leave
  // the document in a half-updated state. No transaction needed.
  async create(dto: CreateStockTransferDto) {
    const qty = Number(dto?.quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      throw new BadRequestException('La quantité doit être supérieure à 0.');
    }
    if (!dto?.articleId || !Types.ObjectId.isValid(dto.articleId)) {
      throw new BadRequestException('Référence article invalide.');
    }
    if (dto.employeeId && !Types.ObjectId.isValid(dto.employeeId)) {
      throw new BadRequestException('Référence employé invalide.');
    }

    const before = await this.articleModel
      .findById(dto.articleId)
      .select('name stockQuantity shopQuantity')
      .exec();
    if (!before) {
      throw new NotFoundException('Article introuvable.');
    }

    const updated = await this.articleModel
      .findOneAndUpdate(
        { _id: dto.articleId, stockQuantity: { $gte: qty } },
        { $inc: { stockQuantity: -qty, shopQuantity: qty } },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new ConflictException(
        `Stock insuffisant pour: ${before.name} (disponible: ${before.stockQuantity}, demandé: ${qty}).`,
      );
    }

    // History is best-effort: the article update is the source of truth. If
    // this insert fails we log and still return success so the caller's UI
    // doesn't roll back a successful transfer.
    try {
      await this.transferModel.create({
        article: updated._id,
        quantity: qty,
        oldStock: before.stockQuantity,
        newStock: updated.stockQuantity,
        oldShop: before.shopQuantity,
        newShop: updated.shopQuantity,
        employee: dto.employeeId ?? null,
      });
    } catch (err) {
      console.error('Stock transfer history insert failed', err);
    }

    return updated;
  }

  async findAll() {
    return this.transferModel
      .find()
      .sort({ createdAt: -1 })
      .populate('article', 'name reference')
      .populate('employee', 'firstName lastName')
      .exec();
  }
}
