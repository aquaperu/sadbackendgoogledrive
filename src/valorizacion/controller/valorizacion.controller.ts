import { BadRequestException, Body, Controller, Get, Headers, Param, Patch, Post, Put, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { diskStorage } from 'multer';
import { AgregaevidenciafotograficaDto } from '../dtos/crud.valorizacion.dto';
import { ValorizacionEntity } from '../entity/valorizacion.entity';
import { INombreColumna, ValorizacionService } from '../services/valorizacion.service';
import * as fs from 'fs'
import { LoggingInterceptor } from 'src/auth/services/interceptortoken.service';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
//import { generaIndice } from 'src/toolbox/generaIndicePDF';
//import { generateFoldersInFolderProjects, ISeparador } from 'src/toolbox/generaCarpetas';
//import { compressIntereFolder } from 'src/toolbox/forValorizacion/comprimeCarpeta';

// npm install googleapis@105 @google-cloud/local-auth@2.1.0 --save

@Controller('valorizacion')
export class ValorizacionController {
    
    constructor(
        private valorizacionService:ValorizacionService,
        
    ){

    }
    public au:string
    public pathToImage:string
    
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


    @Get('generaseparadoresconindice')
    async createFoldersInWindows(@Req() req:Request){
        const indices:Array<INombreColumna> = [
          
            {esSeparador:1,titulo:'1.RESUMEN EJECUTIVO',columna:1,esNoCorresponde:0},
            {esSeparador:0,titulo:'1.1 Nombre del Proyecto',columna:2,esNoCorresponde:0},
            {esSeparador:0,titulo:'1.2 Codigo unico de inversiones',columna:2,esNoCorresponde:0},
            {esSeparador:0,titulo:'1.3 Cadena Funcional Programática',columna:2,esNoCorresponde:0},
            {esSeparador:0,titulo:'1.4 Unidad Ejecutora',columna:2,esNoCorresponde:0},
            {esSeparador:0,titulo:'1.5 Objetivo del Proyecto',columna:2,esNoCorresponde:0},
            {esSeparador:0,titulo:'1.6 Ubicación del Proyecto',columna:2,esNoCorresponde:0},
            {esSeparador:0,titulo:'1.6.1 localizacion del proyecto en el mapa del pais',columna:3,esNoCorresponde:0},
            {esSeparador:0,titulo:'1.6.2 Localizacion del proyecto en el mapa vial Departamental',columna:3,esNoCorresponde:0},
            {esSeparador:0,titulo:'1.7 Poblacion Beneficiaria',columna:2,esNoCorresponde:0},
            {esSeparador:0,titulo:'1.8 Resumen del Diagnostico de los Servicios Existentes',columna:2,esNoCorresponde:0},
            {esSeparador:0,titulo:'1.9 Descripcion de las metas del proyecto',columna:2,esNoCorresponde:0},
            {esSeparador:0,titulo:'1.10 Resumen de Metrados',columna:2,esNoCorresponde:0},
            {esSeparador:0,titulo:'1.11 Presupuesto y Monto Total de Inversión',columna:2,esNoCorresponde:0},
            {esSeparador:0,titulo:'1.12 Cronogramas',columna:2,esNoCorresponde:0},
            {esSeparador:0,titulo:'1.13 Plazo de Ejecucion',columna:2,esNoCorresponde:0},
            {esSeparador:0,titulo:'1.14 Modalidad de Ejecucion',columna:2,esNoCorresponde:0},
            {esSeparador:0,titulo:'1.15 Sistema de Contratacion',columna:2,esNoCorresponde:0},
            {esSeparador:0,titulo:'1.16 Fuente de Financiamiento',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'2. MEMORIA DESCRIPTIVA',columna:1,esNoCorresponde:0},
            {esSeparador:0,titulo:'2.1 Nombre del Proyecto',columna:2,esNoCorresponde:0},
            {esSeparador:0,titulo:'2.2 Estructura funcional Programatica y del Proyecto',columna:2,esNoCorresponde:0},
            {esSeparador:0,titulo:'2.3 Secuencia funcional del Proyecto',columna:2,esNoCorresponde:0},
            {esSeparador:0,titulo:'2.4 Entidad Ejecutora',columna:2,esNoCorresponde:0},
            {esSeparador:0,titulo:'2.5 Antecedentes',columna:2,esNoCorresponde:0},
            {esSeparador:0,titulo:'2.6 Objetivos',columna:2,esNoCorresponde:0},
            {esSeparador:0,titulo:'2.7 Justificacion',columna:2,esNoCorresponde:0},
            {esSeparador:0,titulo:'2.8 Descripcion Tecnica del Proyecto',columna:2,esNoCorresponde:0},
            {esSeparador:0,titulo:'2.8.1 Ubicación Geografica y politica',columna:3,esNoCorresponde:0},
            {esSeparador:0,titulo:'2.8.2 Area de Intervencion',columna:3,esNoCorresponde:0},
            {esSeparador:0,titulo:'2.8.3 Vias de Acceso',columna:3,esNoCorresponde:0},
            {esSeparador:0,titulo:'2.8.4 Orografia de area del proyecto',columna:3,esNoCorresponde:0},
            {esSeparador:0,titulo:'2.8.5 Condiciones Climatologicas',columna:3,esNoCorresponde:0},
            {esSeparador:0,titulo:'2.8.6 Altitud del area del proyecto',columna:3,esNoCorresponde:0},
            {esSeparador:0,titulo:'2.8.7 Actividades economicas y sociales',columna:3,esNoCorresponde:0},
            {esSeparador:0,titulo:'2.9 Descripcion del sistema existente',columna:2,esNoCorresponde:0},
            {esSeparador:0,titulo:'2.10 Consideraciones de Diseño del sistema propuesto',columna:2,esNoCorresponde:0},
            {esSeparador:0,titulo:'2.11 descripcion de las metas del proyecto',columna:2,esNoCorresponde:0},
            {esSeparador:0,titulo:'2.12 Resumen del analisis de vulnerabilidad y analisis de riesgo',columna:2,esNoCorresponde:0},
            {esSeparador:0,titulo:'2.13 Resumen de la Evaluacion de impacto ambiental',columna:2,esNoCorresponde:0},
            {esSeparador:0,titulo:'2.14 Resumen de la memoria de Calculo de los Diseños',columna:2,esNoCorresponde:0},
            {esSeparador:0,titulo:'2.15 Presupuesto del proyecto',columna:2,esNoCorresponde:0},
            {esSeparador:0,titulo:'2.16 Fuente de Financiamiento',columna:2,esNoCorresponde:0},
            {esSeparador:0,titulo:'2.17 Modalidad de ejecucion de obra',columna:2,esNoCorresponde:0},
            {esSeparador:0,titulo:'2.18 Sistema de contratacion',columna:2,esNoCorresponde:0},
            {esSeparador:0,titulo:'2.19 plazo de ejecucion de obra',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'3. MEMORIA DE CALCULO DE LOS COMPONENTES',columna:1,esNoCorresponde:0},
            {esSeparador:1,titulo:'3.1 Parametros de Diseño',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'3.2 Diseño y Calculo Hidraulico',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'3.3 Diseño de calculo Estructural',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'4. ESPECIFICACIONES TECNICAS',columna:1,esNoCorresponde:0},
            {esSeparador:1,titulo:'5. PLANILLA DE METRADOS',columna:1,esNoCorresponde:0},
            {esSeparador:1,titulo:'5.1 Resumen de Metrados',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'5.2 Planilla de Metrados',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'6. PRESUPUESTO DEL PROYECTO',columna:1,esNoCorresponde:0},
            {esSeparador:1,titulo:'6.1 PRESUPUESTO GENERAL',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'6.2 PRESUPUESTO ANALITICO',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'7. ANALISIS DE PRECIOS UNITARIOS (APU)',columna:1,esNoCorresponde:0},
            {esSeparador:1,titulo:'8. RELACION DE INSUMOS',columna:1,esNoCorresponde:0},
            {esSeparador:1,titulo:'9. COTIZACION DE MATERIALES',columna:1,esNoCorresponde:0},
            {esSeparador:0,titulo:'9.1 Adjuntar 3 Cotizaciones, con la respectiva firma del proveedor',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'10. FORMULA POLINOMICA',columna:1,esNoCorresponde:0},
            {esSeparador:1,titulo:'11. CALCULO DEL COSTO DEL FLETE',columna:1,esNoCorresponde:0},
            {esSeparador:1,titulo:'12. MOVILIZACION Y DESMOVILIZACION DE EQUIPOS Y MAQUINARIAS',columna:1,esNoCorresponde:0},
            {esSeparador:1,titulo:'13. RELACION DE EQUIPO MINIMO',columna:1,esNoCorresponde:0},
            {esSeparador:1,titulo:'14. CRONOGRAMAS DE OBRA',columna:1,esNoCorresponde:0},
            {esSeparador:1,titulo:'14.1 Programa de ejecucion de Obras',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'14.2 Calendario de Adquisicion de Materiales',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'14.3 Calendario de Avance de Obra Valorizado',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'14.4 Diagrama Pert-Cpm',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'14.5 Cronograma Valorizado de Avance de Obra',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'14.6 Cronograma Valorizado de Adquisicion de Materiales',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'14.7 Presupuesto de Gestion de Proyectos',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'15. ESTUDIOS DE INGENIERIA BASICA',columna:1,esNoCorresponde:0},
            {esSeparador:1,titulo:'15.1 Estudio Topografico',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'15.2 Estudio de Mecanica de Suelos',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'15.3 Estudios de Fuentes de Agua y Estudio Hidrologico',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'15.4 Plan de Seguridad y salud en la Ejecucion de la Obra',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'15.5 Analisis y Gestion de Riesgos de Desastres',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'16.6 Plan de manejo ambiental',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'16. PLANOS',columna:1,esNoCorresponde:0},
            {esSeparador:1,titulo:'16.1 INDICE DE PLANOS',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'16.2 PLANOS DEL SISTEMA DE ABASTECIMIENTO DE AGUA POTABLE (DE REQUERIRSE)',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'16.3 SISTEMA DE ALCANTARILLADO SANITARIO Y/O SISTEMA DE SANEAMIENTO (DE REQUERIRSE)',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'16.4 PLANTA DE TRATAMIENTO DE AGUA RESIDUALES (PTAR) (DE REQUERIRSE)',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'17. ANEXOS',columna:1,esNoCorresponde:0},
            {esSeparador:1,titulo:'17.1. CONSTANCIA DE VISITA Y TRABAJOS EN CAMPO',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'17.2. ESTUDIO DE FUENTES DE AGUA',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'17.3. ANALISIS FISICO, QUIMICO Y BACTERIOLOGICO',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'17.4. MANUAL DE OPERACIÓN Y MANTENIMIENTO',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'17.5. PANEL FOTOGRAFICO',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'17.6. DOCUMENTO QUE ACREDITE LA DISPONIBILIDAD HIDRICA DE LA FUENTE EMITIDA POR LA AUTORIDAD DEL AGUA (ANA/ALA)',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'17.7. RESOLUCIONES, CERTIFICADOS, ACREDITACIONES Y AUTORIZACIONES',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'17.8. CERTIFICADO DE INEXISTENCIA DE RESTOS ARQUEOLOGICOS, INCLUYE EXPEDIENTE DE TRAMITE Y PLANOS',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'17.9. RESUSTADOS DE ENSAYOS Y PRUEBAS DE CALIDAD',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'17.10. DECLARACION JURADA DE LA UNIDAD EJECUTORA Y/U OPERADOR DE OBTENER LA AUTORIZACION SANITARIA DEL SISTEMA DE AGUA POTABLE DIGASA ANTES DE SU PUESTA EN MARCHA (DE SER EL CASO)',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'17.11. DECLARACION JURADA DE LA UNIDAD EJECUTORA Y/U OPERADOR DE OBTENER LA AUTORIZACION DE VERTIMIENTO DE AGUAS RESIDUALES TRATADAS DEL ANA, DENTRO DEL PRIMER AÑO DE LA PUESTA EN MARCHA DE LA PTAR, EN EL CASO QUE EL AFLUENTE FINAL VERTIDO A UN CUERPO DE AGUA (DE SER EL CASO)',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'17.12. COTIZACIONES DE LOS EQUIPOS Y MATERIALES',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'17.13. FUENTE DE CUADRO DE MANO DE OBRA QUE SE HA UTILIZADO',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'17.14. ACTAS DE COMPROMISO U OTROS DOCUMENTOS SIMILARES QUE COADYUVEN A DAR SOSTENIBILIDAD AL PROYECTO',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'17.15. CATALOGO DE MATERIALES Y EQUIPOS',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'17.16. INCLUIR COMO ANEXOS CUALQUIER INFORMACION QUE PRECISE NECESARIO',columna:2,esNoCorresponde:0},
            


        ]

        const nombreObra = "MEJORAMIENTO DEL SERVICIO DE AGUA POTABLE RURAL EN EL SISTEMA DE AGUA POTABLE DE LA LOCALIDAD DE TICAPAMPA DISTRITO DE TICAPAMPA DE LA PROVINCIA DE RECUAY DEL DEPARTAMENTO DE ANCASH"
        const pieDePagina = "INDICE GENERAL - MUNICIPALIDAD DISTRITAL DE TICAPAMPA"

        return this.valorizacionService.generaSeparadoresConIndice (indices,nombreObra,pieDePagina)
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
