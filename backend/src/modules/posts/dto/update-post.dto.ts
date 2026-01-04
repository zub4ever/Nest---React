import { IsString, IsOptional, IsArray, MaxLength } from 'class-validator';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageAttachments?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pdfAttachments?: string[];
}