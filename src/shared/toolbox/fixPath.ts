import  * as path from 'path';

export const fixPathAssets = (recursoAssets:string)=>{
    process.chdir('dist/src/assets')
    console.log(process.cwd())
    //return `${path.join(process.cwd(),'/',recursoAssets)}`
}
