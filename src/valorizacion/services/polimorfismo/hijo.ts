import { Injectable } from "@nestjs/common"
import { Padre } from "./padre"

@Injectable()
export class Hijo extends Padre {
    implementaEdad(edad:number){
        this.edad = edad
    }
    muestraEdad(){
        return this.edad
    }
}
