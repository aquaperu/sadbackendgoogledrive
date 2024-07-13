import { Injectable } from "@nestjs/common"

@Injectable()
export class Padre {
    edad:number
    get (){
        return this.edad

    }
    set (edad:number) {
        this.edad = edad
    }
}