import { Body, Controller, Get, Param, UseInterceptors, Post, Res,Req,UploadedFile,Headers, BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';
import { FilterQuery } from 'mongoose';
import { templateValorizacionURL } from '../../shared/configGobal';
import { CreaObraDto, listaObrasPorUsuarioIdDto } from '../dtos/crud.obra';
import { ObraEntity } from '../entity/obra.entity';
import { ObraService } from '../services/obra.servicio';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs'
import { JwtService } from '@nestjs/jwt';

@Controller('obra')
export class ObraController {
    constructor(
        private obraService:ObraService,
        private jwtService: JwtService,
    ){}
    @Get('obraById')
    async obraById(
      @Body() obraId:string
    ){
      return await this.obraService.buscaObraByIdObra(obraId)
    }
    @Get('listaobras')
    async getObras(): Promise<ObraEntity[]> {
        return this.obraService.listaObras();
    }
    
    @Get(':usuarioId')
    async getObraByUserId(
        @Param('usuarioId') otrousuarioId: string,
        ): Promise<ObraEntity[]> {

      return this.obraService.buscaObraPorUsuarioId(otrousuarioId );
    }  
    @UseInterceptors(
        FileInterceptor('file')
      )
    @Post('crea')
    async createObra(
      //cada obra nueva es una nueva carpeta
      @UploadedFile() file:Express.Multer.File,
      @Body() obraId:any,
      @Headers('authorization') autorization:string//interceptada por medio de LoggingInterceptor la cabecera que trae el token
      ): Promise<any> {
        
        if(!file){
          throw new BadRequestException("file is not a imagen")
        }
        const body = {
          autorization,
          file,
          obraId


        }
        
        
            
        return this.obraService.creaObra(body)
        
    }
    @Get('logocabecera/:filename')
    async getPicture(
      //  @Param('usuarioid') usuarioid:any,
        @Param('filename') filename:any, 
        @Res() res:Response,
        
    ){
    //necesitas cargar desde aca lo necesario para que path file name no dependa  de agrgarevidenciafotografica
    
     const filePath = `./uploads/cabeceras`
            
        res.sendFile(filename,{root:`${filePath}`})
    }

    @Get('plantilla/descargaplantilla')//funciona
    downloadTemplateFileXls(@Res() ponse: Response):string{

        ponse.download(`${templateValorizacionURL().recurso}`)
        return "ARCHIVO DESCARGADO" 
    
    }
    
}
