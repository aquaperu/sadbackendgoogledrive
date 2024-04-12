import { ConflictException, HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'


import { AuthDto } from '../dtos/auth.dto';
import { AuthEntity } from '../entity/auth.entity';
import { IAuthRepository, IAUTH_REPOSITORY } from '../patronAdapter/auth.interface.repository';
import { GoogleDriveService } from '../../googledrivecasa/services/googledrive.service';


@Injectable()
export class AuthService {
    constructor(
        @Inject(IAUTH_REPOSITORY) private authRepository:IAuthRepository,
        private jwtService:JwtService,
        private readonly googleDriveService: GoogleDriveService,
        ){ }

    async validateUser(email:string,password:string):Promise<any>{
        const usuario = await this.authRepository.findOne({email});
        if(usuario && usuario.password === password){
          const {password, email, ...rest} = usuario;
            return rest
        }
        console.log('no tiene permiso')
        throw new UnauthorizedException()
        
    }
    async login(userObjectLogin:AuthDto){

        const {email, password} = userObjectLogin;

        const findUser = await this.authRepository.findOne({email})
        
        if(!findUser){
            console.log('usuario no encontrado')
            throw new HttpException('USER_NOT_FOUND',404)
          } 
          
          const checkPaswword = await bcrypt.compare(password,findUser.password);
          
          if(!checkPaswword) {
            console.log('password no coincide')
            throw new HttpException('PASSWORD_NOT_FOUND',403)
          }
          const payload = {
            id:findUser.usuarioId,
            email:findUser.email
          }
          const token:string =  this.jwtService.sign(payload)
          const data = {
            usuario : findUser,
            token
          }
          
          return data
    }
    async create(userObjectCreate: AuthDto) {
      const {email} = userObjectCreate
        const usrExist = await this.authRepository.findOne({email})
        if(usrExist){
            throw new ConflictException("Usuario Registrado")
        }
      
      const {password} = userObjectCreate;
      
      const plainToHash = await bcrypt.hash(password,10);
       
      userObjectCreate  = {...userObjectCreate, password:plainToHash}
     
        
      const usuario = await this.authRepository.register(userObjectCreate)
     
      const usuarioFolderId =    await this.googleDriveService.crearCarpeta(
            '1aT_8H66m-3yQWeCwfEKNvRHRB_6WAEWy',//carpeta base, es la carpeta creada en drive destinada a almacenar sad. No se modifica.
            usuario.usuarioId)
      const logoFolderId = await this.googleDriveService.crearCarpeta(
        usuarioFolderId,
        'Logo'
      )

      await this.actualizaFolderId(usuario.usuarioId,usuarioFolderId)
      await this.actualizaLogoFolderId(usuario.usuarioId,logoFolderId)
      

      return usuario

    }
    async lista(){
      return this.authRepository.lista()
    }
    
    async buscarUsuario(token:string){
      
      return this.jwtService.decode(token)
      

    }
    async actualizaFolderId(usuarioId:string,usuarioFolderId:string){
      const body:AuthEntity={
        usuarioId:usuarioId,
        email:"",
        password:"string",
        usuarioFolderId,
        logoFolderId:""
      }  
      
      return await this.authRepository.actualizaFolderId(body,{usuarioFolderId})

    }
    async actualizaLogoFolderId(usuarioId:string,logoFolderId:string){
      const body:AuthEntity={
        usuarioId:usuarioId,
        email:"",
        password:"string",
        usuarioFolderId:"",
        logoFolderId
      }
      return await this.authRepository.actualizaLogoFolderId(body,{logoFolderId})
    
    }
    
    
    
}

  
