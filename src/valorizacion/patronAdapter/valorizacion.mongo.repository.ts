import { InjectModel } from "@nestjs/mongoose";

import { ValorizacionEntity } from "../entity/valorizacion.entity";
import { IValorizacionRepository } from "./valorizacion.interface";


import { FilterQuery, UpdateQuery } from "mongoose";
import { ActualizaValorizacionFolderIdDTO, AgregaevidenciafotograficaDto, CreateValorizacionDto } from "../dtos/crud.valorizacion.dto";
import { ValorizacionModel } from "../schema/valorizacion.schema";
import { ConflictException } from "@nestjs/common";





export class ValorizacionMongoRepository implements IValorizacionRepository{
    constructor(
        @InjectModel(ValorizacionEntity.name) private valorizacionModel:ValorizacionModel 
    ){}
    
    async buscaValorizacionByObraId(entityFilterQuery: FilterQuery<ValorizacionEntity>, projection?: Record<string, unknown>): Promise<ValorizacionEntity | null> {
        
        return this.valorizacionModel.findOne( entityFilterQuery,{
            _id: 0,
            __v: 0,
            ...projection
        })
    }
    async creaperiodovalorizacion(creaValorizacionDto: CreateValorizacionDto): Promise<any> {
       console.log({"obraid":creaValorizacionDto.obraId})
       /*const nuevaValorizacion = new ValorizacionEntity();
       
       nuevaValorizacion.obraId = creaValorizacionDto.obraId.code

       nuevaValorizacion.periodos = creaValorizacionDto.periodos
       nuevaValorizacion.valorizacionFolderId =""*/
       creaValorizacionDto.valorizacionFolderId =""
       creaValorizacionDto.periodos[0].mesSeleccionadoFolderId = creaValorizacionDto.periodos[0].mesSeleccionadoFolderId
       
       let otraValorizacion  = await this.valorizacionModel.findOne({obraId:creaValorizacionDto.obraId})
       console.log({"resultado de buscar el obraid":otraValorizacion})
      
       if(otraValorizacion === null ){
        console.log("es una nueva valorizacion")
        await this.valorizacionModel.syncIndexes()//Hace que los índices en MongoDB coincidan con los índices definidos en el esquema de este modelo
        return this.valorizacionModel.create(creaValorizacionDto)
       }
       else{
        otraValorizacion.periodos.map((al,index)=>{
            if(al.mesSeleccionado === creaValorizacionDto.periodos[0].mesSeleccionado ){
                throw new ConflictException("PERIODO YA EXISTE")
            }
        })
        console.log("existe valorizacion")
        //valida el periodo seleccionado

        return await this.valorizacionModel.
            findOneAndUpdate(
                {obraId:creaValorizacionDto.obraId},//obra encontrada
                {
                    $push:{
                    "periodos":creaValorizacionDto.periodos[0]
                    }
                },
                {
                    new: true,overwrite:false
                },
                
            ).exec()

       }
    }
    async actualizaValorizacionFolderId(creaValorizacionDto: ActualizaValorizacionFolderIdDTO){
        
        const macho:any = await this.valorizacionModel
        .findOneAndUpdate(
            {"obraId":creaValorizacionDto.obraId},
            {
                
                $set:{
                    "valorizacionFolderId":creaValorizacionDto.valorizacionFolderId
                    
                }
            },
            {
                new : true
            }
        ).exec()
        
        return macho

    }
    async buscaById(entityFilterQuery: FilterQuery<ValorizacionEntity>, projection?: Record<string, unknown>): Promise<any> {
        return this.valorizacionModel.findOne( entityFilterQuery,{
            _id: 0,
            __v: 0,
            ...projection
        }).exec()
    }
    actualizaValorizacion(entityFilterQuery: FilterQuery<ValorizacionEntity>, updateEntityData: UpdateQuery<unknown>): Promise<ValorizacionEntity> {
        throw new Error("Method not implemented.");
    }
    listaValorizaciones(entityFilterQuery: FilterQuery<ValorizacionEntity>): Promise<any[]> {
        return this.valorizacionModel.find(entityFilterQuery).exec()
    }
    async agregaevidenciafotografica(
            evidenciaFotografica:AgregaevidenciafotograficaDto,
            
    ):Promise<AgregaevidenciafotograficaDto>{
        const nuevaEvidenciaFotografica = new AgregaevidenciafotograficaDto()
        nuevaEvidenciaFotografica.descripcionTrabajos =evidenciaFotografica.descripcionTrabajos;
        nuevaEvidenciaFotografica.partida=evidenciaFotografica.partida;
        nuevaEvidenciaFotografica.urlFoto=evidenciaFotografica.urlFoto;
        //console.log({"evidenciaFotografica en reposytori":evidenciaFotografica})
        
        /*
            { <query conditions> },
            { <update operator>: { "<array>.$[<identifier>]" : value } },
            { arrayFilters: [ { <identifier>: <condition> } ] }
        */
      
        const macho:any = await this.valorizacionModel
            .findOneAndUpdate(
                {"obraId":evidenciaFotografica.obraId},
                {
                    
                    $push:{
                        "periodos.$[periodo].panelFotografico":{
                            $each:[nuevaEvidenciaFotografica],
                           // $position:0

                        }
                        
                    }
                },
                {
                    arrayFilters:[{"periodo.mesSeleccionado":evidenciaFotografica.mesSeleccionado}]
                }
            )
            
            return macho
    }
    

    
    async listavalorizacionObraId(obraId:string):Promise<any>{
        return await this.valorizacionModel.findOne({"obraId":obraId}).exec()

    }

    

    async buscaMesSeleccionadoFolderIdPorMesSeleccionado(obraId:string,mesSeleccionado:string){
        return await this.valorizacionModel
        .findOne(
            {"obraId":obraId, 
                $and:[
                    {
                        periodos:{
                            $elemMatch:
                            {
                                "mesSeleccionado":mesSeleccionado
                            }
                        }
                    }
                ]
            },
            {
                periodos:{$elemMatch:{"mesSeleccionado":mesSeleccionado}}
            }
            
            
        )
    }
    //actualizaciones

    async actualizaEvidenciaFotografica(evidenciaFotografica:AgregaevidenciafotograficaDto): Promise<any> {
        const nuevaEvidenciaFotografica = new AgregaevidenciafotograficaDto()
        nuevaEvidenciaFotografica.descripcionTrabajos =evidenciaFotografica.descripcionTrabajos;
        nuevaEvidenciaFotografica.partida=evidenciaFotografica.partida;
        nuevaEvidenciaFotografica.urlFoto=evidenciaFotografica.urlFoto;
        console.log({"evidencia":evidenciaFotografica})
        return await this.valorizacionModel
            .findOneAndUpdate(
                {"obraId":evidenciaFotografica.obraId},
                {
                    
                    $set:{
                        "periodos.$[periodo].panelFotografico.$[panel].descripcionTrabajos":"actualizado con 01.02",
                        
                        
                    }
                },
                {
                    arrayFilters:[{"periodo.mesSeleccionado":"Diciembre"},{"panel.partida":"s"}]
                }
               
            )
    }
    async listaFotosSegunObraMesSeleccionado(obraId:string,mesSeleccionado:string){
        console.log(mesSeleccionado)
        return await this.valorizacionModel
        .find(
            {"obraId":obraId,$and :[{
                periodos:{
                    $elemMatch:
                    {
                        "mesSeleccionado":mesSeleccionado
                    }
                }
            }]
            },
            
            {
                periodos:{$elemMatch:{"mesSeleccionado":mesSeleccionado}},
                
            }
            
            
           
        )
    }

    //consultas
    async dadoUnMesSeleccionadoMostarSuPanelFotografico(obraId:string,mesSeleccionado:string){//no es necesario el usuarioId
        
        return await this.valorizacionModel.findOne({$and:[{"periodos.mesSeleccionado":mesSeleccionado,"obraId":obraId}]},
        {
            "periodos.$":1,
            "_id":0,
            }).exec()
    }
    
}
    