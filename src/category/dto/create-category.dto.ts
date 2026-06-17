import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Category name', example: 'Clé Maison' })
  name: string;

  @ApiProperty({
    description: 'Category image URL or base64 data URI',
    required: false,
  })
  image?: string;

  @ApiProperty({
    description: 'Whether the category is active',
    default: true,
    required: false,
  })
  active?: boolean;
}
