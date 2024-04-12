import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/services/auth.service';
import { LoggingInterceptor } from 'src/auth/services/interceptortoken.service';
import { JwtauthguardService } from 'src/auth/services/jwtauthguard.service';
import { JwtstrategyService } from 'src/auth/services/jwtstrategy.service';
//import { PictureInterceptor } from 'src/valorizacion/services/pictureInterceptor';
import { ObraController } from './controller/obra.controller';
import { ObraEntity } from './entity/obra.entity';
import { IOBRA_REPOSITORY } from './patronAdapter/obra.interface';
import { ObraMongoRepository } from './patronAdapter/obra.mongo.repository';
import { OBRA_SCHEMA } from './schema/obra.schema';
import { ObraService } from './services/obra.servicio';

@Module({
  imports:[
    MongooseModule.forFeature([
      {
        name:ObraEntity.name,schema:OBRA_SCHEMA
      }
    ]),
    //modules de negocio
    AuthModule
  ],
  exports:[
    ObraService,
    {provide:IOBRA_REPOSITORY,useClass:ObraMongoRepository},
  ],
  providers:[
    ObraService,
    AuthService,
    {provide:IOBRA_REPOSITORY,useClass:ObraMongoRepository},
    JwtstrategyService, JwtauthguardService, LoggingInterceptor,JwtService],
  controllers: [ObraController]
})
export class ObraModule {}
