import { FilterQuery, UpdateQuery } from "mongoose"

import { Partida, Presupuesto } from "../entity/presupuesto.entity"

export const IPRESUPUESTO_REPOSITORY = "IPresupuestoRepository"

export interface IPresupuestoRepository{
    creaPresupuesto(presupuesto:Presupuesto):Promise<Presupuesto>
    buscaById(
        entityFilterQuery: FilterQuery<Presupuesto>,
        projection?: Record<string, unknown>
    ):Promise<Presupuesto>
    actualizaPresupuesto(
        entityFilterQuery: FilterQuery<Presupuesto>,
        updateEntityData: UpdateQuery<unknown>
    ):Promise<Presupuesto>
    listaPresupuestosByObraId(entityFilterQuery: FilterQuery<Presupuesto>):Promise<Presupuesto[] | null> 
}
