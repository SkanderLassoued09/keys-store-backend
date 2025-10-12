import { Module } from '@nestjs/common';
import { MachineService } from './machine.service';
import { MachineController } from './machine.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Machine, MachineSchema } from './entities/machine.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Machine.name, schema: MachineSchema }]),
  ],
  controllers: [MachineController],
  providers: [MachineService],
})
export class MachineModule {}
