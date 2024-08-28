import { Inject, Injectable } from '@nestjs/common';
import { CreateValorizacionDto, ActualizaValorizacionDto, AgregaevidenciafotograficaDto, ActualizaValorizacionFolderIdDTO } from '../dtos/crud.valorizacion.dto';
import { JwtService } from '@nestjs/jwt';
import { ValorizacionEntity } from '../entity/valorizacion.entity';
import { IVALORIZACION_REPOSITORY, IValorizacionRepository } from '../patronAdapter/valorizacion.interface';
import { jwtConstants } from 'src/shared/configGobal';
import { HttpService } from "@nestjs/axios";
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs'
import createReport from 'docx-templates';
import { map, tap } from 'rxjs/operators';
import { GoogleDriveService } from 'src/googledrivecasa/services/googledrive.service';
import { IObraRepository, IOBRA_REPOSITORY } from 'src/obra/patronAdapter/obra.interface';
import { FilterQuery } from 'mongoose';
import { ObraEntity } from 'src/obra/entity/obra.entity';
import { firstValueFrom } from 'rxjs';
import { GoogleDocService } from 'src/googledrivecasa/services/googledoc.service';
import { Alignment, AlignmentType, Bookmark, Document, Footer, Header, HeadingLevel, HorizontalPositionAlign, HorizontalPositionRelativeFrom, ImageRun, InternalHyperlink, LevelFormat, Packer, PageBreak, PageReference, Paragraph, ShadingType, TableOfContents, TextRun, TextWrappingSide, TextWrappingType,File, StyleLevel, TabStopPosition, convertInchesToTwip, IRunOptions, ParagraphChild, IParagraphOptions, SequentialIdentifier, INumberingOptions, ICharacterStyleOptions, IParagraphStyleOptions, ISectionPropertiesOptions, ISectionOptions, convertMillimetersToTwip } from "docx";
import { fixPathAssets, fixPathEspecificacionesTecnicas, fixPathFromSRC, pathEspecificacionesTecnicas, scanDirs } from 'src/shared/toolbox/fixPath';
import { NumerosALetrasPeruano } from 'src/shared/toolbox/numeroALetras';
import { IPADRE_REPOSITORY, IPadreRepository } from '../patronAdapter/adapter.ts';
import { Hijo } from './polimorfismo/hijo';
import { DocsService } from 'src/docs/services/docs.service';
import { IDefaultStylesOptions } from 'docx/build/file/styles/factory';
import { prepareToParagraphsChildren } from '../functions/herramientas';
import { serial } from 'src/shared/toolbox/promiseInSerial';

export interface IIndice {
    tituloSubtitulo: string;
    indent: number;
}
export interface ISeparador{
    esSeparador:number;
    titulo:string;
    columna:number;
}

@Injectable()
export class ValorizacionService {
    googleFileId:string
    googleFileId2:string
    constructor(
        @Inject(IVALORIZACION_REPOSITORY) private ivalorizacionRepository:IValorizacionRepository,
        @Inject(IOBRA_REPOSITORY) private iobraRepository:IObraRepository, 
        private jwtService: JwtService,
        private readonly googleDriveService: GoogleDriveService,
        protected readonly googleDocService:GoogleDocService,
        private readonly httpService : HttpService,
        //probando directamente como servicio
        @Inject(IPADRE_REPOSITORY) private iPadreRepository:IPadreRepository,
        private myhijo:Hijo,
        private toolsDoc:DocsService

    ){}
    async saludaHijo(){
        //this.iPadreRepository.configuraSaludo("habla macho")
        //this.iPadreRepository.saluda()
        this.myhijo.implementaEdad(25)
        this.myhijo.muestraEdad()
    }

    async creaperiodovalorizacion(creaValorizacionDto: CreateValorizacionDto): Promise<ValorizacionEntity> {
        return await  this.ivalorizacionRepository.creaperiodovalorizacion(creaValorizacionDto)
    }

    async buscaById(obraId:string ): Promise<ValorizacionEntity> {
        return await this.ivalorizacionRepository.buscaById({obraId})
    }

    async buscaValoByObraId(obraId:string ): Promise<ValorizacionEntity> {
        return await this.ivalorizacionRepository.buscaValorizacionByObraId({obraId})
    }

    async actualizaValorizacion(obraId:string, actualizaObraDto:ActualizaValorizacionDto): Promise<ValorizacionEntity> {
        return await this.ivalorizacionRepository.actualizaValorizacion({obraId},actualizaObraDto)
    }

    async actualizaValorizacionFolderId(actualizaValorizacionFolderIdDTO: ActualizaValorizacionFolderIdDTO){
        
        return await this.ivalorizacionRepository.actualizaValorizacionFolderId(actualizaValorizacionFolderIdDTO)
    }

    async listaValorizaciones(){
        return await this.ivalorizacionRepository.listaValorizaciones({})
    }
    async subeImagenADrive(file:Express.Multer.File,idForGoogleElement: string){
        return await this.googleDriveService.subirImagen(file,idForGoogleElement)
    }
    async creaCarpetaDrive(carpetaContenedora:string,nombrecarpeta:string){
        return await this.googleDriveService.crearCarpeta(carpetaContenedora,nombrecarpeta)
    }

    async agregaevidenciafotografica(evidenciaFotografica:AgregaevidenciafotograficaDto):Promise<AgregaevidenciafotograficaDto>{
        
        const macho:any = await this.ivalorizacionRepository.agregaevidenciafotografica(evidenciaFotografica) 
        
        return macho
    }
    async showPicture(fileId:string){
        const fileid= "1llt9PCpU6Wlm97Y9GyIS1QpxOPPBuRtg"
        return await this.googleDriveService.obtenerwebViewLink(fileid)
    }
    async buscaObraById(obraId:string){
        const  entityFilterQuery: FilterQuery<ObraEntity> = {
            obraId
            
        }

        return await this.iobraRepository.buscaObraByObraId(entityFilterQuery)
    }

    async validateToken(token:string):Promise<string>{
        console.log(token)
        const verify = this.jwtService.verify(token.split(" ",2)[1],jwtConstants)
        return await verify.id
    }
    
    async dadoUnMesSeleccionadoMostarSuPanelFotografico(obraId:string,mesSeleccionado:string){
        return await this.ivalorizacionRepository.dadoUnMesSeleccionadoMostarSuPanelFotografico(obraId,mesSeleccionado)
    }
    async buscaMesSeleccionadoFolderIdPorMesSeleccionado(obraId:string,mesSeleccionado:string){
        return await this.ivalorizacionRepository.buscaMesSeleccionadoFolderIdPorMesSeleccionado(obraId,mesSeleccionado)
    }
    async actualizaEvidenciaFotografica(evidenciaFotografica:AgregaevidenciafotograficaDto){
        return await this.ivalorizacionRepository.actualizaEvidenciaFotografica(evidenciaFotografica)
    }
    //llamadas a pandas
    /*async calculoVertical(){
        return this.http.post('http://127.0.0.1:8000/hola/valores', data).pipe(//cambiar la url por la que está en el servidor IIS
            map((resp) => resp.data),
            tap((data) =>  console.log({"data":data})),
        );
    }*/
    async  llamaAPandas() {
        const data = {
            'ID': [1, 2, 3, 4, 5],
            'Name': ['Car A', 'Car B', 'Car C', 'Car D', 'Car E'],
            'Price': [25000, 30000, 35000, 40000, 45000]}

        return this.httpService.post('http://127.0.0.1:8000/hola/valores', data).pipe(//cambiar la url por la que está en el servidor IIS
            map((resp) => resp.data),
            tap((data) =>  console.log({"data":data})),
        );

        
    }

    async  valorizacion(data:any) {
        
        return this.httpService.post('http://127.0.0.1:8000/hola/valorizacion', data).pipe(//cambiar la url por la que está en el servidor IIS
            map((resp) => resp.data),
            tap((data) =>  console.log({"data":data})),
        );
    
    }
    async listaFotosSegunObraMesSeleccionado(obraId:string,mesSeleccionado:string){
        return await this.ivalorizacionRepository.listaFotosSegunObraMesSeleccionado(obraId,mesSeleccionado) 

    }
    public returnresponsetypeservice(){
        return  this.httpService.get('http://localhost:3000/valorizacion/creadocumentopanelfotografico',{responseType:'arraybuffer'})

    }
   

    public async informeresidente(googleFileId:string){
        
        
        return NumerosALetrasPeruano(1111234.25)

        /*const obra = await this.iobraRepository.buscaObraByObraId({obraId:'65d91ea6cc44ee97bd625b0d'})
        const logoId = obra.logoUrl.split('&id=',2)[1]
        const cabeceraImagen = await this.googleDriveService.descargaImagenArrayBuffer(logoId)
        
       
        firstValueFrom(this.httpService.get(`https://drive.google.com/uc?export=download&id=1foBGONUoa4CBglDWKqrXDSMVP3zDYoFi`,{ responseType:'arraybuffer'}))//copia la plantilla
                .then(async (arrayBuffer1:any)=>{
                    patchDocument(arrayBuffer1.data, {
                        patches: {
                            //inicia la definicion de patches que seran reemplazados en la plantilla e define {{encabezado}}
                            encabezado: patchEncabezado(cabeceraImagen),
                            //tabla
                            table: patchTable(partidas)
                        },
                    })//fin definicion del patch
                    .then(
                        async(patch)=>{
                            //creara un documento el google con los patch definidos y reemplazados anteriormente
                            this.googleFileId = await this.googleDocService.creaDocumento(patch,"tmp informe","1VDf6sK9Whc3SMwRgPMP9jl8KQ1b5lf7t")//crea un nuevo archivo en google, con la plantilla reemplazada
                           
                        })                             
                              //inicio del reemplazo utilizando docx-template
                    .then(()=>{
                        firstValueFrom(this.httpService.get(`https://drive.google.com/uc?export=download&id=${this.googleFileId}`,{ responseType:'arraybuffer'}))
                            .then(async(arrayBuffer2:any)=>{
                            
                                    let template = Buffer.from(arrayBuffer2.data,'binary')
                                    const buffer1 = await createReport({//reemplaza los valores segun plantilla
                                    template,
                                    data:contenido
                                    //en caso que se necesite reemplazar imagenes, el formato debe ser el siguiente
                                    
                                     // data:{
                                     //       cabecera:{//los cuatro elementos sirven para representar la foto
                                     //           data:this.googleDriveService.descargaImagenArrayBuffer(url).data,
                                     //           extension:".jpeg",
                                     //           height:3,
                                     //           width:5
                                     //       },
                                     

                                });
                    
                                this.googleDocService.creaDocumento(buffer1,"informe residente","1VDf6sK9Whc3SMwRgPMP9jl8KQ1b5lf7t")//crea un nuevo archivo en google, con la plantilla reemplazada
                                this.googleDocService.eliminaDocumentoCarpeta(this.googleFileId)
            
                                })
                                //.then(()=>{

                                //})
                                
                            
                            })
                        })*/
    
    }
  
    public async generaSeparadores(indices){ 
        const fuentedeletra = fixPathAssets('AmoeraRegular.otf')
        const myseparador = fixPathAssets('separadorv4.png')
        let listaSeparadores = [];
        let misarchivosSeparadores = [];
        listaSeparadores = indices.filter((val) => {
            return val.esSeparador === 1
        })
        misarchivosSeparadores = listaSeparadores.map((ele)=>{
            let jo =  new PDFDocument({ size: "A4" })
            jo.image(myseparador, 0, 0, { width: 594, height: 841 }).moveDown().font(fuentedeletra)
            .fontSize(25)
            .text(`${ele.titulo}`, 150, 200, { align: 'justify' }).end()
        return jo
        })    
                    
        const promiseCarpetas = listaSeparadores.map(separador => () => 
            {
                if(separador.titulo.length > 254/2){
                    separador.titulo = separador.titulo.substring(0,separador.titulo.length - 255/3)
                }

            return this.googleDriveService.crearCarpetav1("1VDf6sK9Whc3SMwRgPMP9jl8KQ1b5lf7t", separador.titulo)
            } 
    )
       
        serial(promiseCarpetas)
            .then(async (promiseFolders: any[]) => {
                promiseFolders.forEach((folderId, index) => {
                    const carpetaContenedoraId = folderId.data.id
                    //validar que el numero de caracteres de la carpeta a crear no supere los 255/2 caracteres
                    let nuevoTitulo:string = listaSeparadores[index].titulo
                    //validamos que el titulo de la parpeta asi como la del archivo no superes enre los dos los 255 caracteres
                    if(nuevoTitulo.length > 254/2){
                        nuevoTitulo = nuevoTitulo.substring(0,nuevoTitulo.length - 255/3)}
                    console.log(nuevoTitulo)
                    this.generaSeparadoresEnPDF(nuevoTitulo, misarchivosSeparadores[index], carpetaContenedoraId)
                })
            })
  }
  public generaIndiceEnDriveWord(indices:Array<IIndice>,textoCabecera:string,textoPiePagina:string) {
      let children = []
      //primer paraffo INDICE
      children.push(new Paragraph({
        children: [
            new TextRun({
                text: "INDICE",
                bold: true,
                allCaps: true,
            })],
        spacing: {
            after: 200,
        },
        alignment: 'center'
    }))
   
      indices.forEach((parrafo)=>{
        children.push(this.toolsDoc.addParagraph({children:[new TextRun({text:parrafo.tituloSubtitulo})],indent:{left:`${0.72*(parrafo.indent-1)}cm`}}))
      })
      let headers = this.toolsDoc.setHeader(textoCabecera)
      let footers = this.toolsDoc.setFooter(textoPiePagina)
      let properties: ISectionPropertiesOptions = {
          page: {
              margin: {
                  header: `0.5cm`,
                  footer: `0.5cm`,
                  //top: 137500/800,
                  //right: 137500/100,
                  bottom: `0.5cm`,
                  //left: 137500/100,
              },
          },
      }

      const doc = new File({
        sections: [{children,footers,headers,properties}],
        
    });
    //consolidando
    Packer.toBuffer(doc).then(async(buffer) => {
        // const docid = await this.googleDocService.creaDocumento(buffer,"indice",'1VDf6sK9Whc3SMwRgPMP9jl8KQ1b5lf7t')//crea un nuevo archivo en google
        this.generaIndiceEnWord(buffer,"indice",'1VDf6sK9Whc3SMwRgPMP9jl8KQ1b5lf7t')    
     }); 

  }
  public async tablaDeContenidos(parrafos:Array<any>){
    let numbering:INumberingOptions = require(fixPathFromSRC("toolsdocx/services/styles/numberingBullets.json"))
    let characterStyles:ICharacterStyleOptions[] = require(fixPathFromSRC("toolsdocx/services/styles/characterStyles.json"))
    let paragraphStyles:IParagraphStyleOptions[] = require(fixPathFromSRC("toolsdocx/services/styles/paragraphStyles.json"))
    let default1:IDefaultStylesOptions = require(fixPathFromSRC("toolsdocx/services/styles/headingDefault.json"))
        
    let children = prepareToParagraphsChildren(parrafos)
    children = children.map((element)=>{
        return this.toolsDoc.addParagraph(element)

    })
    
    children.unshift(new Paragraph({text:"",pageBreakBefore:true}))
    children.unshift(new TableOfContents("Summary", {
        hyperlink: true,
        headingStyleRange: "1-5",
        stylesWithLevels: [new StyleLevel("MySpectacularStyle", 1)],
    }),)
    let jo = fixPathAssets("logo_ferminv1.png")
    children.push(new Paragraph({
        children:[new ImageRun({
            data:fs.readFileSync(jo),
            transformation:{
                height:100,
                width:100
            },
            
                            outline: {
                                cap:"SQUARE",
                                type: "solidFill",
                                solidFillType: "rgb",
                                value: "0000FF",
                                width: convertMillimetersToTwip(600),

                            }
        })]
    }))
//console.log(children)
    const doc = new File({
        numbering,
        features: {updateFields: true},styles: {characterStyles,paragraphStyles,default:default1},
        sections: [{children}],
    });

    Packer.toBuffer(doc).then(async(buffer) => {
        this.generaIndiceEnWord(buffer,"especificaciones tecnicas",'1VDf6sK9Whc3SMwRgPMP9jl8KQ1b5lf7t')    
     }); 

  }
  

    public async plantillaDocxV3(){
        const evidencias:any[] = []
        let payload:any
        let carpetaContenedoraId:string
        let evidenciasFotograficasId:any[]=[]
        try {
            payload = await this.buscaMesSeleccionadoFolderIdPorMesSeleccionado('65d91ea6cc44ee97bd625b0d','Diciembre')
            carpetaContenedoraId = payload.periodos[0].mesSeleccionadoFolderId;
            evidenciasFotograficasId = payload.periodos[0].panelFotografico.map((evidenciaFotografica:any,index:number)=>
                    {
                        return evidenciaFotografica.urlFoto.split('&id=',2)[1];
                    })
            const funcs = evidenciasFotograficasId.map(url => () => this.googleDriveService.descargaImagenArrayBuffer(url))
            const serial = funcs =>
            funcs.reduce((promise, func) =>
            promise.then(result => func().then(Array.prototype.concat.bind(result))), Promise.resolve([]))
            //fin de la funcion
-
            serial(funcs)
            .then(async(val:any[])=>{
                
                val.map((myval,index)=>{
                    evidencias.push({
                        nro: `Fotografía N° ${index + 1}`,
                        partida:"imagename.partida",
                        descripcion:"imagename.descripcion",
                        foto:{//los cuatro elementos sirven para representar la foto
                            data:myval.data,
                            extension:".jpeg",
                            height:9,
                            width:11
                        },
                    })
                })
                const objetivos = [
                    {nombre:"uno"},{nombre:"dos"}, {nombre:"tres"},{nombre:"cuatro"}]
            //
           firstValueFrom(this.httpService.get(`https://drive.google.com/uc?export=download&id=13ac0DZICU_2pXnFt-hLl0d6ruRwmYNeY`,{responseType:'arraybuffer'}))//copia la plantilla
          .then(async (arrayBuffer)=>{
            
            let template = Buffer.from(arrayBuffer.data,'binary')
            console.log(evidencias)
            const buffer1 = await createReport({//reemplaza los valores segun plantilla
              template,
              data: {evidencias}
            });
    
            this.googleDocService.creaDocumento(buffer1,"panel fotografico",carpetaContenedoraId)//crea un nuevo archivo en google, con la plantilla reemplazada
    
          })


        })
           
        } catch (error) {
          
        }
    
      }
      private async generaSeparadoresEnPDF(titulo:string,listaSeparadores:Array<string>[],carpetaContenedoraId:string){
        const ve = await this.googleDriveService.GeneraIndiceEnPDF(titulo,listaSeparadores,carpetaContenedoraId)

      }
      private async generaIndiceEnWord(buffer:Uint8Array,nombreArchivo:string,carpetaContenedoraId:string){
        const docid = await this.googleDocService.creaDocumento(buffer,nombreArchivo,carpetaContenedoraId)//crea un nuevo archivo en google

      }
      private async generaBookmarkEnWord(buffer:Uint8Array,nombreArchivo:string,carpetaContenedoraId:string){
        const docid = await this.googleDocService.creaDocumento(buffer,nombreArchivo,carpetaContenedoraId)//crea un nuevo archivo en google
      }
}


export const contenido = {
        resolucion_aprovacion_exp_tec:"",
        valor_referencial_inc_igv:213456,
        fecha_valor_referencial:"JULIO 2023",
        modalidad_ejecucion:"POR CONTRATA - COSTOS UNITARIOS",
        consentimiento_buena_pro:"31 de Octubre de 2023",
        proceso_seleccion:"Adjudicación Simplificada N°AS-SM-01-2023-MDQ/CS - Primera convocatoria",
        sistema_contratacion:"Costos Unitarios",
        constrato_ejecucion_obra:"Contrato de Adjudicación Simplificada N° 020-2023-MDC/CS - Primera convocatoria",
        fecha_firma_contrato:"14 de Noviembre de 2023",
        
        contrato:{
            monto_contrato:"987456",
            monto_contrato_letras:"funcion numero letras",
        },

        factor_relacion:1.000,
        garantia:{
            garantia_fiel_cumplimiento:123,
            garantia_fiel_cumplimiento_letras:"funcion numero letras"

        },
        fecha_entrega_terreno:"22 de Noviembre de 2023",
        inicio_plazo_contractual:"23 de Noviembre de 2023",
        fin_plazo_contractual:"20 de Mayo de 2024",
        
        adelanto:{
            directo:{estado:"NO SOLICITADO",monto:0},
            materiales:{estado:"NO SOLICITADO",monto:1233}
        },
        




        periodo:"03",
        mesSeleccionado:"Marzo",
        anio:"2024",
        nombre_obra:"Mejoramiento",
        fecha_viabilizacion:'30 de enero del 2024',
        cui:'123321',
        problematica:"falta de agua y desague",
        
        //ubigeo
        region:"Ancash",
        departamento:"Anash",
        provincia:"Ancash",
        distrito:'my distrito',
        localidad:"my localidad",
        //beneficiarios
        poblacion:"150",
        familias:"50",
        
        propietario:"MUNICIPALIDAD DISTRITAL DE CAJAY",
        fuente_financiamiento:"canon y sobre canon",

        fecha_contrato:'30 de enero 2024',
        ganador_buena_pro_obra:
        {
            empresa:{
                nombre_empresa:"",
                representate_legal:""
            },
            consorcio:{
                nombre_consorcio:"hatun huasy",
                representante_comun:"",
                consorciados:"uno,dos,tres"
            }
        },

        ganador_buena_pro_residencia:
        {
            persona_juridica:{
                nombre_apellido:"",
                cip:""
            },
            empresa:{
                nombre_empresa:"empresa supervisora",
                jefe_supervision: {nombre_jefe_supervision:"perico tres palotes",cip:"123654"},
                
            }
        },



       
        plazo_ejecucion:'30',
        
        //personal clave
        personal_clave:{
            residente:{nombre_residente:"MY RESIDENTE",cip:123},
            seguridad:{nombre_residente:"MY SEGURIDAD",cip:321},
            especialista:[
                {nombre_especialista:"MY especialista 1",cip:456},
                {nombre_especialista:"MY ESPECIALISTA 2",cip:654},   
            ]
        },
        
     //FUNCION QUE PERMITE OBTENER LOS OBJETIVOS ESPECIFICOS
        objetivos_especificos:[
            'objetivo 1',
            'objetivo 2'
        ],
        //FUNCION QUE PERMITE TENER LAS METAS FISICAS
        metas_fisicas:[
            {
                metas:[
                    {
                        titulo:'primera meta',
                        detalles:[
                            'detalle primera meta 1',
                            'detalle primera meta 2',
                            'detalle primera meta 3'
                        ]
                    },
                    {
                        titulo:'segunda meta',
                        detalles:[
                            'detalle segunda meta 1',
                            'detalle segunda meta 2',
                            'detalle segunda meta 3'
                        ]

                    }
                ],
            },
            

        ]

}

export const partidas = 
    [
        {
            item:'03',
            descripcion:'SISTEMA DE AGUA POTABLE',
            und:"",
            cantidad:""
        },
        {
            item:'03.01',
            descripcion:'CAPTACION',
            und:"",
            cantidad:""
        },
        {
            item:'03.01.01',
            descripcion:'CAPTACION TIPO C-1 (1 UND) + CERCO PERIMETRICO',
            und:"UND",
            cantidad:"1"
        },
        {
            item:'03.01.02',
            descripcion:'CAPTACION TIPO C-2 (1 UND) + CAMARA HUMEDA + CAMARA SECA + CERCO PERIMETRICO',
            und:"UND",
            cantidad:"1"
        },
        {
            item:'03.02',
            descripcion:'LINEA DE CONDUCCION (L=288.62 M)',
            und:"M",
            cantidad:"2882.61"
        },
        {
            item:'04',
            descripcion:'SISTEMA DE AGUA DESAGUE',
            und:"",
            cantidad:""
        }
    ]

 