import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthDto } from '../dtos/auth.dto';
import { AuthService } from '../services/auth.service';
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
  
    @Post('register')
    registerUser(@Body() createAuthDto: AuthDto)
    {
      
       return this.authService.create(createAuthDto);
    }
    
    @Post('login')//genera un nuevo token para el cliente
    loginUserv1(@Req() req:Request)
    {
       return this.authService.login(req.body)
       
    }
    @Get('listaauth')
    lista(){
      return this.authService.lista()

    }
    @Get(':token')
    async buscaUsuario(@Param('token') token: string){
       return await this.authService.buscarUsuario(token) 
    }
}
