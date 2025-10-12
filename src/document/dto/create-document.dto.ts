import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({ description: 'Title of the bill' })
  title: string;

  @ApiProperty({ description: 'Description of the bill' })
  description: string;

  @ApiProperty({ description: 'Type of the document (e.g., invoice, receipt)' })
  type: string;

  @ApiProperty({ description: 'ID of the provider', type: String })
  fournisseur: string;

  @ApiProperty({ description: 'ID of the employee', type: String })
  employee: string;
}
