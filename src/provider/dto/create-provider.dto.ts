import { ApiProperty } from '@nestjs/swagger';

export class CreateProviderDto {
  @ApiProperty({ description: 'Name of the provider' })
  name: string;

  @ApiProperty({ description: 'Company name', required: false })
  company?: string;

  @ApiProperty({ description: 'Email address', required: false })
  email?: string;

  @ApiProperty({ description: 'Phone number', required: false })
  phone?: string;

  @ApiProperty({ description: 'Address', required: false })
  address?: string;

  @ApiProperty({
    description: 'Array of Article IDs',
    type: [String],
    required: false,
  })
  articles?: string[];

  @ApiProperty({
    description: 'Array of Machine IDs',
    type: [String],
    required: false,
  })
  machines?: string[];

  @ApiProperty({
    description: 'Array of Bill IDs',
    type: [String],
    required: false,
  })
  bills?: string[];
}
