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
import { Alignment, AlignmentType, Bookmark, Document, Footer, Header, HeadingLevel, HorizontalPositionAlign, HorizontalPositionRelativeFrom, ImageRun, InternalHyperlink, LevelFormat, Packer, PageBreak, PageReference, Paragraph, ShadingType, TableOfContents, TextRun, TextWrappingSide, TextWrappingType,File, StyleLevel, TabStopPosition, convertInchesToTwip, IRunOptions, ParagraphChild, IParagraphOptions } from "docx";
import { fixPathAssets, fixPathEspecificacionesTecnicas, pathEspecificacionesTecnicas, scanDirs } from 'src/shared/toolbox/fixPath';
import { NumerosALetrasPeruano } from 'src/shared/toolbox/numeroALetras';
import { IPADRE_REPOSITORY, IPadreRepository } from '../patronAdapter/adapter.ts';
import { Hijo } from './polimorfismo/hijo';
import { ToolsDocsService } from 'src/toolsdocx/services/tools.docs.service';



let todosLosParrafos:any[] = []

export interface INombreColumna{
    esNoCorresponde:number;
    esSeparador:number
    titulo:string;
    columna:number
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
        private toolsDoc:ToolsDocsService

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
  
    public async generaSeparadoresConIndice(indices:INombreColumna[],nombreObra:string,pieDePagina:string){ 

        const fuentedeletra = fixPathAssets('AmoeraRegular.otf')
        const myseparador = fixPathAssets('separadorv4.png')  

        let listaSeparadores =[];
        let listaNoCorresponde = [];
        let misarchivosSeparadores = [];
        let misArchivosNoCorresponde:any;

        listaSeparadores = indices.filter((val)=>{
            return val.esSeparador === 1
        })
        listaNoCorresponde = indices.filter((val)=>{
            return val.esNoCorresponde === 1
        })
       
        
        
        
        for(let i=0;i<listaSeparadores.length;i++){
            misarchivosSeparadores[i] = new PDFDocument({
                size:"A4"
            })
        }
        //ES UN UNICO ARCHIVO SIEMPRE CON EL MISMO CONTENIDO, NO LLEVA IMAGEN
        misArchivosNoCorresponde = new PDFDocument({
                size:"A4"
        })
        
        for(let j=0;j<misarchivosSeparadores.length;j++){
            misarchivosSeparadores[j].image(myseparador,0,0,{width:594, height:841})//ancho y largo
            misarchivosSeparadores[j].moveDown();
            misarchivosSeparadores[j]
             .font(fuentedeletra)
             .fontSize(25)
             .text(`${listaSeparadores[j].titulo}`,150,200,{align:'justify'})//150,265
        }

        
            //la hora de no corresponde no lleva imagen y la hoja en la que se imprime es de color blanco
           
            misArchivosNoCorresponde.moveDown();
            misArchivosNoCorresponde
             .font(fuentedeletra)
             .fontSize(25)
             .text(`NO CORRESPONDE`,200,200,{align:'justify'})//150,265
        


       for(let k =0;k<misarchivosSeparadores.length;k++){
        misarchivosSeparadores[k].end()
       }

       
        misArchivosNoCorresponde.end()
       
       
       //para que funcione perfectamente tiene que tener esto: url => () => flecha gruesa dos veces.
       const promiseCarpetas = listaSeparadores.map(separador => () =>this.googleDriveService.crearCarpetav1("1VDf6sK9Whc3SMwRgPMP9jl8KQ1b5lf7t",separador.titulo))
       const serial = funcs =>
            funcs.reduce((promise, func) =>
            promise.then(result => func().then(Array.prototype.concat.bind(result))), Promise.resolve([]))
            serial(promiseCarpetas)
            .then(async(val:any[])=>{
                
                val.forEach((folderId,index)=>{
                    const carpetaContenedoraId = folderId.data.id
                    console.log(carpetaContenedoraId)
                    if(listaSeparadores[index].esNoCorresponde === 1){//cuando es no corresponde, entonces en la carpeta debe haber el nombre del separador y tambien el no corresponde
                        console.log({"no correspnde el titulo":listaSeparadores[index].titulo})  
                        this.generaSeparadoresEnPDF(`${listaSeparadores[index].titulo}-NC`,misArchivosNoCorresponde,carpetaContenedoraId)
                       
                    }
                    console.log({"correspnde al titulo":listaSeparadores[index].titulo}) 
                        this.generaSeparadoresEnPDF(listaSeparadores[index].titulo,misarchivosSeparadores[index],carpetaContenedoraId)
                        
                       
                })
            })
            //gnera el indice en word
                        //agregando los paragragraf
                        let losparrafosDelIndice=[]
                        //primer paraffo INDICE
                        losparrafosDelIndice.push(new Paragraph({
                            children: [
                                new TextRun({
                                text: "INDICE",
                                bold: true,
                                allCaps: true,
                            })],
                            spacing: {
                                after: 200,
                            },
                            alignment:'center'
                        }))
             //insertando la cabecera
             this.googleDriveService.descargaImagenArrayBuffer('1GQIxwW-AkRcBCYGuHv1eua7UNFcnEOaZ').then((cabeceraImagen:any)=>{
                //el contenido
                indices.map((val)=>{
                    losparrafosDelIndice.push(this.toolsDoc.addParagraph(val.columna,val.titulo))
                })
                const doc = new Document({
                    sections: [
                        {  
                            headers: this.toolsDoc.setHeader(nombreObra), 
                            footers: this.toolsDoc.setFooter(pieDePagina),
                            properties: {
                                page: {
                                    margin: {
                                        header:`0.5cm`,
                                        footer:`0.50cm`,
                                        //top: 137500/800,
                                        //right: 137500/100,
                                        bottom: `0.5cm`,
                                        //left: 137500/100,
                                    },
                                },
                            },
                            children: losparrafosDelIndice,
                        },
                    ],
                    //fonts: [{ name: "Pacifico", data: font, characterSet: CharacterSet.ANSI }],
                });
                 
                //consolidando
                Packer.toBuffer(doc).then(async(buffer) => {
                   // const docid = await this.googleDocService.creaDocumento(buffer,"indice",'1VDf6sK9Whc3SMwRgPMP9jl8KQ1b5lf7t')//crea un nuevo archivo en google
                   this.generaIndiceEnWord(buffer,"indice",'1VDf6sK9Whc3SMwRgPMP9jl8KQ1b5lf7t')    
                }); 
            })
  }
  public async tablaDeContenidos(parrafos:Array<any>){
    
    var registraTitulosSubTitulos:any[] = []
    
    registraTitulosSubTitulos[0] = new TableOfContents("Summary", {
            hyperlink: true,
            headingStyleRange: "1-5",
            stylesWithLevels: [new StyleLevel("MySpectacularStyle", 1)],
        })
        
        

    const doc = new File({
        numbering:{
            config:[
                {
                    reference: "mynumeracion",
                    levels: [
                        {
                            level: 0,
                            format: LevelFormat.UPPER_LETTER,
                            text: "%1)",
                            alignment: AlignmentType.START,
                            style: {
                                paragraph: {
                                    indent: { left: 2880, hanging: 2420 },
                                },
                            },
                        },
                        {
                            level: 1,
                            format: LevelFormat.LOWER_LETTER,
                            text: "%1.",
                            alignment: AlignmentType.START,
                            style: {
                                paragraph: {
                                    indent: { left: convertInchesToTwip(1), hanging: convertInchesToTwip(0.68) },
                                },
                            },
                        },
                        {
                            
                                level: 2,
                                format: LevelFormat.BULLET,
                                text: "\u1F60",
                                alignment: AlignmentType.LEFT,
                                style: {
                                    paragraph: {
                                        indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) },
                                    },
                                },
                            
                        },
                        {
                            level: 3,
                                format: LevelFormat.BULLET,
                                text: "\u221A",
                                alignment: AlignmentType.LEFT,
                                style: {
                                    paragraph: {
                                        indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) },
                                    },
                                },
                        },
                    ],
                },
            ],
        },
        features: {
            updateFields: true,
        },
        styles: {
            paragraphStyles: [
                {
                    id: "MySpectacularStyle",
                    name: "My Spectacular Style",
                    basedOn: "Heading1",
                    next: "Heading1",
                    quickFormat: true,
                    run: {
                        italics: true,
                        color: "990000",
                    },
                },
            ],
            default:{
                heading1:{ //titulos y sub titulos
                    run: {
                        font: "Calibri",
                        size: 26,
                        bold: true,
                        color:"ff2d55"
                    },
                    paragraph: {
                        spacing: { line: 340 },//espacio entre lineas de texto
                        //alignment: AlignmentType.JUSTIFIED,
                        //rightTabStop: TabStopPosition.MAX,
                        //leftTabStop: 453.543307087,
                        //indent: { left: convertInchesToTwip(0.5) },
                        
                    },
                },
                heading2:{//titulos de la partida en si
                    run: {
                        font: "Calibri",
                        size: 26,
                        bold: true,
                    },
                    paragraph: {
                        spacing: { line: 340 },//espacio entre lineas de texto
                        //alignment: AlignmentType.JUSTIFIED,
                        //rightTabStop: TabStopPosition.MAX,
                        //leftTabStop: 453.543307087,
                        indent: { left: 190 },
                    },
                },
                heading3:{//definicion de cada partida
                    run:{
                        font: "Calibri",
                        size: 26,//13 en word
                        bold: true,
                    },
                    paragraph:{
                        spacing: { line: 340 },//espacio entre lineas de texto
                        //alignment: AlignmentType.JUSTIFIED,
                        //rightTabStop: TabStopPosition.MAX,
                        //leftTabStop: 453.543307087,
                        indent: { left: 260 },
                    }
                }
            }
        },
        sections: [
            {
                children: main(parrafos),
                    
                
            },
        ],
    });
    
    
    
    Packer.toBuffer(doc).then(async(buffer) => {
        // const docid = await this.googleDocService.creaDocumento(buffer,"indice",'1VDf6sK9Whc3SMwRgPMP9jl8KQ1b5lf7t')//crea un nuevo archivo en google
        this.generaIndiceEnWord(buffer,"mark",'1VDf6sK9Whc3SMwRgPMP9jl8KQ1b5lf7t')    
     }); 

  }
  public async bookmark(){

    let joder = new TextRun("unooo")

    const doc = new File({
        features: {
            updateFields: true,
        },
        styles: {
            paragraphStyles: [
                {
                    id: "MySpectacularStyle",
                    name: "My Spectacular Style",
                    basedOn: "Heading1",
                    next: "Heading1",
                    quickFormat: true,
                    run: {
                        italics: true,
                        color: "990000",
                    },
                },
            ],
            default:{
                heading2:{
                    run: {
                        font: "Calibri",
                        size: 26,
                        bold: true,
                    },
                    paragraph: {
                        spacing: { line: 340 },//espacio entre lineas de texto
                        alignment: AlignmentType.JUSTIFIED,
                        rightTabStop: TabStopPosition.MAX,
                        leftTabStop: 453.543307087,
                        indent: { left: convertInchesToTwip(0.5) },
                    },
                },
                heading3:{
                    run:{
                        font: "Calibri",
                        size: 26,//13 en word
                        bold: true,
                    },
                    paragraph:{
                        spacing: { line: 340 },//espacio entre lineas de texto
                        alignment: AlignmentType.JUSTIFIED,
                        rightTabStop: TabStopPosition.MAX,
                        leftTabStop: 453.543307087,
                        indent: { left: convertInchesToTwip(0.5) },
                    }
                }
            }
        },
        sections: [
            {
                children: [
                    new TableOfContents("Summary", {
                        hyperlink: true,
                        headingStyleRange: "1-5",
                        stylesWithLevels: [new StyleLevel("MySpectacularStyle", 1)],
                    }),
                    new Paragraph({
                        text: "Header #1",
                        heading: HeadingLevel.HEADING_1,
                        pageBreakBefore: true,
                    }),
                    new Paragraph("I'm a little text very nicely written.'"),
                    new Paragraph({
                        text: "Header #2",
                        heading: HeadingLevel.HEADING_1,
                        pageBreakBefore: true,
                    }),
                    new Paragraph({
                        children:[
                            new TextRun("unooo"),new TextRun("doosss")

                        ]
                    }),
                    new Paragraph({
                        text: "Header #2.1",
                        heading: HeadingLevel.HEADING_2,
                    }),
                    new Paragraph({
                        text:"I'm a another text very nicely written.'",
                        heading:HeadingLevel.HEADING_2
                    }),
                    new Paragraph({
                        text: "My Spectacular Style #1",
                        style: "MySpectacularStyle",
                        pageBreakBefore: true,
                    }),
                ],
            },
        ],
    });
    
    
    Packer.toBuffer(doc).then(async(buffer) => {
        // const docid = await this.googleDocService.creaDocumento(buffer,"indice",'1VDf6sK9Whc3SMwRgPMP9jl8KQ1b5lf7t')//crea un nuevo archivo en google
        this.generaIndiceEnWord(buffer,"mark",'1VDf6sK9Whc3SMwRgPMP9jl8KQ1b5lf7t')    
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
            /*
            * serial executes Promises sequentially.
            * @param {funcs} An array of funcs that return promises.
            * @example
            * const urls = ['/url1', '/url2', '/url3']
            * serial(urls.map(url => () => $.ajax(url)))
            *     .then(console.log.bind(console))
            */
            const serial = funcs =>
            funcs.reduce((promise, func) =>
            promise.then(result => func().then(Array.prototype.concat.bind(result))), Promise.resolve([]))
            //fin de la funcion

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

export const styleHeaderIndexWord = ()=>{
    return {
        paragraphStyles: [
        {
            id: "normalPara",
            name: "Normal Para",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
                color: "34aadc",
                font: "Calibri",
                size: 26,
                bold: true,
                //italics: true,
            },
            paragraph: {
                alignment: AlignmentType.CENTER,
                //spacing: { line: 276, before: 20 * 72 * 0.1, after: 20 * 72 * 0.05 },
                //rightTabStop: TabStopPosition.MAX,
                //leftTabStop: 453.543307087,
                //indent: { left: convertInchesToTwip(0.5) },
                /*numbering: {
                    reference: "ref1",
                    instance: 0,
                    level: 0,
                }*/
            },
        }]}

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

 
export interface IConf {
    text:string;
    bold?:boolean;
    break?:number;
    //se pueden definir mas opciones para el texto
    //dependerá de lo que se necesite
}

 export const veamos = (configuracion:IConf)=>{
    
    return new TextRun(configuracion)
 }

 export const main = (parrafos:Array<any>)=>{
    //lista todos los archivos encontrados en la carpeta especificaciones tecnicas
    let rutascompletas = scanDirs(pathEspecificacionesTecnicas())
    rutascompletas = rutascompletas.map(ruta => ruta.path)
    rutascompletas = rutascompletas.map(ele => ele.split('\\').pop().split('/').pop())
    //los nombres de los archivos encontrados
    
    rutascompletas = rutascompletas.map(e=>fixPathEspecificacionesTecnicas(e))
    
    rutascompletas = rutascompletas.map(e=> require(e))
    

let posiciones:any[] = [] 
let elementosallenar:any[] = []

for(let x=0;x<parrafos.length;x++) {
    //identificar las posiciones de las partidas
    if(esTitulo(parrafos[x])){
      //combierte directmente a un parrafo y almacenalo en
      //todosLosParrafos,
      //en su misma posicion
      todosLosParrafos[x] = combierteTituloEnParrafo(parrafos[x])
    }else{
      //es una partida
      //inserta la especificacion tecnica completa de esa partida
      //busca la partida en el catalogo de partidas que tienen especificacion tecnica
      //for(let i = 0;i<rutascompletas.length;i++){
      // if(rutascompletas[i].find((ele:ImyParrafo) => ele.text === parrafos[x][1]) !== undefined){
      //      elementosallenar.push(rutascompletas[i])
      //      todosLosParrafos[x]=""
      //      posiciones.push(x)
      //  }
      //}
      for(let i = 0;i<rutascompletas.length;i++){
        console.log(rutascompletas[i].find((ele:any) => ele.data.text === parrafos[x][1]) !== undefined)
        if(rutascompletas[i].find((ele:any) => ele.data.text === parrafos[x][1]) !== undefined){
            elementosallenar.push(rutascompletas[i])
            todosLosParrafos[x]=""
            posiciones.push(x)
        }
      }
    }
}

let uno = elementosallenar[0].length
rellenaArreglo(elementosallenar[0],posiciones[0])

for(let i=1;i<posiciones.length;i++){
  uno = posiciones[i] + uno
  rellenaArreglo(elementosallenar[i],uno)//1
}


let jo = todosLosParrafos
console.log(JSON.stringify(rutascompletas, null, "\t"))
new Paragraph({
    children:[
        new TextRun({text:"",color:""})
    ]
    
})

//jo = jo.map((e)=>{
    
/*    let parrafo:IAddParagraph ={
        children:[new TextRun({text:e.text,bold:})]
    } 
    return agregaParrafo(e)
})*/
todosLosParrafos = []


//let joder = agregaParrafo({coleccionLineasTexto:[new TextRun({text:"MY TITULO",bold:true,color:"007AFF"})]})
    
    
    return jo//joder//new Paragraph({children:combierteEnTexto(jo)})
    
 }
     

  export const combierteTituloEnParrafo = (titulo:Array<any>) =>{
    let parrafo:string = ""
    //[1,"OBRAS PROVINCIONALES","",""],
    titulo.forEach((elemento)=>{
      parrafo = parrafo + elemento +" "
    })
    
    return {data:{text:parrafo},config:{heading:"Heading1"}}
  
  }
  export const combierteEnTexto = (parrafos:Array<any>)=>{
    return parrafos.map(e => new TextRun(e) )
  }

  export const  esTitulo = (resumenMetrado:Array<any>) =>{
    //es titulo cuando el ultimo elemento del resumen de metrado es  ""
    if(resumenMetrado[3] === ""){
      return true
    }
    else{
      return false
    }
  }
  
  
export const rellenaArreglo = (arrreglo_a_rellenar:Array<any>,posicion_inicio:number)=>{
    const elementos_a_agregar = arrreglo_a_rellenar.length
    for(let i=0;i<elementos_a_agregar;i++){
        todosLosParrafos.splice(posicion_inicio + i,0,arrreglo_a_rellenar[i])
    }
  }
  export const rellenaArregloV1 = (arrreglo_a_rellenar:Array<any>,posicion_inicio:number)=>{
    const elementos_a_agregar = arrreglo_a_rellenar.length
    for(let i=0;i<elementos_a_agregar;i++){
        todosLosParrafos.splice(posicion_inicio + i,0,arrreglo_a_rellenar[i])
    }
  }

  enum Eheading{
    HEADING_1 = "Heading1",
    HEADING_2 = "Heading2",
    HEADING_3 = "Heading3",
    HEADING_4 = "Heading4",
    HEADING_5 = "Heading5",
    HEADING_6 = "Heading6",
  }
  //sirve para agregar parrafos, del tipo
  //titulo, sub titulo
  //texto con firefentes combinaciones de formatos
interface IConfigurationParagraph extends IParagraphOptions{
    heading?:Eheading,
    numbering?:{
        reference: string,
        level: number
    },
    indent?:{
        left:number,
        hanging:number
    }
}
  interface IAddParagraph {
    children: ParagraphChild[],
    options: IConfigurationParagraph
}

export const agregaParrafo = (parrafo:IAddParagraph) => {
    return new Paragraph(parrafo)
}

export const convertToParagraph = ()=>{
    todosLosParrafos.map((e,index)=>{
        if(e.bullet){
            delete todosLosParrafos[index].bullet
        }
        if(e.numbering){
            delete todosLosParrafos[index].numbering
        }

    })
}
