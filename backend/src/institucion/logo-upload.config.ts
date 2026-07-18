import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { diskStorage } from 'multer';

// Carpeta donde quedan guardados los logos subidos.
// NOTA: por ahora usamos disco local en vez de Supabase Storage (solo da
// 7 días gratis). Cuando migremos, este archivo es el único que hay que
// cambiar: basta con reemplazar `diskStorage` por la subida a Supabase.
export const CARPETA_LOGOS = join(process.cwd(), 'uploads', 'logos');
mkdirSync(CARPETA_LOGOS, { recursive: true });

const TIPOS_PERMITIDOS = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
];
const TAMANO_MAXIMO_BYTES = 3 * 1024 * 1024; // 3MB

export const logoMulterOptions = {
  storage: diskStorage({
    destination: CARPETA_LOGOS,
    filename: (_req, archivo, callback) => {
      const extension = extname(archivo.originalname).toLowerCase() || '.png';
      callback(null, `${randomUUID()}${extension}`);
    },
  }),
  limits: {
    fileSize: TAMANO_MAXIMO_BYTES,
  },
  fileFilter: (_req, archivo, callback) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    if (!TIPOS_PERMITIDOS.includes(archivo.mimetype)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      callback(
        new BadRequestException(
          'Solo se permiten imágenes en formato PNG, JPG, WEBP o GIF.',
        ),
        false,
      );
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    callback(null, true);
  },
};
