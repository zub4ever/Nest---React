import { 
  Controller, 
  Post, 
  UploadedFiles, 
  UseInterceptors, 
  UseGuards,
  BadRequestException
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('images')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: '/app/uploads/images',
        filename: (req, file, cb) => {
          const uniqueName = uuidv4() + extname(file.originalname);
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return callback(new Error('Apenas arquivos JPG, JPEG e PNG são permitidos!'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB por arquivo
        files: 10, // Máximo 10 arquivos
      },
    })
  )
  async uploadImages(@UploadedFiles() files: Array<Express.Multer.File>) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    // Retornar URLs públicas
    const urls = files.map(file => 
      this.uploadService.getPublicUrl(file.filename, 'images')
    );

    return {
      success: true,
      urls,
      count: urls.length,
    };
  }

  @Post('pdfs')
  @UseInterceptors(
    FilesInterceptor('pdfs', 5, {
      storage: diskStorage({
        destination: '/app/uploads/pdfs',
        filename: (req, file, cb) => {
          const uniqueName = uuidv4() + extname(file.originalname);
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (file.mimetype !== 'application/pdf') {
          return callback(new Error('Apenas arquivos PDF são permitidos!'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB por arquivo
        files: 5, // Máximo 5 arquivos PDF
      },
    })
  )
  async uploadPdfs(@UploadedFiles() files: Array<Express.Multer.File>) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    // Retornar URLs públicas
    const urls = files.map(file => 
      this.uploadService.getPublicUrl(file.filename, 'pdfs')
    );

    return {
      success: true,
      urls,
      count: urls.length,
    };
  }
}