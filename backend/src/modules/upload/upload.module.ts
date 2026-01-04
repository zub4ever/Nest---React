import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          // Determinar pasta baseado no tipo de arquivo
          if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
            cb(null, '/app/uploads/images');
          } else if (file.mimetype === 'application/pdf') {
            cb(null, '/app/uploads/pdfs');
          } else {
            cb(new Error('Tipo de arquivo não suportado'), '');
          }
        },
        filename: (req, file, cb) => {
          const uniqueName = `${uuid()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}