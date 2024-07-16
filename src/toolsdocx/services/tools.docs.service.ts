import { Inject, Injectable } from "@nestjs/common";
import { ToolsDocsConfig } from "../types/tools.docs.config";
import { Alignment, AlignmentType, Bookmark, Document, Footer, Header, HeadingLevel, HorizontalPositionAlign, HorizontalPositionRelativeFrom, ImageRun, InternalHyperlink, LevelFormat, Packer, PageBreak, PageReference, Paragraph, ShadingType, TableOfContents, TextRun, TextWrappingSide, TextWrappingType,File, StyleLevel, TabStopPosition, convertInchesToTwip } from "docx";
import * as fs from 'fs'

@Injectable()
export class ToolsDocsService  {
    constructor(
        @Inject("CONFIG") private config: ToolsDocsConfig,
    ){}
    setHeaderIndexImageFileRight(path:string){
        this.config.headerIndexImageFileRight = path
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
                        new ImageRun({data: fs.readFileSync(this.config.lineFooterIndexImageFile),transformation:{width:1,height:600,flip: {horizontal: true},rotation: 90},
                        floating: this.config.footerLineFloatingPositionImage})]}
                ),
                        
                        
            ],
            
        }),
    }
        

    }
    
}