import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleDto {
  @ApiProperty({ description: 'Name of the article' })
  name: string;

  @ApiProperty({ description: 'Reference code', required: false })
  reference?: string;

  @ApiProperty({ description: 'Purchase price of the article' })
  purchasePrice: number;

  @ApiProperty({ description: 'Selling price of the article' })
  sellingrice: number;

  @ApiProperty({ description: 'Stock quantity', required: false, default: 0 })
  stockQuantity?: number;

  @ApiProperty({ description: 'Shop quantity', required: false, default: 0 })
  shopQuantity?: number;

  @ApiProperty({
    description: 'ID of the provider',
    type: String,
    required: false,
  })
  fournisseur?: string;

  @ApiProperty({
    description: 'Type of article (primary classification)',
    required: false,
  })
  type?: string;

  @ApiProperty({
    description: 'Pinned for the order-service quick-access banner',
    default: false,
    required: false,
  })
  featured?: boolean;

  @ApiProperty({
    description: 'Employee commission % applied per sale (e.g. 1, 1.5, 2.25)',
    default: 0,
    required: false,
  })
  commissionPercent?: number;
}
