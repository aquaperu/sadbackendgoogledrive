import { FilterQuery, UpdateQuery } from "mongoose"
import { ActualizaValorizacionFolderIdDTO, AgregaevidenciafotograficaDto, CreateValorizacionDto } from "../dtos/crud.valorizacion.dto"

import { ValorizacionEntity } from "../entity/valorizacion.entity"

export const  IVALORIZACION_REPOSITORY = 'IValorizacionRepository'
export interface IValorizacionRepository{
    creaperiodovalorizacion(creaValorizacionDto:CreateValorizacionDto
    ):Promise<ValorizacionEntity>
    


    buscaById(
        entityFilterQuery: FilterQuery<ValorizacionEntity>,
        projection?: Record<string, unknown>
    ):Promise<any>

    buscaValorizacionByObraId(
        entityFilterQuery: FilterQuery<ValorizacionEntity>,
        projection?: Record<string, unknown>
    ):Promise<ValorizacionEntity | null>
    
    actualizaValorizacion(
        entityFilterQuery: FilterQuery<ValorizacionEntity>,
        updateEntityData: UpdateQuery<unknown>
    ):Promise<ValorizacionEntity>
    actualizaValorizacionFolderId(
        entityFilterQuery: FilterQuery<ActualizaValorizacionFolderIdDTO>,
        projection?: Record<string, unknown>):Promise<ActualizaValorizacionFolderIdDTO>
    
    listaValorizaciones(entityFilterQuery: FilterQuery<ValorizacionEntity>
    ):Promise<ValorizacionEntity[] | null>

    agregaevidenciafotografica(
        evidenciaFotograficaDto:AgregaevidenciafotograficaDto,
    ):Promise<AgregaevidenciafotograficaDto>
    //actualizaciones
    actualizaEvidenciaFotografica(evidenciaFotograficaDto:AgregaevidenciafotograficaDto):Promise<any>
  

    

    
//consultas
dadoUnMesSeleccionadoMostarSuPanelFotografico(obraId:string,mesSeleccionado:string):Promise<any>
buscaMesSeleccionadoFolderIdPorMesSeleccionado(obraId:string,mesSeleccionado:string):Promise<any>
listaFotosSegunObraMesSeleccionado(obraId:string,mesSeleccionado:string):Promise<any>



}