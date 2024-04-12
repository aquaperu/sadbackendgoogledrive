import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, UpdateQuery } from 'mongoose';
import { Presupuesto } from '../entity/presupuesto.entity';
import { PresupuestoModel } from '../schema/presupuesto.schema';
import { IPresupuestoRepository } from './presupuesto.interface';
export class PresupuestoMongoRepository implements IPresupuestoRepository{
    constructor(
        @InjectModel(Presupuesto.name) private presupuestoModel:PresupuestoModel 
    ){}
    async creaPresupuesto( presupuesto: Presupuesto): Promise<any> {
        
       const nuevoPresupuesto = new Presupuesto();
       nuevoPresupuesto.obraId = presupuesto.obraId;
       nuevoPresupuesto.item = presupuesto.item;
       nuevoPresupuesto.partidas = presupuesto.partidas
       
       let otropresupuesto  = await this.presupuestoModel.find({obraId:presupuesto.obraId})
       
       if(otropresupuesto === null || otropresupuesto.length === 0){
        return this.presupuestoModel.create(nuevoPresupuesto)
       }else{
        return await this.presupuestoModel.
            findOneAndUpdate(
                {obraId:nuevoPresupuesto.obraId},
                {
                    $push:{
                    "partidas":presupuesto.partidas
                    }
                },
                {
                    new: true,overwrite:false
                }
            ).exec()

       }

       
  
    }
    async buscaById(entityFilterQuery: FilterQuery<Presupuesto>, projection?: Record<string, unknown>): Promise<any> {
        console.log(entityFilterQuery)
        return this.presupuestoModel.findOne( entityFilterQuery,{
            _id: 0,
            __v: 0,
            ...projection
        }).exec()
    }
    async actualizaPresupuesto(entityFilterQuery: FilterQuery<Presupuesto>, updateEntityData: UpdateQuery<unknown>): Promise<Presupuesto> {
        return this.presupuestoModel.findOneAndUpdate(entityFilterQuery,
            updateEntityData,
            
            
            {
              new: true 
            })
    }
    listaPresupuestosByObraId(entityFilterQuery: FilterQuery<Presupuesto>): Promise<any[]> {
        return this.presupuestoModel.find(entityFilterQuery).exec()
    }
    
}
    