import { Body, Controller, Get, Post, Headers } from '@nestjs/common';
import { AppService, GeneralObject } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get("creahoja")
  creaHoja(){
    this.appService.agregaHoja()
    return "creado"
  }
  @Get("listaregistros")
  async listaRegistros(){
    
    return await this.appService.listaRegistros()
  }
  @Post('agregaregistro')
  agregaRegistro(
    @Body() cuerpo:any,
    @Headers('authorization') autorization:string//interceptada por medio de LoggingInterceptor la cabecera que trae el token
  ){
    console.log(cuerpo,autorization)

  }
}
let string_number:Array<string | number>=[]
function getValuesFromObject(ob:GeneralObject ){
  Object.keys(ob).forEach((key:string)=>{
    if(typeof ob[key] === "string" || typeof ob[key] === "number"){
      if(key !== "_prefix"){
        string_number.push(ob[key])
      }
    }
    if(typeof ob[key] === "object"){
      getValuesFromObject(ob[key])
    }
  })
  return string_number
}