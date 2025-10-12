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

  @ApiProperty({ example: '60f6c0b3b3d1c12d34e1f123', required: false })
  employee?: string;

  @ApiProperty({ example: '60f6c0b3b3d1c12d34e1f456', required: false })
  client?: string;

  @ApiProperty({ example: '60f6c0b3b3d1c12d34e1f789', required: false })
  machine?: string;

  @ApiProperty({ enum: ['pending', 'in-progress', 'done'], default: 'pending' })
  status?: string;
}
