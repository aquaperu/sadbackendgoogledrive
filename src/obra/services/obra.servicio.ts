import { Inject, Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { ActualizaFolderId, ActualizaLogoFolderId, CreaObraDto, listaObrasPorUsuarioIdDto } from '../dtos/crud.obra';
import {  ObraEntity } from '../entity/obra.entity';
import { IObraRepository, IOBRA_REPOSITORY } from '../patronAdapter/obra.interface';
import { JwtService } from '@nestjs/jwt';

import { IAuthRepository, IAUTH_REPOSITORY } from 'src/auth/patronAdapter/auth.interface.repository';
import { GoogleDriveService } from '../../googledrivecasa/services/googledrive.service';


@Injectable()
export class ObraService {
    constructor(
        @Inject(IOBRA_REPOSITORY) private iobraRepository:IObraRepository,
        @Inject(IAUTH_REPOSITORY) private authRepository:IAuthRepository,
        private readonly jwtService:JwtService,
        private readonly googleDriveService: GoogleDriveService,
    ){}
    
    async creaObra(body: any)
    //:Promise<ObraEntity> 
    {
        console.log({"en el cuerpo":body.autorization})
        const jwt = body.autorization//.replace('Bearer ', '');   
        console.log({"en el servidor jwt": jwt})
        const usuarioLogin:string | { [key: string]: any; } = this.jwtService.decode(jwt) 
        const usuarioId = usuarioLogin['id']
        //busca al usuario registrado, para obtener el usuarioFolderId, logoFolderId
        const usuario = await this.authRepository.findOne({email:usuarioLogin["email"]})
        //la obra es nueva 
        const logoUrl = await this.subeImagenADrive(body.file,usuario.logoFolderId)
        const obra = await  this.iobraRepository.creaObra({"usuarioId":usuarioId,"logoUrl":logoUrl,"obraFolderId":"",logoFolderId:usuario.logoFolderId})
        const obraFolderId = await this.creaCarpeta(usuario.usuarioFolderId,obra.obraId)
        await this.actualizaFolderId(obra.obraId,obraFolderId)
                 
        return obra
    }
    async creaCarpeta(folderadreId:string,nombreCarpeta:string){
        return await this.googleDriveService.crearCarpeta(folderadreId,nombreCarpeta)
    }
    async subeImagenADrive(file:Express.Multer.File,idForGoogleElement: string){

        return await this.googleDriveService.subirImagen(file,idForGoogleElement)
    }

    async buscaObraByIdObra(obraId:string ): Promise<ObraEntity> {
        const  entityFilterQuery: FilterQuery<ObraEntity> = {
            obraId:obraId,
            
        }
        return await this.iobraRepository.buscaObraByObraId(entityFilterQuery)
    }
    /*async actualizaObra(obraId:string, actualizaObraDto:ActualizaObraDto): Promise<Obra> {
        return await this.iobraRepository.actualizaObra({obraId},actualizaObraDto)
    }*/
    async listaObras(){
        return await this.iobraRepository.listaObras({})
    }
    async buscaObraPorUsuarioId(usuarioId:string){
        
        return await this.iobraRepository.listaObrasPorUsuarioId({usuarioId})

    }
    async actualizaFolderId(obraId:string,obraFolderId:string){
        const body:ObraEntity={
          logoUrl:"",
          obraFolderId,
          obraId,
          usuarioId:"",
          logoFolderId:""
        }  
        
        return await this.iobraRepository.actualizaFolderId(body,{obraFolderId})
  
    }
    async actualizaLogoFolderId(obraId:string,logoFolderId:string){
        const body:ActualizaLogoFolderId={
          
          logoFolderId,
          obraId:"",
          
        }  
        
        return await this.iobraRepository.actualizaLogoFolderId(body,{logoFolderId})
  
    }
   
   
}
