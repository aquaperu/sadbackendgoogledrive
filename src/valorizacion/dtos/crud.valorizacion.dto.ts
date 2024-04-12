import { Periodo } from "../entity/valorizacion.entity";


export class CreateValorizacionDto{
    
    obraId:string;
    periodos:Periodo[];
    valorizacionFolderId:string;
}
export class ActualizaValorizacionDto{
    periodos:Periodo[]
}

export class AgregaevidenciafotograficaDto{
    
    obraId:string;
   // @isUnique({tableName:"una tabla",column:"una columna"}) //funciona
	mesSeleccionado:string;
	partida:string;
	descripcionTrabajos:string;
	urlFoto:string;

}
export class EvidenciaFotograficaDTO  {
    partida:string;
    descripcionTrabajos:string;
    urlFoto:string;
}

export class ActualizaValorizacionFolderIdDTO{
    obraId:string;
    valorizacionFolderId:string

}



