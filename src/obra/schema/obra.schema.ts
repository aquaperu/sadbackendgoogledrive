import { Prop, SchemaFactory,Schema } from "@nestjs/mongoose";
import mongoose, { Model,  SchemaTypes,  Types } from "mongoose";
import {Type} from 'class-transformer'

@Schema()
export class ObraSchema {
    @Prop()
    obraId:string;
    @Prop()
    usuarioId:string;
    @Prop()
    logoUrl:string;
    @Prop()
    obraFolderId:string
    
}

export const OBRA_SCHEMA = SchemaFactory.createForClass(ObraSchema)
export type ObraDocument = ObraSchema & Document
export type ObraModel = Model<ObraSchema>