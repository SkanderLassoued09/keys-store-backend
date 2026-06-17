import { ApiProperty } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiProperty({
    description:
      'Global commission % applied to services performed by employees',
    required: false,
    default: 0,
  })
  serviceCommissionPercent?: number;
}
