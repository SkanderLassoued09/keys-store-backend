import { ApiProperty } from '@nestjs/swagger';
import type { ArticleReturnType } from '../entities/article-return.entity';

export class CreateArticleReturnDto {
  @ApiProperty({ required: false })
  originalWorkOrder?: string;

  @ApiProperty()
  originalArticle: string;

  @ApiProperty({ required: false })
  customerName?: string;

  @ApiProperty()
  employee: string;

  @ApiProperty({ required: false })
  returnDate?: Date;

  @ApiProperty({ enum: ['REPLACED', 'REFUNDED'] })
  returnType: ArticleReturnType;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty({ required: false })
  repairAction?: string;

  @ApiProperty({ required: false })
  replacementArticle?: string;

  @ApiProperty({ default: 1, required: false })
  replacementQuantity?: number;

  @ApiProperty({ default: 0, required: false })
  refundedAmount?: number;
}
