import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { PactStatus } from '@prisma/client';

export class UpdatePactDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsOptional()
  @IsString()
  assignedToUserId?: string | null;

  @IsOptional()
  @IsDateString()
  dueAt?: string | null;

  @IsOptional()
  @IsEnum(PactStatus)
  status?: PactStatus;

  @IsOptional()
  @IsBoolean()
  requiresConfirmation?: boolean;
}
