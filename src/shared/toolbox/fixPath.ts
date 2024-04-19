import  * as path from 'path';
import * as fs from 'fs'
import { readdir } from 'fs/promises'

export const fixPathAssets = (recursoAssets:string)=>{
    //process.chdir('dist/src/assets')
    //console.log(process.chdir('dist/src'))
    //return `${path.join(process.cwd(),'/',recursoAssets)}`
    const getDirectories = async source =>
        (await readdir(source, { withFileTypes: true }))
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name)
          fs.readdir('./', (err, files) => {
              files.forEach(file => {
                console.log(file);
              });
            });
}
