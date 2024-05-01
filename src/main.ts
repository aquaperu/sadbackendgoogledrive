import { ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';


async function bootstrap() {
  const app = await NestFactory.create(AppModule,{cors:true});
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:true,
      forbidNonWhitelisted:true,
      transform:true
    })
  )
  const writelist = [
    "https://localhost:4200",
    "http://localhost:4200",
    "http://localhost:4200/*",
   // "https://192.168.1.86:4444/*",
    "https://192.168.1.86:4444",
    "https://legendary-space-fiesta-69vxg6jqp77xf49rg-5000.app.github.dev/",
    "https://legendary-space-fiesta-69vxg6jqp77xf49rg-5000.app.github.dev",
    "https://legendary-space-fiesta-69vxg6jqp77xf49rg-5000.app.github.dev/*",
    "https://legendary-space-fiesta-69vxg6jqp77xf49rg-5000.app.github.dev/autenticar/login",
    "https://miniature-space-zebra-7v7j9qg6xrjx266g-4200.app.github.dev/",
    "https://miniature-space-zebra-7v7j9qg6xrjx266g-4200.app.github.dev",
    "https://4200-monospace-sadfrontenddrive17-1713883251017.cluster-2xid2zxbenc4ixa74rpk7q7fyk.cloudworkstations.dev",
    "https://4200-monospace-sadfrontenddrive17-1713883251017.cluster-2xid2zxbenc4ixa74rpk7q7fyk.cloudworkstations.dev/",
   
    
    "*"
  ]
  const corsOptions: CorsOptions = {
    origin: function(origin,callback){
      if(writelist.indexOf(origin) !== -1 || !origin ){
        callback(null,true);
      }else{
        callback(new Error("not allow by corsw"))
      }
    },
    methods: '*',
    credentials: true,
    optionsSuccessStatus: 204,
  };
  app.enableCors(corsOptions);
  
  useContainer(app.select(AppModule), {fallbackOnErrors: true}); 
  await app.listen(process.env.PORT || 3000,()=>{
    console.log(`on port: ${process.env.PORT}`)
  });
}
bootstrap();
