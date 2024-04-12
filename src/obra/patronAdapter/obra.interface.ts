import { FilterQuery, UpdateQuery } from "mongoose"
import { ActualizaFolderId, ActualizaFolderIdV1, ActualizaLogoFolderId, CreaObraDto, listaObrasPorUsuarioIdDto } from "../dtos/crud.obra"
import { ObraEntity } from "../entity/obra.entity"
//atencion con las proyeccciones elimino la parte sucia
export const  IOBRA_REPOSITORY = 'IObraRepository'
export interface IObraRepository{
    
    creaObra(creaObraDto:CreaObraDto):Promise<any>
    buscaObraByObraId(
        entityFilterQuery: FilterQuery<ObraEntity>,
        projection?: Record<string, unknown>
    ):Promise<any>
    
    buscaObraByusuarioId(
        entityFilterQuery: FilterQuery<ObraEntity>,
        projection?: Record<string, unknown>
    ):Promise<any>
    
    buscaObraByusuarioIdAndObraId(
        entityFilterQuery: FilterQuery<ObraEntity>,
        projection?: Record<string, unknown>
    ):Promise<ObraEntity>

    actualizaObra(
        entityFilterQuery: FilterQuery<ObraEntity>,
        updateEntityData: UpdateQuery<unknown>
    ):Promise<any>
    listaObras(entityFilterQuery: FilterQuery<ObraEntity>):Promise<any[] | null> 
        
    listaObrasPorUsuarioId(
        entityFilterQuery: FilterQuery<listaObrasPorUsuarioIdDto>,
        projection?: Record<string, unknown>):Promise<ObraEntity[] | null>

    actualizaFolderId(entityFilterQuery: FilterQuery<ActualizaFolderIdV1>,
        projection?: Record<string, unknown>):Promise<ActualizaFolderIdV1>
    
    actualizaLogoFolderId(entityFilterQuery: FilterQuery<ActualizaLogoFolderId>,
        projection?: Record<string, unknown>):Promise<ActualizaLogoFolderId>
    
}