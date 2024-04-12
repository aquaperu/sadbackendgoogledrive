import { InjectModel } from "@nestjs/mongoose";
import { isString, IsString } from "class-validator"
import { FilterQuery, Model } from "mongoose";

import { ObraDocument } from "../schema/obra.schema";
export class CreaObraDto{
    @IsString()
    usuarioId:string;
    @IsString()
    logoUrl:string;
    @IsString()
    obraFolderId:string
    @IsString()
    logoFolderId:string
    
    
}
export class listaObrasPorUsuarioIdDto{
    @IsString()
    usuarioId:string;
 
}

export class EliminaObraDto{}

//ActualizaFolderId
export abstract class EntityRepository<T extends Document>{
    constructor(protected readonly entityModel: Model<T>) {}
    async findOneAndUpdate(
        entityFilterQuery: FilterQuery<T>,
        entity: Partial<T>,
      ): Promise<T> {
        return this.entityModel.findOneAndUpdate(entityFilterQuery, entity, {
          new: true,
        });
      }

}
export class ActualizaFolderId extends EntityRepository<ObraDocument> {
    /*constructor(
        @InjectModel(Obra.name)
        projectModel: Model<ObraDocument>,
      ) {
        super(projectModel);
      }*/

}
export class ActualizaFolderIdV1{
  
    usuarioId:string;
    obraId:string;
    logoUrl:string;
    obraFolderId:string


}

export class ActualizaLogoFolderId{
  obraId:string;
  logoFolderId:string;
}