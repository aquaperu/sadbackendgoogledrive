import { FilterQuery, UpdateQuery } from "mongoose";
import { AuthDto } from "../dtos/auth.dto";


import { AuthEntity, AuthFindOne } from "../entity/auth.entity";

export const  IAUTH_REPOSITORY = 'IAuthRepository'
export interface IAuthRepository{
    register(creaUsuarioDto:AuthDto):Promise<any>
    login(
        entityFilterQuery: FilterQuery<AuthEntity>,
        projection?: Record<string, unknown>
    ):Promise<any>
    findOne(
        entityFilterQuery: FilterQuery<AuthFindOne>,
        projection?: Record<string, unknown>
    ):Promise<AuthEntity>
    lista():Promise<any[] | null>

    actualizaFolderId(
        entityFilterQuery:FilterQuery<AuthEntity>,
        entity: Partial<AuthEntity>
        ):Promise<AuthEntity>
    actualizaLogoFolderId(
        entityFilterQuery:FilterQuery<AuthEntity>,
        entity: Partial<AuthEntity>
        ):Promise<AuthEntity>
}