import { ApiProperty } from '@nestjs/swagger';

export class CreateMachineDto {
  @ApiProperty({ description: 'Name of the machine' })
  name: string;

  @ApiProperty({
    description: 'Image URL or base64 data URI for the machine card',
    required: false,
  })
  image?: string;

  @ApiProperty({ description: 'Type of the machine', required: false })
  type?: string;

  @ApiProperty({ description: 'Serial number of the machine', required: false })
  serialNumber?: string;

  @ApiProperty({
    description: 'ID of the provider',
    type: String,
    required: false,
  })
  fournisseur?: string;

  @ApiProperty({ description: 'Purchase date of the machine', required: false })
  purchaseDate?: Date;

  @ApiProperty({
    description: 'Status of the machine',
    enum: ['active', 'maintenance', 'retired', 'sold'],
    default: 'active',
  })
  status?: string;
}
