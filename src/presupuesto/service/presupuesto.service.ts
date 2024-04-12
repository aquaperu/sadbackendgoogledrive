import { Inject, Injectable } from '@nestjs/common';
import { ActualizaPresupuestoDto } from '../dto/crud.presupuestodto';
import { Presupuesto } from '../entity/presupuesto.entity';
import { IPRESUPUESTO_REPOSITORY, IPresupuestoRepository } from '../patronAdapter/presupuesto.interface';


@Injectable()
export class PresupuestoService {
    constructor(
        @Inject(IPRESUPUESTO_REPOSITORY) private ipresupuestoRepository:IPresupuestoRepository
    ){}
    async creaPresupuesto(presupuesto:Presupuesto): Promise<Presupuesto> {
        return await  this.ipresupuestoRepository.creaPresupuesto(presupuesto)
    }
    async buscaById(obraId:string ): Promise<Presupuesto> {
        return await this.ipresupuestoRepository.buscaById({obraId})//solo modificando el servicio , cambia el criterio de consulta
    }
    async actualizaPresupuesto(presupuestoId:string, actualizaPresupuestoDto:ActualizaPresupuestoDto): Promise<Presupuesto> {
        return await this.ipresupuestoRepository.actualizaPresupuesto({presupuestoId},actualizaPresupuestoDto)
    }
    async listaPresupuestos(){
        return await this.ipresupuestoRepository.listaPresupuestosByObraId({})
    }
}
