import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ValorizacionController } from './controller/valorizacion.controller';
import { ValorizacionEntity } from './entity/valorizacion.entity';
import { IVALORIZACION_REPOSITORY } from './patronAdapter/valorizacion.interface';
import { ValorizacionMongoRepository } from './patronAdapter/valorizacion.mongo.repository';
import { VALORIZACION_SCHEMA } from './schema/valorizacion.schema';
import { ValorizacionService } from './services/valorizacion.service';

import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/shared/configGobal';
import { LoggingInterceptor } from 'src/auth/services/interceptortoken.service';
import { JwtauthguardService } from 'src/auth/services/jwtauthguard.service';
import { JwtstrategyService } from 'src/auth/services/jwtstrategy.service';
import { AuthModule } from 'src/auth/auth.module';

import { HttpModule } from "@nestjs/axios";
import { ObraModule } from 'src/obra/obra.module';
import { ObraService } from 'src/obra/services/obra.servicio';
import { IPADRE_REPOSITORY } from './patronAdapter/adapter.ts';
import { SaludoDePersona } from './patronAdapter/adaptaAPersona/persona';
import { Padre } from './services/polimorfismo/padre';
import { Hijo } from './services/polimorfismo/hijo';

@Module({
  imports:[
    HttpModule,
    AuthModule,
    ObraModule,
    

    MongooseModule.forFeature([{name:ValorizacionEntity.name,schema:VALORIZACION_SCHEMA}]),
      JwtModule.register({
        secret:jwtConstants.secret,
        signOptions:{expiresIn:'1d'}
      }),

      
  ],
  providers: [
    
    ValorizacionService,
    ObraService,
    {provide:IVALORIZACION_REPOSITORY,useClass:ValorizacionMongoRepository},
    JwtstrategyService, JwtauthguardService, LoggingInterceptor,
    Padre, Hijo,
    {provide:IPADRE_REPOSITORY,useClass:SaludoDePersona}
    ],
  controllers: [ValorizacionController]
})
export class ValorizacionModule {}
