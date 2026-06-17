import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Article } from 'src/article/entities/article.entity';
import { CreateEmployeeLedgerDto } from './dto/create-employee-ledger.dto';
import { EmployeeLedger } from './entities/employee-ledger.entity';

@Injectable()
export class EmployeeLedgerService {
  constructor(
    @InjectModel(EmployeeLedger.name)
    private readonly ledgerModel: Model<EmployeeLedger>,
    @InjectModel(Article.name)
    private readonly articleModel: Model<Article>,
  ) {}

  async create(dto: CreateEmployeeLedgerDto) {
    if (!dto.employee || !Types.ObjectId.isValid(dto.employee)) {
      throw new BadRequestException('Employé invalide.');
    }
    const type = dto.type;
    if (!['MATERIAL_BORROW', 'PERSONAL_USE', 'SALARY_ADVANCE'].includes(type)) {
      throw new BadRequestException('Type de mouvement invalide.');
    }

    const payload: any = {
      employee: dto.employee,
      type,
      article: null,
      quantity: 0,
      amount: 0,
      notes: dto.notes ?? '',
      date: dto.date ? new Date(dto.date) : new Date(),
    };

    // SALARY_ADVANCE stores only employee + amount + date (no stock).
    if (type === 'SALARY_ADVANCE') {
      const amount = Number(dto.amount ?? 0);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new BadRequestException('Montant d’avance invalide (> 0).');
      }
      payload.amount = this.roundMoney(amount);
      const created = await this.ledgerModel.create(payload);
      return this.findOne(String(created._id));
    }

    // MATERIAL_BORROW / PERSONAL_USE decrement shop stock with the same atomic
    // findOneAndUpdate + $gte guard used by WorkOrderService (no oversell), and
    // compensate the decrement if the ledger insert fails.
    const qty = Number(dto.quantity ?? 0);
    if (!Number.isFinite(qty) || qty <= 0) {
      throw new BadRequestException('Quantité invalide (doit être > 0).');
    }
    if (!dto.article || !Types.ObjectId.isValid(dto.article)) {
      throw new BadRequestException('Article invalide.');
    }

    const updated = await this.articleModel
      .findOneAndUpdate(
        { _id: dto.article, shopQuantity: { $gte: qty } },
        { $inc: { shopQuantity: -qty } },
        { new: true },
      )
      .exec();

    if (!updated) {
      const existing = await this.articleModel
        .findById(dto.article)
        .select('name shopQuantity')
        .exec();
      if (!existing) {
        throw new NotFoundException('Article introuvable.');
      }
      throw new ConflictException(
        `Stock magasin insuffisant pour: ${existing.name} (disponible: ${existing.shopQuantity}, demandé: ${qty}).`,
      );
    }

    payload.article = dto.article;
    payload.quantity = qty;
    payload.amount = this.roundMoney(
      Number((updated as any).purchasePrice ?? 0) * qty,
    );

    try {
      const created = await this.ledgerModel.create(payload);
      return this.findOne(String(created._id));
    } catch (err) {
      // Compensating rollback for the stock decrement.
      await this.articleModel
        .updateOne({ _id: dto.article }, { $inc: { shopQuantity: qty } })
        .exec();
      throw err;
    }
  }

  async findAll() {
    return this.ledgerModel
      .find()
      .sort({ date: -1, createdAt: -1 })
      .populate('employee', 'firstName lastName')
      .populate('article', 'name reference')
      .exec();
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Ledger entry ${id} not found`);
    }
    const entry = await this.ledgerModel
      .findById(id)
      .populate('employee', 'firstName lastName')
      .populate('article', 'name reference')
      .exec();
    if (!entry) {
      throw new NotFoundException(`Ledger entry ${id} not found`);
    }
    return entry;
  }

  // Deleting a ledger row does NOT restock — same conservative stance as
  // returns (stock is never auto-incremented).
  async remove(id: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Ledger entry ${id} not found`);
    }
    const deleted = await this.ledgerModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Ledger entry ${id} not found`);
    }
    return { message: 'Ledger entry deleted successfully' };
  }

  private roundMoney(value: number): number {
    return Math.round(value * 1000) / 1000;
  }
}
