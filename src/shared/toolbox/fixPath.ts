import  * as path from 'path';
import * as fs from 'fs'
import { readdir } from 'fs/promises'

export const fixPathAssets = (recursoAssets:string)=>{
    //process.chdir('dist/src/assets')
    //console.log(process.chdir('dist/src'))
    //return `${path.join(process.cwd(),'/',recursoAssets)}`
    

          fs.readdir('./src/dist/assets', (err, files) => {
              files.forEach(file => {
                console.log({"los archivos":file});
              });
            });
}
