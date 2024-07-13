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
    ){}
    public au:string
    @Get('saludahijo')
    public saludaHijo(){
        this.valorizacionService.saludaHijo()
    }
    public pathToImage:string
    @Get('bookmark')
    async bookmark(){
        return this.valorizacionService.bookmark()
        
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
            {esSeparador:1,titulo:'0. INDICE ENUMERADO',columna:1,esNoCorresponde:0},
            {esSeparador:1,titulo:'1. AGUA Y SANEAMIENTO',columna:1,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1 ASPECTOS GENERALES',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.1 Resumen Ejecutivo',columna:3,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.2 Ficha Técnica',columna:3,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.3 Memoria Descriptiva',columna:3,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.4 Memoria de Cálculo',columna:3,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.5 Planilla de Metrados',columna:3,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.6 Presupuesto de Obra',columna:3,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.6.1 Cuadro de Resumen del Presupuesto',columna:4,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.6.2 Presupuesto de Obra',columna:4,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.6.3 Presupuesto Desagregado',columna:4,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.6.4 Análisis de Costos Unitarios',columna:4,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.6.5 Planilla de Metrados',columna:4,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.6.6 Relación de Insumos Generales y por Grupos',columna:4,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.6.7 Fórmulas Polinomicas',columna:4,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.6.8 Analisis de Gastos Generales (Fijos y Variables)',columna:4,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.6.9 Gastos de Supervisión',columna:4,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.6.10 Gastos de Gestión de Proyectos',columna:4,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.6.11 Gastos de Control Concurrente - CC',columna:4,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.6.12 Gastos de Junta de Resolucion de Disputas - JRD',columna:4,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.6.13 Gastos de Gestión de Riesgos',columna:4,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.6.14 Cotización de Materiales y Equipos (Mínimo de 3)',columna:4,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.6.15 Calculos de Flete y,',columna:4,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.6.16 Otros que el área Técnica considere necesario para su aprobación',columna:4,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.7 Programación de Obra',columna:3,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.7.1 Programación de Ejecución de Obra',columna:4,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.7.2 Cronograma de Adquisición de Materiales',columna:4,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.7.3 Cronograma de Avance de Obra Valorizado',columna:4,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.8 Especificaciones Técnicas',columna:3,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.9 Planos',columna:3,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.9.1 Indice de Planos',columna:4,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.9.2 Planos Generales de Sistema Existente y Planos de sistema Proyectado',columna:4,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.9.3 Plano Clave: Plano de Ubicación, y Localización con coordenadas UTM y Plano de Canteras y Botaderos',columna:4,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.9.4 Plano Topográfico',columna:4,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.9.5 Plano del Ámbito de influencia del Proyecto, deliminado',columna:4,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.9.6 Plano Trazado y Lotización aprovado por el GR/GL, correspondiente',columna:4,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.9.7 Plano de Sistema de Abastesimiento de Agua Potable',columna:4,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.9.8 Planos del Sistema de Tratamiento de Agua Potable PTAP',columna:4,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.9.9 Planos de Almacenamiento de Agua para Consumo Humano',columna:4,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.9.10 Estaciones de Bombeo de Agua para consumo humano (de ser el caso)',columna:4,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.9.11 Planos de Redes  de Distribución Agua Potable para consumo Humano',columna:4,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.9.12 Plano de Conexiones Domiciliarias de Agua Potable',columna:4,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.9.13 Plano de Drenaje Pluvial (de ser el caso)',columna:4,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.9.14 Planos del sistema de Redes de Alcantarillado Sanitario',columna:4,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.9.15 Planos de Estación de Bombeo de aguas Residuales (EBAR) de ser el caso',columna:4,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.9.16 Planos del sistema de Tratamiento de aguas residuales - PTAR',columna:4,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.1.9.17 Planos de la Disposición sanitaria de Excretas - UBS',columna:4,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.2 ESTUDIOS BASICOS',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.2.1 Estudio de Topografía geodesico y/o de GeoReferenciación ',columna:3,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.2.2 Estudios de fuentes de agua tales como: *Analisis Físico - quimico y bactereológico de la fuente y/o fuentes de agua por laboratorio acreditado por INACAL, incluido informe de interpretación  y panel fotográfico,* estudio hidrológicos de aguas superficiales, * estudio Hidrogeológicos para aguas subterraneas para esto si la captación de agua es por pozos tubulares incluye pozo de prueba (nivel estático, nivel dinamico, y rendimiento acuifero), Resumen de aforos realizados para proyectos en ambito rural o pequeña ciudad (debe indicar fecha de aforos y responsable del procedimiento).',columna:3,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.2.3 Estudio de Mecanica de Suelos',columna:3,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.2.4 Estudio de Gestión de Riesgo y la planificación de la ejecución de la obra según la metodología del CENEPRED',columna:3,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.3 ANEXOS',columna:2,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.3.1 Plan de seguridad y salud Ocupacional',columna:3,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.3.2 Manual de Operación y Mantenimiento',columna:3,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.3.3 Componente Social (Plan de Capacitaciones)',columna:3,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.3.4 Panel Fotográfico',columna:3,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.3.5 Saneamiento Fisico Legal, arregle institucional y/i disponibilidad física del predio o terreno o predios. Actas de sesión de terrenos, pases, servidumbre u otro documento que muestre la aceptación de los propietarios (Verificar con SUNARP, COFOPRI, SBN, entre otros)',columna:3,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.3.6 Acreditación Hidrica y/o licencia de uso de agua vigente con fines poblacionales emitidas por el ANA o Autoridad Local del Agua (ALA).',columna:3,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.3.7 Instrumento de gestión ambiental o ficha tecnica ambiental',columna:3,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.3.8 Certificación de inexistencia de restos Arqueológicos (CIRA), o plan de Monitoreo Arqueológico (PEA), de corresponder',columna:3,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.3.9 EIA o Programa de adecuación de manejo ambiental (PAMA, DIA), Ficha Técnica Ambiental (FTA)',columna:3,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.3.10 Certificado de compatibilidad para proyectos en áreas protegidas - SERNANP. Si la ubicación del proyecto es Area Natural Protegida o zona de amortiguamiento de corresponder',columna:3,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.3.11 Documentos que garanticen la operación y mantenimiento el PI (JASS o UGM o empresas prestadoras de servicio de agua potable) o informe de capacidad de gestion del prestador',columna:3,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.3.12 Documento de Factibilidad de servicio de agua potable y alcantarillado (de ser el caso)',columna:3,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.3.13 Documento de Conformidad técnica del Proyecto de energía electrica o certificado de factibilidad de suministro de energía eléctica (de ser el caso)',columna:3,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.3.14 Acta de Compromiso de Pago de Cuota familiar (Zona Rural)',columna:3,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.3.15 Padrón general de usuarios actualizados, con su DNI, firma o Huella Digital correspondiente',columna:3,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.3.16 Resolución y/o Acta de constitución de Junta Administradora de Servicio de Saneamiento (JASS), zona Rural',columna:3,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.3.17 Estudio de Canteras y Escombreras',columna:3,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.3.18 Autorización sanitaria de aprobación de diseño de las plantas de tratamiento de Agua Potable por la DIGESA',columna:3,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.3.19 Autorización sanitaria del sistema de tratamiento y Disposición final de Aguas Residuales Domesticas con infiltración en el terreno - DIGESA',columna:3,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.3.20 Informe Técnico de la unidad Ejecutora que demuestre que cuenta con el personal técnico Administrativo, los equipos necesarios y la capacidad operativa para asegurar el cumplimiento de las metas previstas, en caso de modalidad de ejecución por administración directa',columna:3,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.3.21 Otros documento y/o estudios - Inormación complementaria',columna:3,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.3.22 Dispositivo Portatil USB de capacidad correspondiente al proyecto - version digital editable (incluye base de datos de presupuesto editable)',columna:3,esNoCorresponde:0},
            {esSeparador:1,titulo:'1.3.23 Contratos y términos de referencia de los adscritos menores a 8 UIT.',columna:3,esNoCorresponde:0},
            /**/
            

        ]

        const nombreObra = "MEJORAMIENTO Y AMPLIACION DEL SERVICIO DE AGUA POTABLE RURAL Y MEJORAMIENTO Y AMPLIACION DEL SERVICIO ALCANTARILLADO U OTRAS FORMAS DE DISPOSICION SANITARIA DE EXCRETAS EN LA LOCALIDAD DE COLTAO QUITAFLOR DEL DISTRITL DE PIRA DE LA PROVINCIA DE HUARAZ DEL DEPARTAMENTO DE ANCASH"
        const pieDePagina = "INDICE GENERAL - MUNICIPALIDAD DISTRITAL DE PIRA"

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
