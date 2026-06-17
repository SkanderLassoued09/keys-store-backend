import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Settings } from './entities/settings.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings.name)
    private readonly settingsModel: Model<Settings>,
  ) {}

  // Lazily create the single settings document the first time it's read.
  async get(): Promise<Settings> {
    let settings = await this.settingsModel.findOne().exec();
    if (!settings) {
      settings = await this.settingsModel.create({
        serviceCommissionPercent: 0,
      });
    }
    return settings;
  }

  async update(updateSettingsDto: UpdateSettingsDto): Promise<Settings> {
    const sanitized: Record<string, any> = {};
    if (updateSettingsDto.serviceCommissionPercent !== undefined) {
      sanitized.serviceCommissionPercent = Math.max(
        0,
        Number(updateSettingsDto.serviceCommissionPercent) || 0,
      );
    }
    return this.settingsModel
      .findOneAndUpdate({}, { $set: sanitized }, { new: true, upsert: true })
      .exec();
  }
}
