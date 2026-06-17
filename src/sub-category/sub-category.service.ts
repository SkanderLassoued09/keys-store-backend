import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { SubCategory } from './entities/sub-category.entity';

@Injectable()
export class SubCategoryService {
  constructor(
    @InjectModel(SubCategory.name)
    private readonly subCategoryModel: Model<SubCategory>,
  ) {}

  async create(
    createSubCategoryDto: CreateSubCategoryDto,
  ): Promise<SubCategory> {
    const created = new this.subCategoryModel(createSubCategoryDto);
    return created.save();
  }

  // Optional categoryId filter powers the cascading select in the article form.
  async findAll(categoryId?: string): Promise<SubCategory[]> {
    const filter: Record<string, any> = {};
    if (categoryId) {
      if (!Types.ObjectId.isValid(categoryId)) {
        throw new BadRequestException(`Invalid categoryId ${categoryId}`);
      }
      filter.category = categoryId;
    }
    return this.subCategoryModel
      .find(filter)
      .populate('category', 'name image')
      .sort({ name: 1 })
      .exec();
  }

  async findOne(id: string): Promise<SubCategory> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`SubCategory with id ${id} not found`);
    }
    const subCategory = await this.subCategoryModel
      .findById(id)
      .populate('category', 'name image')
      .exec();
    if (!subCategory) {
      throw new NotFoundException(`SubCategory with id ${id} not found`);
    }
    return subCategory;
  }

  async update(
    id: string,
    updateSubCategoryDto: UpdateSubCategoryDto,
  ): Promise<SubCategory> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`SubCategory with id ${id} not found`);
    }
    const updated = await this.subCategoryModel
      .findByIdAndUpdate(id, updateSubCategoryDto, { new: true })
      .populate('category', 'name image')
      .exec();
    if (!updated) {
      throw new NotFoundException(`SubCategory with id ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`SubCategory with id ${id} not found`);
    }
    const deleted = await this.subCategoryModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`SubCategory with id ${id} not found`);
    }
    return { message: 'SubCategory deleted successfully' };
  }
}
