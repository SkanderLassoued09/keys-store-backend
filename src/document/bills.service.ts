import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Bills } from './entities/bills.entity';

@Injectable()
export class DocumentService {
  constructor(@InjectModel(Bills.name) private billsModel: Model<Bills>) {}

  // Create a new document
  async create(createDocumentDto: CreateDocumentDto): Promise<Bills> {
    const createdDocument = new this.billsModel(createDocumentDto);
    return createdDocument.save();
  }

  // Get all documents
  async findAll(): Promise<Bills[]> {
    return this.billsModel.find().populate('fournisseur employee').exec();
  }

  // Get document by ID
  async findOne(id: string): Promise<Bills> {
    const document = await this.billsModel
      .findById(id)
      .populate('fournisseur employee')
      .exec();
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    return document;
  }

  // Update document by ID
  async update(
    id: string,
    updateDocumentDto: UpdateDocumentDto,
  ): Promise<Bills> {
    const updatedDocument = await this.billsModel
      .findByIdAndUpdate(id, updateDocumentDto, { new: true })
      .populate('fournisseur employee')
      .exec();
    if (!updatedDocument) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    return updatedDocument;
  }

  // Delete document by ID
  async remove(id: string): Promise<{ message: string }> {
    const deletedDocument = await this.billsModel.findByIdAndDelete(id).exec();
    if (!deletedDocument) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    return { message: `Document with ID ${id} has been deleted` };
  }
}
