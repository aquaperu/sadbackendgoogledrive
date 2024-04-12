import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, UpdateQuery } from 'mongoose';
import * as mongoose from 'mongoose'
import { ActualizaFolderId, ActualizaFolderIdV1, CreaObraDto, listaObrasPorUsuarioIdDto } from '../dtos/crud.obra';
import { ObraEntity } from '../entity/obra.entity';
import { ObraDocument, ObraModel } from '../schema/obra.schema';
import { IObraRepository } from './obra.interface';

export class ObraMongoRepository implements IObraRepository{
    constructor(
        @InjectModel(ObraEntity.name) private obraModel:ObraModel
    ){}

    buscaObraByusuarioIdAndObraId(entityFilterQuery: FilterQuery<ObraEntity>, projection?: Record<string, unknown>): Promise<any> {
        return this.obraModel.findOne( entityFilterQuery,{
            _id: 0,
            __v: 0,
            ...projection
        }).exec()
    }
    listaObrasPorUsuarioId(
        entityFilterQuery: FilterQuery<listaObrasPorUsuarioIdDto>,
        projection?: Record<string, unknown>
        ):Promise<any[]>{
        return this.obraModel.find( entityFilterQuery,{
            _id: 0,
            __v: 0,
            ...projection
        }).exec()    
        
    }
    
    
    async creaObra(creaObraDto: CreaObraDto): Promise<any> {
        const nuevaObra = new ObraEntity();
        // se deberia crear en el cliente, puesto que se va a abrir el archivo excel que determina a una determinada obra del usuario.
        nuevaObra.obraId = new mongoose.Types.ObjectId().toString() ; 
        nuevaObra.usuarioId = creaObraDto.usuarioId;
        nuevaObra.logoUrl = creaObraDto.logoUrl;
        nuevaObra.obraFolderId =""
        nuevaObra.logoFolderId =""
        console.log({"nueva obra":nuevaObra})
        
        return await new this.obraModel(nuevaObra).save()
        
    }
    async buscaObraByObraId(
        entityFilterQuery: FilterQuery<ObraEntity>,
        projection?: Record<string, unknown>): Promise<any> {
        return this.obraModel.findOne( entityFilterQuery,{
            _id: 0,
            __v: 0,
            ...projection
        }).exec()
          
    }
    //retorna una obra del usuario logeado
    //en caso no tenga obras

    async buscaObraByusuarioId(
        entityFilterQuery: FilterQuery<any>,
        projection?: Record<string, unknown>): Promise<any> {
        return this.obraModel.findOne( entityFilterQuery,{
            _id: 0,
            __v: 0,
            ...projection
        }).exec()
          
    }


    async actualizaObra(
        entityFilterQuery: FilterQuery<ObraEntity>,
        updateEntityData: UpdateQuery<unknown>
        ): Promise<ObraEntity> {
        return this.obraModel.findOneAndUpdate(entityFilterQuery,
            updateEntityData,
            {
              new: true 
            })
    }
    async listaObras(entityFilterQuery: FilterQuery<ObraEntity>): Promise<any[]> {
        return this.obraModel.find(entityFilterQuery).exec()
    }

    async actualizaFolderId(
        entityFilterQuery: FilterQuery<ObraEntity>,
        entity: Partial<ObraEntity>
        ): Promise<ObraEntity> {

        const macho:any = await this.obraModel
        .findOneAndUpdate(
            {  "obraId":entityFilterQuery.obraId}, 
            {
                '$set': { 'obraFolderId': entityFilterQuery.obraFolderId },
                
            },
            {
                new : true
            }
            
        ).exec()

        return macho
    }
    async actualizaLogoFolderId(
        entityFilterQuery: FilterQuery<ObraEntity>,
        entity: Partial<ObraEntity>
        ): Promise<ObraEntity> {

        const macho:any = await this.obraModel
        .findOneAndUpdate(
            {  "obraId":entityFilterQuery.obraId}, 
            {
                '$set': {'logoFolderId':entityFilterQuery.logoFolderId}
            },
            {
                new : true
            }
            
        ).exec()

        return macho
    }
    
}