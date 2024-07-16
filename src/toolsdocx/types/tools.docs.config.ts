import { Injectable } from '@nestjs/common';

@Injectable()
export class ToolsDocsConfig {
    //configuracion global para los documentos en word
    fontFile?:string; //estilo de fuente
    //configuracion para el indice
    headerIndexImageFileLeft?:string;//imagen de la izquierda de la cabecera
    headerIndexImageFileRight?:string;//imagen de la derecha de la cabecera
    lineHeaderIndexImageFile?:string;//linea divisora de la cabecera
    lineFooterIndexImageFile?:string;//linea devisora del pie de pagina
    textFooterIndex?:string//texto del pie de pagina
    //configuracion para los separadores
    backgroundSeparatorFile?:string; //imagen de fondo de los separadores
    //
}