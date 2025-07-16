import { Inject, Injectable } from "@nestjs/common";
import { DocsConfig } from "../types/docs.config";
import { Footer, Header, ImageRun, LevelFormat, Paragraph, TextRun, ParagraphChild, UniversalMeasure, PositiveUniversalMeasure, HorizontalPositionRelativeFrom, VerticalPositionRelativeFrom, HorizontalPositionAlign, VerticalPositionAlign, IImageOptions, IFloating } from "docx";
import * as fs from 'fs'
import { string } from "joi";
import { fixPathAssets, fixPathFromSRC } from "src/shared/toolbox/fixPath";
import { dash } from "pdfkit";

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
export enum ESidePosition {
    BOTHSIDES = "bothSides",
    LEFT = 'left',
    RIGHT = 'right',
    LARGEST = 'largest'
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
export enum EHeaderPositionImage{
    HEADERCONFIGIMAGELEFTPOSITION          = "headerConfigImageLeftPosition",
    HEADERCONFIGIMAGERIGHTPOSITION         = "headerConfigImageRightPosition",
    HEADERCONFIGIMAGERIGHTANDLEFTPOSITION  = "headerConfigImageRightAndLeftPosition",
    
}
export enum EHeaderTextPosition{
    HEADERCONFIGIMAGETEXTIMAGEPOSITION     = 'headerConfigImageTextImagePosition',
    HEADERTEXTCENTERPOSITION          = "headerTextCenterPosition",
}

const der :IFloating = {
horizontalPosition:{offset:0},
verticalPosition:{offset:0},
wrap:{type:1,side:"left"}
}
const jo:IImageOptions = {
    data:"",
    transformation:{
        width:100,
        height:100
    },
    floating:der

}
const imageLeft:IImageOptions = {
    
        data:"",
        transformation:{
            width:100,
            height:100
        },
        floating:{horizontalPosition:{offset:0},
        verticalPosition:{offset:0},
        wrap:{type:1,side:"left"}}
    
    

}
const imageRight:IImageOptions = {
    
    data:"",
    transformation:{
        width:100,
        height:100
    },
    floating:{horizontalPosition:{offset:0},verticalPosition:{offset:0},wrap:{type:1,side:"right"}}



}


const lef:IFloating = {
    horizontalPosition:{offset:0},
    verticalPosition:{offset:0},
    wrap:{type:1,side:"left"}
}
const right:IFloating = {
    horizontalPosition:{offset:0},
    verticalPosition:{offset:0},
    wrap:{type:1,side:"left"}
}
const configPositionImage = {
    headerConfigImageLeftPosition:imageLeft,
    headerConfigImageRightPosition:imageRight
    
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

    setHeader(textoCabecera: string) {//funciona correctamente para el caso de imagen izquierda texto imagen derecha
        
        return {
            default: new Header({
                children: [
                    new Paragraph({//IMAGEN DE LA IZQUIERDA
                        children: [
                            new ImageRun({
                                data: fs.readFileSync(this.config.headerIndexImageFileLeft), transformation: { width: 73, height: 73, },
                                floating: this.config.headerFloatingPositionImageLeft
                            })]
                    }),
                    new Paragraph({ children: [new TextRun({ text: textoCabecera })], alignment: 'center' }),//TEXTO DE LA CABECERA
                    new Paragraph({//IMAGEN DE LA DERECHA
                        children: [
                            new ImageRun({
                                data: fs.readFileSync(this.config.headerIndexImageFileRight), transformation: { width: 73, height: 73, },
                                floating: this.config.headerFloatingPositionImageRight
                            })]
                    }
                    ),
                    new Paragraph({//linea
                        children: [
                            new ImageRun({
                                data: fs.readFileSync(this.config.headerIndexLineImageFile), transformation: { width: 2, height: 600, flip: { horizontal: true }, rotation: 90 },
                                floating: this.config.headerFloatingPositionLineImageFile
                            })]
                    }),
                ],
            }),
        }
    }
    
    setHeaderv1(configurationHeader:any) {
       
        let children:Paragraph[] = []
        if('imageLeft' in configurationHeader){//reemplazar la data de imagen
            
              children[0] = new Paragraph({children: [new ImageRun({
                        data: fs.readFileSync(fixPathAssets(configurationHeader.imageLeft.imageName)), transformation: { width: 73, height: 73, },
                        floating: {horizontalPosition:{offset:950000},verticalPosition:{offset:configurationHeader.imageLeft.verticalPosition},wrap:{side:"right",type:1}}
                    })]
            })
        }
        
        if('textHeader' in configurationHeader){
            
            children[1] = new Paragraph({ children: [new TextRun({ text: configurationHeader.textHeader.text })], alignment: 'center' })
        }
        if('imageRight' in configurationHeader){
           
            children[2] = new Paragraph({//IMAGEN DE LA DERECHA
                children: [
                    new ImageRun({
                        data: fs.readFileSync(fixPathAssets(configurationHeader.imageRight.imageName)), transformation: { width: 73, height: 73, },
                        floating: {horizontalPosition:{offset:5900000},verticalPosition:{offset:configurationHeader.imageRight.verticalPosition},wrap:{side:"left",type:1}}
                    })]
            })
        }
        if('lineImage' in configurationHeader){
         children[3] = new Paragraph({//linea
            children: [
                new ImageRun({
                    data: fs.readFileSync(fixPathAssets(configurationHeader.lineImage.imageName)), transformation: { width: 2, height: 600, flip: { horizontal: true }, rotation: 90 },
                    floating: {horizontalPosition:{offset:3700000},verticalPosition:{offset:configurationHeader.lineImage.verticalPosition},wrap:{side:"bothSides",type:2}}
                })]
        })   
            
        }
        return {
            default: new Header({
                children
            }),
        }
    }
}
function manageImagen(sidePosition:ESidePosition,nameImage:string,transformation:{width:number,height:number}={width:73,height:73},horizontalOffset:number=0,verticalOffset:number=0) {
    const fixposition:IImageOptions = {
        data:fs.readFileSync(fixPathAssets(nameImage)),
        transformation,
        floating:{horizontalPosition:{offset:horizontalOffset},verticalPosition:{offset:verticalOffset}, wrap:{type:1,side:sidePosition}}
    }
    return fixposition
}