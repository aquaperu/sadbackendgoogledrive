import  * as path from 'path';
import * as fs from 'fs';
export const fixPathAssets = (recursoAssets:string)=>{
    console.log(`Starting directory: ${process.cwd()}`);
    //process.chdir()
   
   
    return `${path.join(process.cwd(),'/','dist/src/assets/',recursoAssets)}`
}
export const fixPathFromSRC = (nameFile:string)=>{
   console.log(`Starting directory: ${process.cwd()}`);
   //process.chdir()
  
  
   return `${path.join(process.cwd(),'/','dist/src/',nameFile)}`
}

export const fixPathEspecificacionesTecnicas = (recursoEspecificacionesTecnicas:string)=>{
    console.log(`Starting directory: ${process.cwd()}`);
    //process.chdir()
   
   
    return `${path.join(process.cwd(),'/','dist/src/especificacionesTecnicas/',recursoEspecificacionesTecnicas)}`
}
//var pathname = "/Content/img/imagen.jpg"; 
//var leafname = pathname.split('\\').pop().split('/').pop();
export const pathEspecificacionesTecnicas = ()=>{
    return `${path.join(process.cwd(),'/','dist/src/especificacionesTecnicas/')}`
}

/**
 * 
 * @param directoryPath Directorio en donde hará la busqueda de archivos
 * @returns retorna una matriz con todos los archivos encontrados
 */
export const scanDirs = (directoryPath) =>{
   var data=[];
    try{
       var ls:Array<any>=fs.readdirSync(directoryPath);
 
       for (let index = 0; index < ls.length; index++) {
          const file = path.join(directoryPath, ls[index]);
          var dataFile =null;
          try{
             dataFile =fs.lstatSync(file);
          }catch(e){}
 
          if(dataFile){
             data.push(
                {
                   path: file,
                   isDirectory: dataFile.isDirectory(),
                   length: dataFile.size
                });
 
             if(dataFile.isDirectory()){
                scanDirs(file)
             }
          }
       }
       return data
    }catch(e){
        console.error(e)
    }
 }
