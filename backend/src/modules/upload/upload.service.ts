import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { Request } from 'express';

@Injectable()
export class UploadService {
  private readonly uploadsPath = '/app/uploads';

  // Configuração do multer para imagens
  getImageStorage() {
    return diskStorage({
      destination: `${this.uploadsPath}/images`,
      filename: (req: Request, file: Express.Multer.File, callback) => {
        const uniqueName = `${uuid()}${extname(file.originalname)}`;
        callback(null, uniqueName);
      },
    });
  }

  // Configuração do multer para PDFs
  getPdfStorage() {
    return diskStorage({
      destination: `${this.uploadsPath}/pdfs`,
      filename: (req: Request, file: Express.Multer.File, callback) => {
        const uniqueName = `${uuid()}${extname(file.originalname)}`;
        callback(null, uniqueName);
      },
    });
  }

  // Filtro para validar tipos de arquivo
  imageFileFilter = (req: Request, file: Express.Multer.File, callback: Function) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
      return callback(new Error('Apenas arquivos JPG, JPEG e PNG são permitidos!'), false);
    }
    callback(null, true);
  };

  pdfFileFilter = (req: Request, file: Express.Multer.File, callback: Function) => {
    if (file.mimetype !== 'application/pdf') {
      return callback(new Error('Apenas arquivos PDF são permitidos!'), false);
    }
    callback(null, true);
  };

  // Gerar URL pública para o arquivo
  getPublicUrl(fileName: string, type: 'images' | 'pdfs'): string {
    return `/uploads/${type}/${fileName}`;
  }
}