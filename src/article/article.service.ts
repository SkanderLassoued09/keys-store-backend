import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Provider } from 'src/provider/entities/provider.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './entities/article.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectModel(Article.name) private readonly articleModel: Model<Article>,
    @InjectModel(Provider.name) private readonly providerModel: Model<Provider>,
  ) {}

  // Manual fournisseur resolution that tolerates legacy rows where the
  // field holds a raw string (e.g. a name) instead of an ObjectId. Mongoose
  // populate() casts every collected value to ObjectId in one batched query
  // and crashes the entire request if any single value is invalid — this
  // method protects every read path from that.
  private async resolveFournisseurMap(
    rawValues: unknown[],
  ): Promise<Map<string, string>> {
    const validIds: Types.ObjectId[] = [];
    for (const v of rawValues) {
      if (!v) continue;
      const s = String(v);
      if (Types.ObjectId.isValid(s)) {
        validIds.push(new Types.ObjectId(s));
      }
    }
    if (validIds.length === 0) return new Map();
    const providers = await this.providerModel
      .find({ _id: { $in: validIds } })
      .select('name')
      .lean()
      .exec();
    return new Map(providers.map((p: any) => [String(p._id), p.name]));
  }

  private resolveFournisseur(
    raw: unknown,
    nameById: Map<string, string>,
  ): string | null {
    if (!raw) return null;
    const s = String(raw);
    if (!Types.ObjectId.isValid(s)) return null;
    return nameById.get(s) ?? null;
  }

  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    console.log(createArticleDto);
    const createdArticle = new this.articleModel(createArticleDto);
    return await createdArticle.save();
  }

  async findAll(): Promise<any[]> {
    const articles = await this.articleModel.find().lean().exec();
    const nameById = await this.resolveFournisseurMap(
      articles.map((a) => a.fournisseur),
    );
    return articles.map((article) => ({
      ...article,
      fournisseur: this.resolveFournisseur(article.fournisseur, nameById),
    }));
  }

  async findOne(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Article with id ${id} not found`);
    }
    const article = await this.articleModel.findById(id).lean().exec();
    if (!article) {
      throw new NotFoundException(`Article with id ${id} not found`);
    }
    const nameById = await this.resolveFournisseurMap([article.fournisseur]);
    return {
      ...article,
      fournisseur: this.resolveFournisseur(article.fournisseur, nameById),
    };
  }

  async update(
    id: string,
    updateArticleDto: UpdateArticleDto,
  ): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Article with id ${id} not found`);
    }
    const updatedArticle = await this.articleModel
      .findByIdAndUpdate(id, updateArticleDto, { new: true })
      .lean()
      .exec();
    if (!updatedArticle) {
      throw new NotFoundException(`Article with id ${id} not found`);
    }
    const nameById = await this.resolveFournisseurMap([
      updatedArticle.fournisseur,
    ]);
    return {
      ...updatedArticle,
      fournisseur: this.resolveFournisseur(updatedArticle.fournisseur, nameById),
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Article with id ${id} not found`);
    }
    const deleted = await this.articleModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Article with id ${id} not found`);
    }
    return { message: 'Article deleted successfully' };
  }

  async getArticleType(id: string) {
    try {
      return await this.articleModel.distinct('type');
    } catch (error) {
      console.log(error);
    }
  }

  async getArticlesByType(type: string) {
    try {
      return await this.articleModel.find({ type });
    } catch (error) {
      console.log(error);
    }
  }
}
