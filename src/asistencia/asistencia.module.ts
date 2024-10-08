import { Module } from '@nestjs/common';
import { AsistenciaService } from './services/asistencia/asistencia.service';
import { AsistenciaController } from './controllers/asistencia.service';

@Module({
  providers: [AsistenciaService],
  controllers:[AsistenciaController]
})
//el control de asistencia usara como base de datos a xls.
export class AsistenciaModule {}
