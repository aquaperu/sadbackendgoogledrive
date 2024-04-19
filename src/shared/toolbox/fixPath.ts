import  * as path from 'path';
import * as fs from 'fs'
import { readdir } from 'fs/promises'

export const fixPathAssets = (recursoAssets:string)=>{
    //process.chdir('dist/src/assets')
    //console.log(process.chdir('dist/src'))
    //return `${path.join(process.cwd(),'/',recursoAssets)}`
    process.chdir('src/assets')
    console.log("Current working directory: ", process.cwd());

          fs.readdir('./src/assets', (err, files) => {
              files.forEach(file => {
                console.log(file);
              });
            });
}
