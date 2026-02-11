import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './entities/article.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectModel(Article.name) private readonly articleModel: Model<Article>,
  ) {}

  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    console.log(createArticleDto);
    const createdArticle = new this.articleModel(createArticleDto);
    return await createdArticle.save();
  }

  async findAll(): Promise<any[]> {
    const articles = await this.articleModel
      .find()
      .populate('fournisseur', 'name')
      .lean()
      .exec();
    return articles.map((article) => ({
      ...article,
      fournisseur: article.fournisseur?.name ?? null,
    }));
  }

  async findOne(id: string): Promise<Article> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Article with id ${id} not found`);
    }
    const article = await this.articleModel
      .findById(id)
      .populate('fournisseur')
      .exec();
    if (!article) {
      throw new NotFoundException(`Article with id ${id} not found`);
    }
    return article;
  }

  async update(
    id: string,
    updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Article with id ${id} not found`);
    }
    const updatedArticle = await this.articleModel
      .findByIdAndUpdate(id, updateArticleDto, { new: true })
      .populate('fournisseur')
      .exec();
    if (!updatedArticle) {
      throw new NotFoundException(`Article with id ${id} not found`);
    }
    return updatedArticle;
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
