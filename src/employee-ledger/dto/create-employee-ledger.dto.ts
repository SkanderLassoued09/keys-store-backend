import { ApiProperty } from '@nestjs/swagger';
import type { LedgerType } from '../entities/employee-ledger.entity';

export class CreateEmployeeLedgerDto {
  @ApiProperty({ description: 'Employee ID' })
  employee: string;

  @ApiProperty({
    enum: ['MATERIAL_BORROW', 'PERSONAL_USE', 'SALARY_ADVANCE'],
  })
  type: LedgerType;

  @ApiProperty({
    description: 'Article ID (MATERIAL_BORROW / PERSONAL_USE only)',
    required: false,
  })
  article?: string;

  @ApiProperty({ description: 'Quantity taken from shop stock', required: false, default: 0 })
  quantity?: number;

  @ApiProperty({ description: 'Advance amount (SALARY_ADVANCE only)', required: false, default: 0 })
  amount?: number;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty({ required: false })
  date?: Date;
}
