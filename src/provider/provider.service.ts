import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { Provider } from './entities/provider.entity';

@Injectable()
export class ProviderService {
  constructor(
    @InjectModel(Provider.name) private readonly providerModel: Model<Provider>,
  ) {}

  async create(createProviderDto: CreateProviderDto): Promise<Provider> {
    const createdProvider = new this.providerModel(createProviderDto);
    return createdProvider.save();
  }

  async findAll(): Promise<Provider[]> {
    return this.providerModel.find().populate('articles machines').exec();
  }

  async findOne(id: string): Promise<Provider> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Provider with id ${id} not found`);
    }
    const provider = await this.providerModel
      .findById(id)
      .populate('articles machines')
      .exec();
    if (!provider) {
      throw new NotFoundException(`Provider with id ${id} not found`);
    }
    return provider;
  }

  async update(
    id: string,
    updateProviderDto: UpdateProviderDto,
  ): Promise<Provider> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Provider with id ${id} not found`);
    }
    const updatedProvider = await this.providerModel
      .findByIdAndUpdate(id, updateProviderDto, { new: true })
      .populate('articles machines')
      .exec();
    if (!updatedProvider) {
      throw new NotFoundException(`Provider with id ${id} not found`);
    }
    return updatedProvider;
  }

  async remove(id: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Provider with id ${id} not found`);
    }
    const deleted = await this.providerModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Provider with id ${id} not found`);
    }
    return { message: 'Provider deleted successfully' };
  }
}
