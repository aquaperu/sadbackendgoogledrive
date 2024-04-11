import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { JwtstrategyService } from './services/jwtstrategy.service';
import { JwtauthguardService } from './services/jwtauthguard.service';
//import { UsuarioModule } from '../usuario/usuario.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';



import { LoggingInterceptor } from './services/interceptortoken.service';
import { AuthController } from './controller/auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthEntity } from './entity/auth.entity';
import { AUTH_SCHEMA } from './schema/auth.schema';
import { AuthMongoRepository } from './patronAdapter/auth.mongo.repository';
import { IAUTH_REPOSITORY } from './patronAdapter/auth.interface.repository';

export const jwtConstants = {
  secret:'mysemilla'
}


@Module({
  imports:[
    
    JwtModule.register({
      secret:jwtConstants.secret,
      signOptions:{expiresIn:'1d'}
    }),
    MongooseModule.forFeature(
      [
          {
              name:AuthEntity.name,schema:AUTH_SCHEMA
          }
      ]),
    
    //UsuarioModule,
    PassportModule
  ],
    providers: [
      AuthService,
      JwtstrategyService, JwtauthguardService, LoggingInterceptor,
      {provide:IAUTH_REPOSITORY,useClass:AuthMongoRepository}
    ],
  exports:[
    AuthService,
    PassportModule,
    JwtstrategyService,
    JwtauthguardService,
    {provide:IAUTH_REPOSITORY,useClass:AuthMongoRepository}
  ],
  controllers: [AuthController]
})
export class AuthModule {}

