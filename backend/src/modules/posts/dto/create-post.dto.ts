import { IsString, IsNotEmpty, IsOptional, IsArray, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageAttachments?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pdfAttachments?: string[];
}