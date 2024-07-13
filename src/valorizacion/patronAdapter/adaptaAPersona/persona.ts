import { IPadreRepository } from "../adapter.ts";

export class SaludoDePersona implements IPadreRepository{
    private el_saludo:string
    
    configuraSaludo(saludo:string) {
        this.el_saludo = saludo
        
    }
    saluda() {
        console.log(this.el_saludo)
    }
    
}