import  * as path from 'path';
import * as fs from 'fs';
export const fixPathAssets = (recursoAssets:string)=>{
    console.log(`Starting directory: ${process.cwd()}`);
    //process.chdir()
   
   
    return `${path.join(process.cwd(),'/','dist/src/assets/',recursoAssets)}`
}

export const fixPathEspecificacionesTecnicas = (recursoEspecificacionesTecnicas:string)=>{
    console.log(`Starting directory: ${process.cwd()}`);
    //process.chdir()
   
   
    return `${path.join(process.cwd(),'/','dist/src/especificacionesTecnicas/',recursoEspecificacionesTecnicas)}`
}
