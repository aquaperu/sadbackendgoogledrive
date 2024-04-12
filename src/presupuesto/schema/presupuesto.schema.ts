import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Transform, Type } from "class-transformer";
import mongoose, { Collection, Model, SchemaType, SchemaTypes } from "mongoose";
import { Partida } from "../entity/presupuesto.entity";


export class PartidaSchema{
    @Prop()
    item:string;//numero que viene del archivo excel
    @Prop()
    descripcion:string;
    @Prop()
    u_medida:string;
    @Prop()
    metrado:number;
    @Prop()
    p_unitario:number;
    @Prop()
    parcial:number

}

export const PARTIDA_SCHEMA = SchemaFactory.createForClass(PartidaSchema)

@Schema()
export class PresupuestoSchema{
    @Prop({type:mongoose.Schema.Types.ObjectId})
    obraId:mongoose.Schema.Types.ObjectId;
    
    @Prop()
    item:string;
    
   //grega un elemento al array, de tipo cadena
    /*@Prop([String])
    partidas:string[]*/
    
    @Prop([Partida])
    partidas:Partida[]
}
export const PRESUPUESTO_SCHEMA = SchemaFactory.createForClass(PresupuestoSchema)
export type PresupuestoDocument = PresupuestoSchema & Document
export type PresupuestoModel = Model<PresupuestoSchema>
