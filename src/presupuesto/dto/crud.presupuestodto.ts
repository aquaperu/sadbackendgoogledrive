import { Partida } from "../entity/presupuesto.entity";

export class CreaPresupuestoDto{
    item:string;
    obraId:string
    partidas:Partida[]
}
export class ActualizaPresupuestoDto{
    
    partidas:Partida[]

}