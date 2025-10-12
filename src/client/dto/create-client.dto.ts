import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ description: 'First name of the client' })
  firstName: string;

  @ApiProperty({ description: 'Last name of the client' })
  lastName: string;

  @ApiProperty({ description: 'Email of the client', required: false })
  email?: string;

  @ApiProperty({ description: 'Phone number', required: false })
  phone?: string;

  @ApiProperty({ description: 'Address', required: false })
  address?: string;

  @ApiProperty({ description: 'Loyalty points', required: false, default: 0 })
  loyaltyPoints?: number;

  @ApiProperty({
    description: 'Array of purchased Article IDs',
    type: [String],
    required: false,
  })
  purchases?: string[];

  @ApiProperty({
    description: 'Array of WorkOrder IDs',
    type: [String],
    required: false,
  })
  services?: string[];
}
