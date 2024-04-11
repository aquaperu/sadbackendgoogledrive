import { Injectable } from "@nestjs/common";
import { InjectModel, } from "@nestjs/mongoose";
import {  FilterQuery, UpdateQuery } from 'mongoose';
import { AuthDto } from "../dtos/auth.dto";
import { AuthEntity, AuthFindOne } from "../entity/auth.entity";
import { AuthModel} from "../schema/auth.schema";
import { IAuthRepository } from "./auth.interface.repository";


@Injectable()
export class AuthMongoRepository implements IAuthRepository{
    constructor(
        @InjectModel(AuthEntity.name) private authModel:AuthModel
    ){}
    async actualizaFolderId(entityFilterQuery: FilterQuery<AuthEntity>, entity: Partial<AuthEntity>,): Promise<AuthEntity> {

        const macho:any = await this.authModel
        .findOneAndUpdate(
            {  "usuarioId":entityFilterQuery.usuarioId}, 
            {
                '$set': { 'usuarioFolderId': entityFilterQuery.usuarioFolderId },
            },
            {
                new : true
            }
            
        ).exec()

        return macho
    }
    async actualizaLogoFolderId(entityFilterQuery: FilterQuery<AuthEntity>, entity: Partial<AuthEntity>,): Promise<AuthEntity> {
        console.log(entityFilterQuery)

        const macho:any = await this.authModel
        .findOneAndUpdate(
            {  "usuarioId":entityFilterQuery.usuarioId}, 
            {
                '$set': { 'logoFolderId': entityFilterQuery.logoFolderId },
            },
            {
                new : true
            }
            
        ).exec()

        return macho
    }
    
    lista(): Promise<any[]> {
        return this.authModel.find({}).exec()
    }
    findOne(entityFilterQuery: FilterQuery<AuthFindOne>, projection?: Record<string, unknown>): Promise<any> {
        return this.authModel.findOne( entityFilterQuery,{
            _id: 0,
            __v: 0,
            ...projection
        }).exec()
    }
    async register(registra: AuthDto): Promise<any> {
        const nuevoUsuario = new this.authModel()//crea o general el ObjectId ;_id
        nuevoUsuario.email = registra.email;
        nuevoUsuario.password = registra.password
        nuevoUsuario.usuarioId = nuevoUsuario._id.toHexString()
        nuevoUsuario.usuarioFolderId =""
        nuevoUsuario.logoFolderId =""
        return await new this.authModel(nuevoUsuario).save()
    }
    
    async login(
        entityFilterQuery: FilterQuery<AuthEntity>,
        projection?: Record<string, unknown>): Promise<any> {
        return this.authModel.findOne( entityFilterQuery,{
            _id: 0,
            __v: 0,
            ...projection
        }).exec()
          
    }
       
}