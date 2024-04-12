import { fixPathAssets } from './toolbox/fixPath';
export const jwtConstants = {
    secret:'mysemilla'
}
enum nombreHojasPlantillaValorizacion{
    CONFIGURACION ="configuracion",
    PRESUPUESTOCONTRACTUAL='presupuesto_contractual',
    PLANIFICAOBRA='planifica_obra',
    CALENDARIOVALORIZADOAVANCEOBRA='calend_valo_avanceobra',
    RESUMENINGRESOSALIDAALMACEN ='resumen_ingreso_salida_almacen',
    INDICEVALORIZACION='indice_valorizacion',
    
}
enum nombreHojasPlantillaCalculos{
    VALORIZACIONCALCULOS='valorizacion_calculos',
    CUADRORESUMENPAGO='cuadro_resumen_pago',
    FICHAIDENTIFICACION='ficha_identificacion',
    CURVAS='curva_s'

}
const templatesFilesNames =
    {
        valorizacion:{
            nombreArchivo:"plantilla_valorizacion.xlsx",
            hoja:nombreHojasPlantillaValorizacion
        },
        calculos:{
            nombreArchivo:"plantilla_valorizacion_calculos.xlsx",
            hoja:nombreHojasPlantillaCalculos

        }
    }
export const templateValorizacionURL = ()=>{
    const recurso = fixPathAssets(templatesFilesNames.valorizacion.nombreArchivo)
    
    return {recurso,hojas:templatesFilesNames.valorizacion.hoja}

}
export const templateCalculosURL = ()=>{
    const recurso = fixPathAssets(templatesFilesNames.calculos.nombreArchivo)
    return {recurso,hojas:templatesFilesNames.calculos.hoja}
}
 