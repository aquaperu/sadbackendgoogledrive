import { Injectable } from "@nestjs/common"
import { Padre } from "./padre"

@Injectable()
export class Hijo extends Padre {
    implementaEdad(){
        this.set(25)
    }
    muestraEdad(){
        console.log(this.get())
    }
}
