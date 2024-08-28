import { Inject, Injectable } from "@nestjs/common";
import { DocsConfig } from "../types/docs.config";
import { Footer, Header, ImageRun, LevelFormat, Paragraph, TextRun, ParagraphChild, UniversalMeasure, PositiveUniversalMeasure } from "docx";
import * as fs from 'fs'

export interface IIndentAttributesProperties {
    readonly start?: number | UniversalMeasure;
    readonly end?: number | UniversalMeasure;
    readonly left?: number | UniversalMeasure;
    readonly right?: number | UniversalMeasure;
    readonly hanging?: number | PositiveUniversalMeasure;
    readonly firstLine?: number | PositiveUniversalMeasure;
}
enum Eheading{
    HEADING_1 = "Heading1",
    HEADING_2 = "Heading2",
    HEADING_3 = "Heading3",
    HEADING_4 = "Heading4",
    HEADING_5 = "Heading5",
    HEADING_6 = "Heading6",
  }
  enum EAlignment {

  }
interface IAddParagraph {
    children: ParagraphChild[],
    heading?:Eheading,
    numbering?:{
        reference: string,
        level: number
    },
    indent?:IIndentAttributesProperties,
    pageBreakBefore?: boolean,
    spacing?: { line: number,before?:number,after?:number },
    alignment?:'distribute'
}

@Injectable()
export class DocsService  {
    constructor(
        @Inject("CONFIG") private config: DocsConfig,
    ){}
    /**
     * @description Setea la imagen de la derecha de la hoja
     * @param fileImageName El nombre del archivo con el que fue subido
     */
    setHeaderIndexImageFileRight(fileImageName:string){
        
        this.config.headerIndexImageFileRight = fileImageName
    }
    numberingAndBullets(reference:string){
        return {
            config: [
                {
                    reference,
                    levels: [
                        {
                            level: 0,
                            format: LevelFormat.DECIMAL,
                            text: "%1)",
                            start: 50,
                        },
                    ],
                },
            ],
        }

    }
    addParagraph(parrafo:IAddParagraph){
        return new Paragraph(parrafo)
    }
    
    setFooter(textFooter:string){
    return {
        default: new Footer({ // The standard default footer on every page or footer on odd pages when the 'Different Odd & Even Pages' option is activated
            children: [
                new Paragraph({//linea
                    children:[
                        new ImageRun({data: fs.readFileSync(this.config.footerIndexLineImageFile),transformation:{width:5,height:700,flip: {horizontal: true},rotation: 90},
                        floating:this.config.footerFloatingPositionLineImageFile })]}
                ),
                new Paragraph({children:[
                    new TextRun({text:textFooter,color:"007aff",bold:true})
                ]
                })               
            ]
        })
       }
    
    }

    setHeader(textoCabecera:string){
        
        return  {
            default: new Header({
                children: [
                    new Paragraph({//IMAGEN DE LA IZQUIERDA
                        children:[
                            new ImageRun({data: fs.readFileSync(this.config.headerIndexImageFileLeft),transformation:{width: 73,height: 73,},
                            floating: this.config.headerFloatingPositionImageLeft})]
                    }),                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
                    new Paragraph({children: [ new TextRun({text: textoCabecera})],alignment:'center'}),
                
                new Paragraph({//IMAGEN DE LA DERECHA
                    children:[
                        new ImageRun({data: fs.readFileSync(this.config.headerIndexImageFileRight),transformation:{width: 73,height: 73,},
                        floating: this.config.headerFloatingPositionImageRight})]}
                ),
                new Paragraph({//linea
                    children:[
                        new ImageRun({data: fs.readFileSync(this.config.headerIndexLineImageFile),transformation:{width:1,height:600,flip: {horizontal: true},rotation: 90},
                        floating: this.config.headerFloatingPositionLineImageFile})]}
                ),
                        
                        
            ],
            
        }),
    }
        

    }
    
}