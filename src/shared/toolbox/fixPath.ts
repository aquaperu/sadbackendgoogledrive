import  * as path from 'path';
export const fixPathAssets = (recursoAssets:string)=>{
    process.chdir('dist/src/assets')
    return `${path.join(process.cwd(),'/',recursoAssets)}`
}
