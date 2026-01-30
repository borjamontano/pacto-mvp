import { IsEnum, IsString } from 'class-validator';
import { DevicePlatform } from '@prisma/client';

export class RegisterDeviceDto {
  @IsString()
  expoPushToken!: string;

  @IsEnum(DevicePlatform)
  platform!: DevicePlatform;
}
