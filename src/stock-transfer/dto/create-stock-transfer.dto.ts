import { ApiProperty } from '@nestjs/swagger';

export class CreateStockTransferDto {
  @ApiProperty({ description: 'Article id to transfer stock from' })
  articleId: string;

  @ApiProperty({ description: 'Quantity to move from Stock to Magasin', example: 5 })
  quantity: number;

  @ApiProperty({
    description: 'Optional employee id performing the transfer',
    required: false,
  })
  employeeId?: string;
}
