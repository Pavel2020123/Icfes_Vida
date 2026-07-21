import { BadRequestException } from '@nestjs/common';
import { memoryStorage } from 'multer';

// A diferencia del logo, el CSV no se guarda en disco: solo se lee su
// contenido en memoria para crear los estudiantes y luego se descarta.
const TAMANO_MAXIMO_BYTES = 2 * 1024 * 1024; // 2MB (varios miles de filas)

const TIPOS_MIME_PERMITIDOS = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/csv',
  'text/plain',
];

export const csvMulterOptions = {
  storage: memoryStorage(),
  limits: {
    fileSize: TAMANO_MAXIMO_BYTES,
  },
  fileFilter: (_req, archivo, callback) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const nombreValido = (archivo.originalname as string)
      .toLowerCase()
      .endsWith('.csv');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const tipoValido = TIPOS_MIME_PERMITIDOS.includes(archivo.mimetype);

    if (!nombreValido || !tipoValido) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      callback(
        new BadRequestException(
          'El archivo debe ser un CSV (.csv) con las columnas nombre, correo, contrasena.',
        ),
        false,
      );
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    callback(null, true);
  },
};
