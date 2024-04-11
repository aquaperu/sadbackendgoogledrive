import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { HttpModule } from '@nestjs/axios';
import { configLoader } from 'config-loader';
import { envSchema } from 'env-schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ManagergoogledriveModule } from './managergoogledrive/managergoogledrive.module';
import { GoogleDriveConfig } from './managergoogledrive/types/GoogleDriveConfig';
import { GoogleDriveService } from './managergoogledrive/services/googleDriveService';
//import { ObraModule } from './obra/obra.module';
//import { PresupuestoModule } from './presupuesto/presupuesto.module';
//import { ValorizacionModule } from './valorizacion/valorizacion.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      load:[configLoader],
      validationSchema:envSchema
    }),
    //modulo de configuracion de la base de datos mongo con mongoose
    MongooseModule.forRootAsync({
      imports:[ConfigModule],
      inject: [ConfigService],
      useFactory:(configService:ConfigService)=> {
        const mongoConfig = configService.get("mongo")
        return {
            uri: mongoConfig.uri
          }
        }, 
      }),
    HttpModule,
    ManagergoogledriveModule.register({//el accouint es como servicio de google
      "type": "service_account",
      "project_id": "sadsinfactura",
      "private_key_id": "70808a05a5e17813ee62ae5d0444a5390948ed7e",
      "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDUIiJlNWyh9ETK\nY35KRKlQwH9FKOzHC6Yuhd5dOCjNL3EuBOoF+JoSACfAQMBpqwdn4O59OB26qE2a\nagdZxOVGylT/Id+cCiHc7ZrGkwy4AK5fEZzgY7g4yG1zevs6JXCWLpy4+mUaPsAo\n+AJrIpoSnSkP4Men9owqfwDX+KYZddcoEobswZ2R2y4DueYMWLARxCoD8/i4tpmC\nCuGt5tyd9mQnt2tqyA2MV3QdFShstMFHji7XEt0jzBnpXL154hGQzgb9UJMoXTwo\nny4KEUbmy1XZO5sqE6z3KZ+VR9JN7OemQxW6m0zDpaOJlffXLrtq5/xwExO3Cc1h\ny3Y0bdSJAgMBAAECggEABzQN3HIduVB7idl/4e2RHUxIFhUKGJvhPakEkGr2Mbon\nxaMGP6591tjOq2qCI3nFXjDnEEqjRyHCGYP6XMFA8trZ24cEL5QwKwRzfMTktJaA\nqqWaYOE/UchL39UVf6zin5WUyKWSC3va18P3hblOp41S0LahOPzNgio+tla7wddX\neO8z4EF0V0DuskOzm42SoeaC9TLlq30l6OSXfPYPJb5PbhKmQ+rzcqurnAH2YiKK\nlvlwT0SVxEzej6J0xmA5Wc6WNoeHfRkTgGC5lyZpe0D44xy8saRUDabr9oJGgkDp\nVvE0/Avl2Uc6YPlcht16VIGgWXFbsSvTMoJ6wHQofQKBgQDrm652nBoa2s94Lnn1\ny+Kw3ZyvGpwPelum6rk3dS8lICgmJoRfUHaVD9wQTedZ1cQD+m2UYAwPzM7W+EvO\nxy+7FOrpqAA0GUm7eFJUPNaShT+TmzmrzBi/w+/+xE9azsnPvv1R6RegMPneBYjy\nl3Rk84hRBzoHtyosW4haAqi95QKBgQDmflOxb3lwDjNzb3SyUwStD/9jP2fvaToC\n7k3fdROd8CepZLRukwWwF238Ig2ZqZggmmYKw06AxzzkP5+MJGsHU7MHHkLcvSAu\n88fCZZyQlhCH5n2BKJ7nuBLlbs8cG5zO+BdKLbCWiHtJGg6hgcuqllKyY9Rc5Oy6\ntK6oGAMx1QKBgCk6WNEQh9DjMSLKnzTPtJ9WaDCL63sZ4ifXMwntS46njd7/JnK3\nVcjHua5ws2cY7O/1Rm+MTxAEur0LPdi1KjkGdATnDQIQ2sIfT+jFrJZ/Epz1sKXL\nVRlZZAmkuG4feVkNBq7qpuO1LkQXm9s3fXqc0uG67gCjoJGagsWdaYGxAoGAUuN7\nFYQRF8sDla+vN7HDLLlkDjzvE5mz0vn/5ywjMdj7al9cw6b7lKfYVaOpYGks3Ayq\nRZSW1pjPvQVkSvGNy8S9zQGE6fzZZgkk/TOtahGNQFITMC97dbksknWW5XTIn2V4\neqSTrI7IRzGnsU0MAPyuIJjl9cIdn8b6SFjaTUECgYEApAfUQRscw+FAWqV9VHEa\nX8zHgtGWZoV7A3MHBFtAKtthjxIPnmqdqH9WLx0rbfU4IxYusEe+Vfl6Ojp+tGDi\nBv+2rPuVlLKu3pSGwgP7q9q1MZXVb7pBBn4PpSo3JC4Wlsctjh3PLC3Zomf/v30p\nmW+yf0fdk+LwAE3FOgEmqgo=\n-----END PRIVATE KEY-----\n",
      "client_email": "uploadsad@sadsinfactura.iam.gserviceaccount.com",
      "client_id": "113667831469732179437",
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/uploadsad%40sadsinfactura.iam.gserviceaccount.com",
      "universe_domain": "googleapis.com"
       
    }as GoogleDriveConfig,
    '1VDf6sK9Whc3SMwRgPMP9jl8KQ1b5lf7t',//carpeta base SAD
    ),
    ConfigModule.forRoot(),
    AuthModule,
    //ObraModule,
    //PresupuestoModule,
    //ValorizacionModule,


  ],
  controllers: [AppController],
  providers: [AppService,GoogleDriveService,ConfigModule],
})
export class AppModule {}
