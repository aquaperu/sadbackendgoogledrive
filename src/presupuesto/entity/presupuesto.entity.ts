export class Partida{
    item:string;//numero que viene del archivo excel
    descripcion:string;
    u_medida:string;
    metrado:number;
    p_unitario:number;
    parcial:number

}
export class Presupuesto{
    obraId:string;
    item:string;
    partidas:Partida[]

}