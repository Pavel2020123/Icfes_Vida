import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  obtenerEstado() {
    return { status: 'OK', servicio: 'ICFES Vida backend funcionando' };
  }
}
