export class EvidenciaFotografica{
    partida:string;
    descripcionTrabajos:string;
    urlFoto:string;
}
export class Periodo{
    mesSeleccionado:string; 
    panelFotografico:EvidenciaFotografica[];
    mesSeleccionadoFolderId:string

}

export class ValorizacionEntity{
    obraId:string;
    periodos:Periodo[];
    valorizacionFolderId:string;
    
}