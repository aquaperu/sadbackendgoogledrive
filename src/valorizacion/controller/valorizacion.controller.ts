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
import { fixPathAssets, fixPathEspecificacionesTecnicas } from 'src/shared/toolbox/fixPath';
import { HeadingLevel, Paragraph } from 'docx';
//import { generaIndice } from 'src/toolbox/generaIndicePDF';
//import { generateFoldersInFolderProjects, ISeparador } from 'src/toolbox/generaCarpetas';
//import { compressIntereFolder } from 'src/toolbox/forValorizacion/comprimeCarpeta';

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

    
    
    @Get('tablaDeContenidos')
    async tablaDeContenidos(){
        const listaResumenMetrado = [
            [1,"OBRAS PROVINCIONALES","",""],
            [1.01,"partida 1","MES",5],
            [1,"LIMPIEZA DE TERRENO MANUAL","",""],
            [1.02,"partida 2","MES",6],
            [1.03,"partida 1","GLB",1],
    ]
          
      return this.valorizacionService.tablaDeContenidos(listaResumenMetrado)
        
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
    async generaIndice(@Req() req:Request){
        const indices:Array<IIndice> = [
            {tituloSubtitulo:'CONTENIDO ADMINISTRATIVO MÍNIMO EN EL EXPEDIENTE TÉCNICO',indent:0},
{tituloSubtitulo:'1. CARATULA',indent:1},
{tituloSubtitulo:'2. ÍNDICE',indent:1},
{tituloSubtitulo:'a) DECLARACIÓN JURADA DE LA PARTICIPACIÓN Y VERACIDAD DE LOS ESTUDIOS POR PARTE DEL PLANTEL TÉCNICO',indent:2},
{tituloSubtitulo:'b) FICHA INVIERTE.PE',indent:2},
{tituloSubtitulo:'c) FORMATO 08-A',indent:2},
{tituloSubtitulo:'d) FORMATO GESTIÓN DE RIESGOS',indent:2},
{tituloSubtitulo:'E.1. IDENTIFICACIÓN ANÁLISIS Y RESPUESTA A LOS RIESGOS',indent:3},
{tituloSubtitulo:'E.2. MATRIZ DE PROBABILIDAD E IMPACTO',indent:3},
{tituloSubtitulo:'E.3. ASIGNACIÓN DE RIESGOS',indent:3},
{tituloSubtitulo:'CAPITULO I: RESUMEN EJECUTIVO',indent:1},
{tituloSubtitulo:'1.1. NOMBRE DEL PROYECTO',indent:2},
{tituloSubtitulo:'1.2. UBICACIÓN',indent:2},
{tituloSubtitulo:'1.3. OBJETIVOS',indent:2},
{tituloSubtitulo:'1.4. METAS FÍSICAS',indent:2},
{tituloSubtitulo:'1.5. RESUMEN DE METRADOS',indent:2},
{tituloSubtitulo:'1.6. PRESUPUESTO RESUMEN',indent:2},
{tituloSubtitulo:'1.7. CRONOGRAMA DE ACTIVIDADES',indent:2},
{tituloSubtitulo:'1.8. PLAZO DE EJECUCIÓN',indent:2},
{tituloSubtitulo:'1.9. MODALIDAD DE EJECUCIÓN',indent:2},
{tituloSubtitulo:'1.10. SISTEMA DE CONTRATACIÓN',indent:2},
{tituloSubtitulo:'1.11. ENTIDAD EJECUTORA',indent:2},
{tituloSubtitulo:'CAPITULO II: SITUACIÓN ACTUAL',indent:1},
{tituloSubtitulo:'2.1. CARACTERÍSTICAS FÍSICAS GENERALES',indent:2},
{tituloSubtitulo:'2.1.1. ASPECTOS CLIMÁTICOS',indent:3},
{tituloSubtitulo:'2.1.2. TOPOGRAFÍA',indent:3},
{tituloSubtitulo:'2.1.3. GEOLOGÍA Y GEOTECNIA',indent:3},
{tituloSubtitulo:'2.1.4. VÍAS DE ACCESO Y MEDIOS DE COMUNICACIÓN',indent:3},
{tituloSubtitulo:'2.1.5. CANTERAS DE AGREGADOS Y BOTADEROS',indent:3},
{tituloSubtitulo:'2.2. CARACTERÍSTICAS SOCIOECONÓMICAS',indent:2},
{tituloSubtitulo:'2.2.1. POBLACIÓN BENEFICIADA',indent:3},
{tituloSubtitulo:'2.2.2. ACTIVIDAD PRINCIPAL DE LA POBLACIÓN Y NIVEL DE VIDA',indent:3},
{tituloSubtitulo:'2.2.3. SERVICIOS BÁSICOS DE LA POBLACIÓN',indent:3},
{tituloSubtitulo:'2.3. INVENTARIO ACTUAL DE LA INFRAESTRUCTURA EXISTENTE',indent:2},
{tituloSubtitulo:'CAPITULO III: MEMORIA DESCRIPTIVA',indent:1},
{tituloSubtitulo:'3.1. ASPECTOS GENERALES',indent:2},
{tituloSubtitulo:'3.2. ANTECEDENTES DEL PROYECTO',indent:2},
{tituloSubtitulo:'3.3. PROBLEMÁTICA ACTUAL',indent:2},
{tituloSubtitulo:'3.4. DESCRIPCIÓN DEL ÁREA DEL PROYECTO',indent:2},
{tituloSubtitulo:'3.5. DESCRIPCIÓN TÉCNICA DEL PROYECTO',indent:2},
{tituloSubtitulo:'3.6. NORMAS APLICABLES',indent:2},
{tituloSubtitulo:'3.7. RESULTADOS DE LOS ESTUDIOS DE INGENIERÍA BÁSICA',indent:2},
{tituloSubtitulo:'3.8. CRITERIOS DE DISEÑO PARA EL DESARROLLO DEL PROYECTO',indent:2},
{tituloSubtitulo:'3.9. PRESUPUESTO RESUMEN',indent:2},
{tituloSubtitulo:'3.10. CRONOGRAMA DE ACTIVIDADES',indent:2},
{tituloSubtitulo:'3.11. PLAZO DE EJECUCIÓN',indent:2},
{tituloSubtitulo:'3.12. MODALIDAD DE EJECUCIÓN',indent:2},
{tituloSubtitulo:'3.13. SISTEMA DE CONTRATACIÓN',indent:2},
{tituloSubtitulo:'3.14. ENTIDAD EJECUTORA',indent:2},
{tituloSubtitulo:'CAPITULO IV: ESTUDIOS BÁSICOS',indent:1},
{tituloSubtitulo:'4.1. ESTUDIO TOPOGRÁFICO (CONSIDERAR MINIMO 02 PUNTOS GEODÉSICOS DE ORDEN C CERTIFICADOS, COMO MÍNIMO)',indent:2},
{tituloSubtitulo:'4.2. ESTUDIO HIDROLÓGICO',indent:2},
{tituloSubtitulo:'4.3. ESTUDIO AGROLÓGICO',indent:2},
{tituloSubtitulo:'4.4. ESTUDIO DE MECÁNICA DE SUELOS GEOLOGÍA Y GEOTÉCNIA',indent:2},
{tituloSubtitulo:'4.5. CERTIFICADO DE INEXISTENCIA DE RESTOS ARQUEOLÓGICOS – PMA (DE CORRESPONDER)',indent:2},
{tituloSubtitulo:'4.6. ESTUDIO DE IMPACTO AMBIENTAL (APROBACIÓN DEL INSTRUMENTO AMBIENTAL DE ACUERDO A LA NORMATIVA VIGENTE PARA EL CASO)',indent:2},
{tituloSubtitulo:'4.7. ESTUDIO DE SEGURIDAD Y SALUD OCUPACIONAL',indent:2},
{tituloSubtitulo:'4.8. INFORME DE RIESGOS Y DESASTRES',indent:2},
{tituloSubtitulo:'4.9. PLAN DE CAPACITACIÓN Y ASISTENCIA TÉCNICA',indent:2},
{tituloSubtitulo:'CAPITULO V: DISEÑOS',indent:1},
{tituloSubtitulo:'5.1. DISEÑO AGROLÓGICO',indent:2},
{tituloSubtitulo:'5.2. DISEÑO HIDRÁULICO',indent:2},
{tituloSubtitulo:'5.3. DISEÑO ESTRUCTURAL',indent:2},
{tituloSubtitulo:'5.4. OTROS DISEÑOS (DE CORRESPONDER)',indent:2},
{tituloSubtitulo:'CAPITULO VI: ESPECIFICACIONES TÉCNICAS',indent:1},
{tituloSubtitulo:'6.1. ESPECIFICACIONES TÉCNICAS GENERALES',indent:2},
{tituloSubtitulo:'6.1.1 DESCRIPCIÓN',indent:3},
{tituloSubtitulo:'6.1.2. MATERIALES',indent:3},
{tituloSubtitulo:'6.1.3. CONTROLES DE CALIDAD',indent:3},
{tituloSubtitulo:'6.1.4. UNIDAD DE MEDIDA',indent:3},
{tituloSubtitulo:'6.1.5. FORMA DE PAGO',indent:3},
{tituloSubtitulo:'CAPITULO VII: METRADOS',indent:1},
{tituloSubtitulo:'7.1. RESUMEN DE METRADOS',indent:2},
{tituloSubtitulo:'7.2. PLANILLA DE METRADOS',indent:2},
{tituloSubtitulo:'CAPITULO VIII: PRESUPUESTO',indent:1},
{tituloSubtitulo:'8.1. RESUMEN DE PRESUPUESTO',indent:2},
{tituloSubtitulo:'8.2. PRESUPUESTO GENERAL POR PARTIDAS',indent:2},
{tituloSubtitulo:'8.3. DESAGREGADO DEL PRESUPUESTO ANALÍTICO GENERAL',indent:2},
{tituloSubtitulo:'8.4. ANÁLISIS DE PRECIOS UNITARIOS',indent:2},
{tituloSubtitulo:'8.5. RELACIÓN DE INSUMOS',indent:2},
{tituloSubtitulo:'8.6. FÓRMULA POLINÓMICA Y AGRUPAMIENTO',indent:2},
{tituloSubtitulo:'8.7. DESAGREGADO DE GASTOS GENERALES',indent:2},
{tituloSubtitulo:'8.8. DESAGREGADO DE SUPERVISIÓN DE OBRA',indent:2},
{tituloSubtitulo:'8.9. DESAGREGADO DE INDEMNIZACIONES DE ÁREAS AFECTADAS',indent:2},
{tituloSubtitulo:'8.10. CÁLCULO DE FLETE',indent:2},
{tituloSubtitulo:'8.10.1. DESAGREGADO DE FLETE DE MATERIALES E INSUMOS',indent:3},
{tituloSubtitulo:'8.10.2. DESAGREGADO DE MOVILIZACIÓN Y DESMOVILIZACIÓN DE EQUIPOS Y MAQUINARIAS',indent:3},
{tituloSubtitulo:'8.11. CRONOGRAMAS',indent:2},
{tituloSubtitulo:'8.11.1. CRONOGRAMA GANTT DE AVANCE FÍSICO DE OBRA',indent:3},
{tituloSubtitulo:'8.11.2. CRONOGRAMA VALORIZADO DE OBRA',indent:3},
{tituloSubtitulo:'8.11.3. CRONOGRAMA DE ADQUISICIÓN DE INSUMOS',indent:3},
{tituloSubtitulo:'8.12. COTIZACIONES (03 como mínimo de los insumos más representativos)',indent:2},
{tituloSubtitulo:'CAPITULO IX: PLAN DE GESTIÓN DE RIESGOS EN LA PLANIFICACIÓN DE EJECUCIÓN DE LA OBRA',indent:1},
{tituloSubtitulo:'9.1. NOMBRE DEL PROYECTO',indent:2},
{tituloSubtitulo:'9.2. UBICACIÓN GEOGRÁFICA',indent:2},
{tituloSubtitulo:'9.3. METAS DEL PROYECTO',indent:2},
{tituloSubtitulo:'9.4. DESCRIPCIÓN DE LA ZONA DEL PROYECTO',indent:2},
{tituloSubtitulo:'9.4.1. ASPECTO SOCIAL',indent:3},
{tituloSubtitulo:'(Describirá las organizaciones sociales existentes en la zona, antecedentes de conflictos sociales, grado de educación general, análisis de mano de obra calificada y no calificada disponible en la zona del proyecto, otros datos necesarios)',indent:3},
{tituloSubtitulo:'9.4.2. ASPECTO ECONÓMICO',indent:3},
{tituloSubtitulo:'(Describirá las cantidad y tipo de comercios de la zona del proyecto como lugares de alojamiento, comercio de abarrotes, comercio ferretero, restaurantes, estado se servicios básicos, otros datos necesarios)',indent:3},
{tituloSubtitulo:'9.4.3. ASPECTO FÍSICO',indent:3},
{tituloSubtitulo:'(Describirá la geología y topografía de la zona, rutas de accesos y estado de los mismos, tipo de vehículo para acceso, puntos geográficos críticos en la zona de influencia, antecedentes de desastres naturales otros datos necesarios).',indent:3},
{tituloSubtitulo:'9.4.4. OTROS ASPECTOS',indent:3},
{tituloSubtitulo:'(Incluirá todos los aspectos que considere necesarios para una adecuada identificación y sustento de los riesgos durante la ejecución de la obra)',indent:3},
{tituloSubtitulo:'9.5. PROCESAMIENTO',indent:2},
{tituloSubtitulo:'9.5.1. IDENTIFICACIÓN DE RIESGOS',indent:3},
{tituloSubtitulo:'(Identificará los riesgos tomando como referencia el numeral 7.2 de la directiva n° 12-2017-osce/cd y guardará concordancia con los aspectos descritos en el literal c). Añadirá una breve descripción de los riesgos)',indent:3},
{tituloSubtitulo:'9.5.2. ANÁLISIS DE RIESGOS',indent:3},
{tituloSubtitulo:'(se realizará un análisis cualitativo de cada riesgo identificado para valorar su probabilidad de ocurrencia e impacto en la ejecución de la obra. El análisis será coherente con lo descrito en el literal a.2).',indent:3},
{tituloSubtitulo:'9.5.3. PLANIFICACIÓN DE RESPUESTA A RIESGOS',indent:3},
{tituloSubtitulo:'(Se realizará una descripción concisa de las acciones de respuesta para evitar, mitigar, transferir o aceptar cada riesgo identificado.',indent:3},
{tituloSubtitulo:'9.5.4. ASIGNACIÓN DE RIESGOS',indent:3},
{tituloSubtitulo:'(Se presentará la justificación de la asignación de cada riesgo identificado)',indent:3},
{tituloSubtitulo:'9.6. ANEXOS',indent:2},
{tituloSubtitulo:'(Se presentará los anexos propuestos en la directiva n° 12-2017-osce/cd, que contendrá un resumen de lo desarrollado en el literal d)',indent:2},
{tituloSubtitulo:'Anexo n° 1: formato para identificar, analizar y dar respuesta a riesgos.',indent:2},
{tituloSubtitulo:'Anexo n° 2: matriz de probabilidad e impacto según guía pmbok.',indent:2},
{tituloSubtitulo:'Anexo n° 3: formato para asignar riesgos.',indent:2},
{tituloSubtitulo:'CAPÍTULO X: PLANOS Y LÁMINAS',indent:1},
{tituloSubtitulo:'10.1. ÍNDICE DE PLANOS',indent:2},
{tituloSubtitulo:'10.2. PLANO DE UBICACIÓN Y LOCALIZACIÓN',indent:2},
{tituloSubtitulo:'10.3. PLANO TOPOGRÁFICO',indent:2},
{tituloSubtitulo:'10.4. PLANO CLAVE',indent:2},
{tituloSubtitulo:'10.5. PLANO PLANTA, PERFILES LONGITUDINALES Y SECCIONES TRANSVERSALES',indent:2},
{tituloSubtitulo:'10.6. PLANO DE DETALLE DE OBRAS DE ARTE',indent:2},
{tituloSubtitulo:'10.7. PLANODE CANTERAS Y PUNTOS DE AGUA',indent:2},
{tituloSubtitulo:'10.8. PLANO DE DEPÓSITO DE MATERIAL EXCEDENTE',indent:2},
{tituloSubtitulo:'10.9. PLANO DE AFECTACIONES',indent:2},
{tituloSubtitulo:'10.10. OTROS PLANOS DE CORRRESPONDER',indent:2},
{tituloSubtitulo:'CAPÍTULO XI: ANEXOS',indent:1},
{tituloSubtitulo:'* PANEL FOTOGRÁFICO',indent:2},
{tituloSubtitulo:'* CONSTANCIA DE SUSTENTACIÓN Y PLANTEAMIENTO DEL PROYECTO',indent:2},
{tituloSubtitulo:'* ACREDITACION DE DISPONIBILIDAD DE RECURSO HIDRICO VIGENTE',indent:2},
{tituloSubtitulo:'* AUTORIZACIÓN DE ESTUDIOS PARA LA EJECUCIÓN DE OBRAS EN FUENTE NATURAL DE AGUA (ANA)',indent:2},
{tituloSubtitulo:'* ACTA DE ACEPTACIÓN DEL PROYECTO POR PARTE DE LOS BENEFICIARIOS',indent:2},
{tituloSubtitulo:'* ACTA LEGALIZADA DE LIBRE DISPONIBILIDAD DE TERRENO O DOCUMENTO SIMILAR.',indent:2},
{tituloSubtitulo:'* DOCUMENTOS DE SANEAMIENTO FISICO LEGAL (SEGÚN CORRESPONDA)',indent:2},
{tituloSubtitulo:'* ACTA DE LIBRE DISPONIBILIDAD DE TERRENO PARA BOTADERO',indent:2},
{tituloSubtitulo:'* ACTA DE COMPROMISO DE OPERACIÓN Y MANTENIMIENTO',indent:2},
{tituloSubtitulo:'* PADRÓN DE BENEFICIARIOS',indent:2},
{tituloSubtitulo:'* FICHA DE COMPATIBILIDAD DEL ESTUDIO, A NIVEL DE PERFIL CON EL EXPEDIENTE TÉCNICO Y/O FORMATO 08-A DEL INVIERTE.PE.',indent:2},
{tituloSubtitulo:'* FICHA INVIERTE.PE.',indent:2},
        ]

        const nombreObra = "MEJORAMIENTO DEL SERVICIO DE PROVISIÓN DE AGUA PARA RIEGO EN EL SISTEMA DE RIEGO PARCELARIO DEL GRUPO DE GESTIÓN EMPRESARIAL PAMPACANCHA-RECUAY DE LA LOCALIDAD DE PAMPACANCHA DISTRITO DE RECUAY DE LA PROVINCIA DE RECUAY DEL DEPARTAMENTO DE ANCASH” CON CUI N° 2606880"
        const pieDePagina = "INDICE GENERAL - MUNICIPALIDAD DISTRITAL DE RECUAY"
        this.valorizacionService.generaIndiceEnDriveWord(indices,nombreObra,pieDePagina)

    }


    @Get('generaseparadores')
    async createFoldersInWindows(@Req() req:Request){
        const indices: Array<ISeparador> = [
          { esSeparador: 1, titulo: "Caratula", columna: 1 },
          { esSeparador: 1, titulo: "Indice", columna: 1 },
          { esSeparador: 1, titulo: "Hoja de resumen de pago al supervisor", columna: 1,},
          { esSeparador: 1, titulo: "Factura o Recibo por Honorarios", columna: 1,},
          { esSeparador: 1, titulo: "Copia de contrato del Consultor",columna: 1,},
          { esSeparador: 1, titulo: "Copia de RNP vigente (consultor de obra)",columna: 1,},
          { esSeparador: 1, titulo: "Certificado de Habilidad del supervisor en original vigente",columna: 1,},
          { esSeparador: 1, titulo: "Informe del supervisor dando su conformidad", columna: 1,},
          { esSeparador: 1, titulo: "Ficha de Identificacion de la Obra	",columna: 1,},
          { esSeparador: 1, titulo: "Resumen de Valorizacion Mensual",columna: 1,},
          { esSeparador: 1, titulo: "Resumen de Metrados Ejecutados",columna: 1,},
          { esSeparador: 1, titulo: "Valorizacion Mensual de Avance de Obra, Firmado por el Supervisor y Residente",columna: 1,},
          { esSeparador: 1, titulo: 'Control de Avance de Obra (Curva "S")',columna: 1,},
          { esSeparador: 1,titulo:  "Cuadro de Reajuste de Precios",columna: 1,},
          { esSeparador: 1, titulo: "Indices Unificados", columna: 1 },
          { esSeparador: 1,titulo:  "Copia de la Formula Polinomica Del Expediente Tecnico",columna: 1,},
          { esSeparador: 1, titulo: "Copia del Cuaderno de Obra", columna: 1 },
          { esSeparador: 1,titulo:  "Calendario de Avance de Obra Programado Fechado o Calendario de Avance de Obra Valorizado Actualizado",columna: 1,},
          { esSeparador: 1,titulo: "Calendario de Avance de Obra Programado Vs Ejecutado",columna: 1,},
          { esSeparador: 1, titulo: "Copia de Actas", columna: 1 },
          { esSeparador: 1,titulo: "Ensayos y Protocolos de Prueba",columna: 1,},
          { esSeparador: 1,titulo: "Certificados de Calidad de Materiales",columna: 1,},
          { esSeparador: 1,titulo: "Panel Fotografico (Partidas Ejecutadas)",columna: 1,},
          { esSeparador: 1,titulo: "Informacion en Digital del Informe Mensual Del Supervisor",columna: 1,},
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
