import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose'
import mongoose, {  Document, Model } from 'mongoose'



@Schema()
export class EvidenciaFotograficaSchemaDTO{
    @Prop()
    partida:string;
    @Prop()
    descripcionTrabajos:string;
    @Prop()
    urlFoto:string;
}
export const EVIDENCIAFOTOGRAFICA_SCHEMA = SchemaFactory.createForClass(EvidenciaFotograficaSchemaDTO)
export type EvidenciaFotograficaDocument = EvidenciaFotograficaSchemaDTO & Document
export type EvidenciaFotograficaModel = Model<EvidenciaFotograficaSchemaDTO>

@Schema()
export class PeriodoSchemaDTO{
    @Prop()
    periodoSeleccionado:string;
    @Prop()
    mesSeleccionado:string;
    @Prop()
    periodoRangoEtiquetas:string;
    @Prop()
    mesSeleccionadoFolderId:string;
  
    

    //inicio funciona
    //@Prop([EvidenciaFotografica])
    //panelFotografico:EvidenciaFotografica[]
    //fin funciona

    @Prop([EVIDENCIAFOTOGRAFICA_SCHEMA])
    panelFotografico:EvidenciaFotograficaSchemaDTO[]
    
}

export const PERIODO_SCHEMA = SchemaFactory.createForClass(PeriodoSchemaDTO)
export type PeriodoDocument = PeriodoSchemaDTO & Document
export type PeriodoModel = Model<PeriodoSchemaDTO>

@Schema()
export class ValorizacionSchemaDTO{
    //@Prop({type:mongoose.Schema.Types.ObjectId})
    //obraId: mongoose.Schema.Types.ObjectId;
    @Prop()
    obraId:string;
    @Prop()
    valorizacionFolderId:string;


    //inicio funciona
    //@Prop([Periodo])
    //periodos:Periodo[]
    //fin funciona
    
    @Prop([PERIODO_SCHEMA])
    periodos:PeriodoSchemaDTO[]
    



    /*@Prop({type:[PERIODO_SCHEMA]})
    @Type(()=>PeriodoSchema)
    periodos:PeriodoSchema[]*/


}
export const VALORIZACION_SCHEMA = SchemaFactory.createForClass(ValorizacionSchemaDTO)
export type ValorizacionDocument = ValorizacionSchemaDTO & Document
export type ValorizacionModel = Model<ValorizacionSchemaDTO>

