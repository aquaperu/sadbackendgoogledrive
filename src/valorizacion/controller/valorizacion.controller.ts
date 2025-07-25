import { BadRequestException, Body, Controller, Get, Headers, Param, Patch, Post, Put, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { diskStorage } from 'multer';
import { AgregaevidenciafotograficaDto } from '../dtos/crud.valorizacion.dto';
import { ValorizacionEntity } from '../entity/valorizacion.entity';
import { IIndice, ISeparador, ValorizacionService } from '../services/valorizacion.service';
import * as fs from 'fs'

import { LoggingInterceptor } from 'src/auth/services/interceptortoken.service';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { fixPathAssets, fixPathEspecificacionesTecnicas, fixPathFromSRC } from 'src/shared/toolbox/fixPath';
import { convertMillimetersToTwip, HeadingLevel, Paragraph } from 'docx';
import { of, map } from 'rxjs';
//import { generaIndice } from 'src/toolbox/generaIndicePDF';
//import { generateFoldersInFolderProjects, ISeparador } from 'src/toolbox/generaCarpetas';
//import { compressIntereFolder } from 'src/toolbox/forValorizacion/comprimeCarpeta';

import ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import { Observable } from 'rxjs';
import { templateAudio } from 'src/shared/configGobal';
import { arrayBuffer } from 'stream/consumers';
import { ESidePosition } from 'src/docs/services/docs.service';
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
var ffmpeg = require('fluent-ffmpeg')

  ffmpeg.setFfmpegPath(ffmpegPath)

// npm install googleapis@105 @google-cloud/local-auth@2.1.0 --save
interface IEspecificacionesTecnicas{
    idPartida:string;
    partida:string;
    titulo_descripcion_partida:{descripcion_partida:string,detalle:string}
    titulo_materiales_a_utilizar:{materiales_a_utilizar:string,detalle:string},
    titulo_equipos:{equipos:string,detalle:string},
    titulo_modo_ejecucion:{modo_ejecucion:string,detalle:string}
    titulo_controles_ejecucion:{controles_ejecucion:string,detalle:string},
    titulo_metodo_medicion:{metodo_medicion:string,detalle:string}
    titulo_forma_pago:{forma_pago:string,detalle:string}
        
    
}
export interface ITypeConfigParamsHeaderAndFooter{
    imageLeft?:{
        position:string,
        imageName:string
        horizontalPosition:number,
        verticalPosition:number
    },
    imageRight?:{
        position:string,
        imageName:string,
        horizontalPosition:number,
        verticalPosition:number
    },
    textHeader?:{text:string},
    textFooter?:{text:string},
    lineImage?:{
        imageName:string,
        horizontalPosition:number,
        verticalPosition:number
    },
    indices:Array<IIndice>,
}

export interface ICfgDataImageHeaderPosition{
    images : Array<string>,
    headerImagePositions:Array<any> 
}

@Controller('valorizacion')
export class ValorizacionController {
    
    constructor(
        private valorizacionService:ValorizacionService, 
        private readonly httpService: HttpService, 
    ){}
    public au:string   
    public pathToImage:string

    
    
    @Get('tablaDeContenidos')
    async tablaDeContenidos(){
        const listaResumenMetrado = [
            [1,"OBRAS PROVINCIONALES","",""],
            [1.01,"partida 1","MES",5],
            [1,"LIMPIEZA DE TERRENO MANUAL","",""],
            [1.02,"partida 2","MES",6],
            [1.03,"partida 1","GLB",1],
    ]
    let idDoc= await this.valorizacionService.tablaDeContenidos(listaResumenMetrado)
          console.log (idDoc)
      return idDoc
        
    }
    
    @Get('lista')
    async listaValorizaciones():Promise<ValorizacionEntity[]>
    {
        
        return this.valorizacionService.listaValorizaciones()
    }

    @Get('buscaPorId')
    async buscaPorId(obraId:string):Promise<ValorizacionEntity>{
        return  this.valorizacionService.buscaById(obraId)
    }
    
    @Get('listaValorizacionByobraid/:obraId')
    async buscaValoPorObraId(
        @Param('obraId') obraId:string
        ):Promise<ValorizacionEntity>{

        return this.valorizacionService.buscaValoByObraId(obraId)
    }

    @Post('creaperiodovalorizacion')
    async createValorizacion(
        @Body() valorizacion:any,
        
        ){
            console.log(valorizacion)
        //busca el id de la obra que esta siendo valorizada dentro de la coleccion obra, para obtener el obraFolderId
        
        const obra = await this.valorizacionService.buscaObraById(valorizacion.obraId)//se encuentra dentro usuarioFolderId/obraFolderId
        
        //crea dentro de la obra que esta siendo valorizada una carpeta con el periodo correspondiente al actual
        const mesSeleccionadoFolderId = await this.valorizacionService.creaCarpetaDrive(obra.obraFolderId,valorizacion.periodos[0].mesSeleccionado)//este id es para cada periodo , no para la valorizacion global
        
        valorizacion.periodos[0].mesSeleccionadoFolderId = mesSeleccionadoFolderId
        const priodoValoRegistro = await this.valorizacionService.creaperiodovalorizacion(valorizacion)
        
       

        return priodoValoRegistro
    }
    @UseInterceptors(
        FileInterceptor('file')
      )
    @Post('subearchivo')
    async subeArchivo(@UploadedFile() file:Express.Multer.File,
    @Body() agregaEvidenciaFotografica:any,
    @Headers('authorization') autorization:string){
        //: Promise<CreateCatDto>
                   
              
        if(!file){
            throw new BadRequestException("file is not a imagen")
        }
        this.valorizacionService

    }
    
  
      @UseInterceptors(
        FileInterceptor('file')
      )
    @Post('agregaevidenciafotografica')
    async evidenciafotografica(
        @UploadedFile() file:Express.Multer.File,
        @Body() agregaEvidenciaFotografica:any,
        @Headers('authorization') autorization:string)//interceptada por medio de LoggingInterceptor la cabecera que trae el token
        {//: Promise<CreateCatDto>
                   
              
            if(!file){
                throw new BadRequestException("file is not a imagen")
            }
            //buscar obraId, en donde seran agregados las evidencias fotograficas
            //const obra = await this.valorizacionService.buscaValoByObraId(agregaEvidenciaFotografica.obraId)
            
            const responseMesSeleccionado = await this.valorizacionService.buscaMesSeleccionadoFolderIdPorMesSeleccionado(agregaEvidenciaFotografica.obraId,agregaEvidenciaFotografica.mesSeleccionado)
            
            //necesitamos saber, a que periodo pertenece, lo sacamos de consultar la valorizacion, pasando como parametro la obraId y el mes
            //las evidencias fotograficas se tienen que guardar en una carpeta llamada panelfotografico
            console.log(responseMesSeleccionado.periodos[0].mesSeleccionadoFolderId)
            const panelFotograficoFolderId = await this.valorizacionService.creaCarpetaDrive(responseMesSeleccionado.periodos[0].mesSeleccionadoFolderId,'Panel Fotografico')//el id de la carpeta obra de este usuario.
            const filePathInDrive = await this.valorizacionService.subeImagenADrive(file,panelFotograficoFolderId)
            const body:AgregaevidenciafotograficaDto = {
                descripcionTrabajos:agregaEvidenciaFotografica.descripcionTrabajos ,
                mesSeleccionado:agregaEvidenciaFotografica.mesSeleccionado,
                obraId:agregaEvidenciaFotografica.obraId,
                partida:agregaEvidenciaFotografica.partida,
                urlFoto:filePathInDrive
            }
            const macho:any = await this.valorizacionService.agregaevidenciafotografica(body) 
       
            return macho
        
       
        }
    //necesario para mostrar la imagen en el clinte 
     // llama automaticamente cuando se hace la referencia [src] =192.168.1.86:30333 . . .. 
    //
    
    @Get('pictures/:fileId')
    async getPicture(
        @Param('fileId') fileId:any,
        @Res() res:Response,
        
    ){
    //necesitas cargar desde aca lo necesario para que path file name no dependa  de agrgarevidenciafotografica
     res.send(`https://drive.google.com/uc?export=view&id=${fileId}`)
     //https://drive.google.com/uc?export=view&id=1llt9PCpU6Wlm97Y9GyIS1QpxOPPBuRtg
    
    }
    @Get('listaFotos')
    listaFotosSegunObraMesSeleccionado(
        @Body() fotosPorValoSegunObra:any,
        
    ){
        const {obraId,mesSeleccionado} = fotosPorValoSegunObra
        return this.valorizacionService.listaFotosSegunObraMesSeleccionado(obraId,mesSeleccionado)
    }
    @Post('creadocumentopanelfotografico')
    async creaDocumentoPanelFotografico(){
        return await this.valorizacionService.plantillaDocxV3()
    }
    @Post('creadocumentoinformeresidente')
    async creaDocumentoinformeresidente(){
        return await this.valorizacionService.informeresidente('')
        
    }

    /**
     * actualiza evidencia fotografica
     */
     @UseInterceptors(
        LoggingInterceptor,
        FileInterceptor('file', {
          storage: diskStorage({
            async destination(req, file, callback) {
                const filePath = (`./uploads/${req.body.usuarioId}/${req.body.obraId}/${req.body.mesSeleccionado}`)
                //se necesita crear la carpeta a mano
                await fs.promises.mkdir(`${filePath}`,{recursive:true})
                //callback(null,`./uploads`)
                callback(null,`${filePath}`)
            },//: ,//`${_}./uploads`,
            filename: ( req, file, cb)=>{
                const name = file.mimetype.split("/");
                const fileExtention =   name[name.length - 1];
                const newFileName = name[0].split(" ").join("_")+Date.now()+"."+fileExtention;
              cb(null, newFileName)
            },
          }),
         fileFilter: (req,file,cb)=>{
            if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
                return cb(null,false)
            }
            cb(null,true)
         },
        }),
      )
    @Patch('actualizaevidenciafotografica/:obraId/:mesSeleccionado')
    actualizaEvidenciaFotografica(
        @UploadedFile() file:Express.Multer.File,
        @Param('obraId') obraId:string,
        @Param('obraId') mesSeleccionado:string,
        @Body() cuerpo:any,
        @Headers('authorization') autorization:string//interceptada por medio de LoggingInterceptor la cabecera que trae el token
        
    ){

        const filePath = `./uploads/${cuerpo.usuarioId}/${cuerpo.obraId}/${cuerpo.mesSeleccionado}`
        this.pathToImage = filePath
            
        if(!file){
            throw new BadRequestException("file is not a imagen")
        }
        
        const response = {
           filePath:`https://192.168.1.86:3033/valorizacion/pictures/${file.filename}`
            
        };
        cuerpo.urlFoto = response.filePath
        console.log({"es el cxuerop cuerpo":cuerpo})
        
        const body:AgregaevidenciafotograficaDto = {
            descripcionTrabajos:cuerpo.descripcion ,
            mesSeleccionado:cuerpo.mesSeleccionado,
            obraId:cuerpo.obraId,
            partida:cuerpo.partida,
            urlFoto:response.filePath
        }
        return this.valorizacionService.actualizaEvidenciaFotografica(body)

    }
    /*@UseInterceptors(LoggingInterceptor)
    @Post('comprimecarpeta')
    async comprimeCarpeta(@Req() req:Request,@Headers('authorization') autorization:string){

       console.log({"dentro de comprime carpeta":req.body})
        const indices:any[] = req.body.data
        
        const obraId:string = req.body.idproyecto 
        const usuarioId:string | { [key: string]: any; } = this.jwtService.decode(autorization)  
        
        const config = {
            idproyecto:obraId["code"],
            idusuario:usuarioId["id"]
        }

       
       await  compressIntereFolder.main(config.idusuario,config.idproyecto)//crea los separadores dentro de usuarioid/proyectoid/valorizacion
       return "comprimido"
       
    }*/
   
    @Get('generaIndice')
    async generaIndice(@Req() req:Request){//use @Req() to access the full request object.
        //let params = req.params         
        let params: ITypeConfigParamsHeaderAndFooter = {
            imageLeft: {
                position: "left", imageName: 'diris.png',horizontalPosition:950000,verticalPosition:convertMillimetersToTwip(4857)
            },
            imageRight: {
                position: "right", imageName: 'diris.png',horizontalPosition:5900000,verticalPosition:convertMillimetersToTwip(4857)//revisar archivo en xls milimeter to swip
            },
            textHeader: {
                text: "MEJORAMIENTO DEL SERVICIO DE PROVISIÓN DE AGUA PARA RIEGO EN EL SISTEMA DE RIEGO PARCELARIO DEL GRUPO DE GESTIÓN EMPRESARIAL PAMPACANCHA-RECUAY DE LA LOCALIDAD DE PAMPACANCHA DISTRITO DE RECUAY DE LA PROVINCIA DE RECUAY DEL DEPARTAMENTO DE ANCASH” CON CUI N° 2606880"
            },
            textFooter: {
                text: 'INDICE GENERAL - MUNICIPALIDAD DISTRITAL DE RECUAY'
            },
            lineImage: {
                imageName: 'linea.png',horizontalPosition:3700000,verticalPosition:-convertMillimetersToTwip(30194)
            },
            indices: [{ tituloSubtitulo: 'CONTENIDO ADMINISTRATIVO MÍNIMO EN EL EXPEDIENTE TÉCNICO', indent: 0 }, { tituloSubtitulo: '1. CARATULA', indent: 1 }]
        } 
        this.valorizacionService.generaIndiceEnDriveWord(params)
    }


    @Get('generaseparadores')
    async createFoldersInWindows(@Req() req:Request){
        const indices: Array<ISeparador> = [
          { esSeparador: 1, titulo: "Caratula", columna: 1 },
          { esSeparador: 1, titulo: "Indice", columna: 1 },
          /*{ esSeparador: 1, titulo: "Resumen Ejecutivo", columna: 1,},
          { esSeparador: 1, titulo: "Memoria Descriptiva", columna: 1,},
          { esSeparador: 1, titulo: "Planilla de Metrados",columna: 1,},
          { esSeparador: 1, titulo: "Gastos Generales",columna: 1,},
          { esSeparador: 1, titulo: "Cálculo Flete",columna: 1,},
          { esSeparador: 1, titulo: "Presupuesto", columna: 1,},
          { esSeparador: 1, titulo: "Acu",columna: 1,},
          { esSeparador: 1, titulo: "Insumos",columna: 1,},
          { esSeparador: 1, titulo: "Fórmula Polinomica",columna: 1,},
          { esSeparador: 1, titulo: "Especificaciones Técnicas",columna: 1,},
          { esSeparador: 1, titulo: 'Cronogramas',columna: 1,},
          { esSeparador: 1,titulo:  "Planos",columna: 1,},*/
          
        ];
        return this.valorizacionService.generaSeparadores(indices)
    }
    

    @Get('curvas')
    curvas(){
        return this.valorizacionService.llamaAPandas()
    }

    /**
     * 
     * @param obraId 
     * @param mesSeleccionado 
     * @returns 
     */
    //consultas
    @Get('consultas/:obraId/:mesSeleccionado')
    dadoUnMesSeleccionadoMostarSuPanelFotografico(
        @Param('obraId') obraId:string,
        @Param('mesSeleccionado') mesSeleccionado:string

    ){
        console.log({obraId,mesSeleccionado})
        
        return this.valorizacionService.dadoUnMesSeleccionadoMostarSuPanelFotografico(obraId,mesSeleccionado)

    }
    @Post('valo')
    valo(){
        const configuracion = {
            gg:20,//20% de cd
            utilidad:10, //10% del cd
            igv:18,//18% del sub total
            nroValorizacion:1,
            imagenUrl:'https://192.168.1.86:3033/valorizacion/pictures/6573218330b6dc0e1d23ba90/65a9b71ffdd42b7873b4bc9e/Diciembre/fotos/image1705621307593.png'
        }
       
        const presupuestoContractual = [
            ["1","a","m",1,2190.46,2190.46],
            ["2","a","m",1,1764,1764],
            ["3","a","m",1.5,500,750],
            ["4","a","m",1,2000.64,2000.64],
            ["5","a","m",1,3083.92,3083.92],
            ["6","a","m",0.90,1.12,1.01],
            ["7","a","m",0.90,2.20,1.98],
            
        ]
        let avancefisicomensualActual = [
            
            ["","","","","",""],
            ["","","","","",0.52],
            ["","","","","",0.77],
            ["","","","","",0.75],
            ["","","","","",0.75],
            ["","","","","",""],
            ["","","","","",""],

            
        ]
        let avanceFisicoMensualAnterior = [
            ["","","","","",1],
            ["","","","","",0.48],
            ["","","","","",0.73],
            ["","","","","",0.25],
            ["","","","","",0.25],
            ["","","","","",0.90],
            ["","","","","",0.90],
            
            
        ]
        let metradoAcumuladoMensualAnterior:Array<any[]>=[]
        
        if(configuracion.nroValorizacion != 0){
            metradoAcumuladoMensualAnterior = metradoMensualAcumulado(avanceFisicoMensualAnterior)
        }
        else{
            presupuestoContractual.forEach((presupuesto)=>{
                metradoAcumuladoMensualAnterior = metradoAcumuladoMensualAnterior.concat([0])

            })
            
        }
        
        let idpartida:string[] = []
        let descripcion:string[] = []
        let u_medida:string[]=[]
        let metrado:number[]=[]
        let precio_unitario:number[]=[]
        let parcial:number[]=[]
        
        //poniendo las cabeceras
        presupuestoContractual.forEach((presup:any[],index)=>{
            idpartida = idpartida.concat(presup[0])
            descripcion = descripcion.concat(presup[1])
            u_medida = u_medida.concat(presup[2])
            metrado = metrado.concat(presup[3])
            precio_unitario = precio_unitario.concat(presup[4])
            parcial = parcial.concat(presup[5])
           
        })

        const data ={
            valorizacion: {
                idpartida,
                descripcion,
                u_medida,
                metrado,
                precio_unitario,
                parcial,
                metradoAnterior:metradoAcumuladoMensualAnterior,
               
                metradoActual : metradoMensualAcumulado(avancefisicomensualActual),
                

            },    
            configuracion
        }
        console.log(data)
        return this.valorizacionService.valorizacion(data)
    }
    @Get('descarga')
    descarga(@Res() response: Response){
       // response.download('https://drive.google.com/file/d/17xTZ2zs0O49pTf8K4sNikXUvWeknK2wt')
      // this.authorize().then(this.downloadFile).catch(console.error)

    }
}
/**
 * Convierte un archivo de audio .ogx a .mp3 utilizando fluent-ffmpeg.
 *
 * @param inputFilePath La ruta completa al archivo .ogx de entrada.
 * @param outputFilePath La ruta completa donde se guardará el archivo .mp3 de salida.
 * @returns Una promesa que se resuelve cuando la conversión es exitosa o se rechaza con un error.
 */
async function convertOgxToMp3(inputFilePath: string, outputFilePath: string): Promise<void> {
    var outStream = fs.createWriteStream(outputFilePath);

ffmpeg()
  .input(inputFilePath)
  .audioQuality(96)
  .toFormat("mp3")
  .on('error', error => console.log(`Encoding Error: ${error.message}`))
  .on('exit', () => console.log('Audio recorder exited'))
  .on('close', () => console.log('Audio recorder closed'))
  .on('end', () => console.log('Audio Transcoding succeeded !'))
  .pipe(outStream, { end: true });
    /*return new Promise((resolve, reject) => {
      ffmpeg(inputFilePath)
        .output(outputFilePath)
        .audioCodec('libmp3lame') // Especifica el códec MP3 (requiere que ffmpeg esté configurado con libmp3lame)
        .on('start', (commandLine) => {
          console.log(`Iniciando conversión con el comando: ${commandLine}`);
        })
        .on('progress', (progress) => {
          console.log(`Procesando: ${Math.round(progress.percent)}%`);
        })
        .on('end', () => {
          console.log('Conversión a MP3 completada exitosamente.');
          resolve();
        })
        .on('error', (err) => {
          console.error(`Error durante la conversión: ${err.message}`);
          reject(err);
        })
        .run();
    });*/
  }

function metradoMensualAcumulado(metradoDiario:Array<any[]>):any[]{
    let tmp2:number[] = []
    let tmp3:number = 0
    let metradoAcumulado:any[] = []
    metradoDiario.forEach((avance:any[])=>{
    //suma de todo el avance fisico
    tmp2 = avance.filter((dia:any)=>{//retorna un array con el filtro aplicado[]
         return (dia != "")
    })
    //console.log(tmp)
    tmp2.forEach((diario:number)=>{
        //console.log({"diario":diario})
        tmp3 = tmp3 + diario
    })
    metradoAcumulado.push(tmp3)
    tmp3 = 0
    })
    return metradoAcumulado
}
