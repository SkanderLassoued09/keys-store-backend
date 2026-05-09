import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkOrderDto {
  @ApiProperty({ example: 'Fix Door', description: 'Name of the work order' })
  name: string;

  @ApiProperty({ example: 'Fix broken lock', required: false })
  description?: string;

  @ApiProperty({ example: 50 })
  price: number;

  @ApiProperty({ example: 2, required: false })
  duration?: number;

  @ApiProperty({
    enum: ['article', 'service'],
    default: 'article',
    required: false,
  })
  entryType?: 'article' | 'service';

  @ApiProperty({
    example: '60f6c0b3b3d1c12d34e1f000',
    required: false,
    description: 'Article reference for entryType=article line items',
  })
  article?: string;

  @ApiProperty({ example: '60f6c0b3b3d1c12d34e1f123', required: false })
  employee?: string;

  @ApiProperty({ example: '60f6c0b3b3d1c12d34e1f456', required: false })
  client?: string;

  @ApiProperty({ example: '60f6c0b3b3d1c12d34e1f789', required: false })
  machine?: string;

  @ApiProperty({ enum: ['pending', 'in-progress', 'done'], default: 'pending' })
  status?: string;

  @ApiProperty({
    description:
      'Snapshotted commission percentage applied to this line. For articles, the backend overrides with the current Article.commissionPercent.',
    default: 0,
    required: false,
  })
  commissionPercent?: number;

  @ApiProperty({
    description:
      'Computed prime (price × commissionPercent / 100). Always recomputed server-side.',
    default: 0,
    required: false,
  })
  calculatedPrime?: number;
}
