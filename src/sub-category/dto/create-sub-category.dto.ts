import { ApiProperty } from '@nestjs/swagger';

export class CreateSubCategoryDto {
  @ApiProperty({ description: 'Sub-category name', example: 'Clé plate' })
  name: string;

  @ApiProperty({
    description: 'Parent category ID',
    type: String,
    example: '60f6c0b3b3d1c12d34e1f000',
  })
  category: string;

  @ApiProperty({
    description: 'Whether the sub-category is active',
    default: true,
    required: false,
  })
  active?: boolean;
}
