import { Injectable } from '@nestjs/common';


enum TextWrappingType {
     NONE =  0,
     SQUARE = 1,
     TIGHT =  2,
     TOP_AND_BOTTOM = 3
}
enum TextWrappingSide {
    BOTH_SIDES = "bothSides",
    LEFT = "left",
    RIGHT = "right",
    LARGEST = "largest",
}

interface IFloating{
    horizontalPosition:{offset:number};
    verticalPosition:{offset:number};
    wrap:{type:TextWrappingType,side:TextWrappingSide}
}

@Injectable()
export class ToolsDocsConfig {
    //configuracion global para los documentos en word
    fontFile?:string; //estilo de fuente
    
    //configuracion para el indice
    lineHeaderIndexImageFile?:string;//linea divisora de la cabecera
    headerIndexImageFileLeft?:string;//imagen de la izquierda de la cabecera
    headerIndexImageFileRight?:string;//imagen de la derecha de la cabecera
    headerFloatingPositionImageRight?:IFloating;
    headerFloatingPositionImageLeft?:IFloating;
    
    lineFooterIndexImageFile?:string;//linea devisora del pie de pagina
    footerLineFloatingPositionImage?:IFloating;
    textFooterIndex?:string//texto del pie de pagina
    //configuracion para los separadores
    backgroundSeparatorFile?:string; //imagen de fondo de los separadores
    //
}