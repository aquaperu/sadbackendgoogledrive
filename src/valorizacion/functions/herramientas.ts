import { HorizontalPositionAlign, HorizontalPositionRelativeFrom, ImageRun, Paragraph, StyleLevel, TableOfContents, TextRun, TextWrappingSide, TextWrappingType, VerticalPositionAlign, VerticalPositionRelativeFrom, convertMillimetersToTwip } from "docx"
import { fixPathAssets, fixPathEspecificacionesTecnicas, pathEspecificacionesTecnicas, scanDirs } from "src/shared/toolbox/fixPath"
import * as fs from 'fs'
import { OutlineOptions } from "docx/build/file/drawing/inline/graphic/graphic-data/pic/shape-properties/outline/outline"

let todosLosParrafos:any[] = []
export function prepareToParagraphsChildren (parrafos:Array<any>):Array<any> {
    //lista todos los archivos encontrados en la carpeta especificaciones tecnicas
    let rutascompletas = scanDirs(pathEspecificacionesTecnicas())
    rutascompletas = rutascompletas.map(ruta => ruta.path)
    rutascompletas = rutascompletas.map(ele => ele.split('\\').pop().split('/').pop())
    //los nombres de los archivos encontrados
    
    rutascompletas = rutascompletas.map(e=>fixPathEspecificacionesTecnicas(e))
    
    rutascompletas = rutascompletas.map(e=> require(e))
    
    let posiciones:any[] = [] 
    let elementosallenar:any[] = []

for(let x=0;x<parrafos.length;x++) {
    //identificar las posiciones de las partidas
    if(esTitulo(parrafos[x])){
      //combierte directmente a un parrafo y almacenalo en
      //todosLosParrafos,
      //en su misma posicion
      todosLosParrafos[x] = combierteTituloEnParrafo(parrafos[x])
    }else{
      //es una partida
      //inserta la especificacion tecnica completa de esa partida
      //busca la partida en el catalogo de partidas que tienen especificacion tecnica
      for(let i = 0;i<rutascompletas.length;i++){
       
        if(rutascompletas[i].find((ele:any) => ele.data[0].text === parrafos[x][1]) !== undefined){
            elementosallenar.push(rutascompletas[i])
            todosLosParrafos[x]=""
            posiciones.push(x)
        }
      }
    }
}
let uno = elementosallenar[0].length

rellenaArreglo(elementosallenar[0],posiciones[0])

for(let i=1;i<posiciones.length;i++){
  uno = posiciones[i] + uno
  rellenaArreglo(elementosallenar[i],uno)//1
}

let jo = todosLosParrafos
let llena:any[] = []



jo.map((texSimple)=>{
    if(extraeConfigDeJson(texSimple) !== undefined || extraeDataDeJson(texSimple) !== undefined){
        let options = extraeConfigDeJson(texSimple) 
        let children:any[] =  extraeDataDeJson(texSimple)
        
         children = children.map((el)=>{
        if(el.text === "imagen"){
          let img = fixPathAssets(el.img)
          let data = fs.readFileSync(img)
          let transformation = el.transformation;
          let outline = el.outline
          return new ImageRun({data,transformation,outline})
        } else{
          return new TextRun(el)
        }  
          
        })
        let parrafo = {children,...options}
        //llena.push(agregaParrafo(parrafo))
       // console.log(children)
        llena.push(parrafo)
    }
})

todosLosParrafos = []
    /*llena.unshift(new Paragraph({text:"",pageBreakBefore:true}))
    llena.unshift(new TableOfContents("Summary", {
        hyperlink: true,
        headingStyleRange: "1-5",
        stylesWithLevels: [new StyleLevel("MySpectacularStyle", 1)],
    }),)*/
    
    return llena
    
 }
   
export function combierteTituloEnParrafo(titulo:Array<any>) {
    let parrafo:string = ""
    //[1,"OBRAS PROVINCIONALES","",""],
    titulo.forEach((elemento)=>{
      parrafo = parrafo + elemento +" "
    })
    
    return {data:[{text:parrafo}] ,config:{heading:"Heading1"}}
  
    
}
  
  export function esTitulo (resumenMetrado:Array<any>) {
    //es titulo cuando el ultimo elemento del resumen de metrado es  ""
    if(resumenMetrado[3] === ""){
      return true
    }
    else{
      return false
    }
  }
  
  
export function rellenaArreglo (arrreglo_a_rellenar:Array<any>,posicion_inicio:number){
    const elementos_a_agregar = arrreglo_a_rellenar.length
    for(let i=0;i<elementos_a_agregar;i++){
        todosLosParrafos.splice(posicion_inicio + i,0,arrreglo_a_rellenar[i])
    }
  }
export function extraeConfigDeJson (unTextLineaJson:any)  {
    return unTextLineaJson.config
}
export function extraeDataDeJson (unTextLineaJson:any):any[]  {
    return unTextLineaJson.data
}