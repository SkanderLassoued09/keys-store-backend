import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './entities/client.entity';

@Injectable()
export class ClientService {
  constructor(@InjectModel(Client.name) private clientModel: Model<Client>) {}

  // Create a new client
  async create(createClientDto: CreateClientDto): Promise<Client> {
    const createdClient = new this.clientModel(createClientDto);
    return await createdClient.save();
  }

  // Get all clients
  async findAll(): Promise<Client[]> {
    return this.clientModel.find().populate('purchases services').exec();
  }

  // Get client by ID
  async findOne(id: string): Promise<Client> {
    const client = await this.clientModel
      .findById(id)
      .populate('purchases services')
      .exec();
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    return client;
  }

  // Update client by ID
  async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    const updatedClient = await this.clientModel
      .findByIdAndUpdate(id, updateClientDto, { new: true })
      .populate('purchases services')
      .exec();

    if (!updatedClient) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    return updatedClient;
  }

  // Delete client by ID
  async remove(id: string): Promise<{ message: string }> {
    const deletedClient = await this.clientModel.findByIdAndDelete(id).exec();
    if (!deletedClient) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    return { message: `Client with ID ${id} has been deleted` };
  }
}
