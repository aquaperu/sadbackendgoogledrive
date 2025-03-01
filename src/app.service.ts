import { Injectable } from '@nestjs/common';
import { GoogleXlsxService } from './googledrivecasa/services/googlexlsx.service';
import { Observable, from } from 'rxjs';
import { GoogleDriveService } from './googledrivecasa/services/googledrive.service';
export interface GeneralObject{
  [key:string]:any
}
@Injectable()
export class AppService {
  constructor(
    private readonly googleXlsxService:GoogleXlsxService,
    private readonly googleDriveService:GoogleDriveService
  ){  }
  getHello(): string {
    return 'Hello World! bienvenido al deploy';
  }
  agregaHoja(){
    let hoja$:Observable<any> = from(this.googleXlsxService.createSheet("13EvM-Q8-lCkVKHaxf8a_oxr_Um7A4sFbFarIdomhJTM","my hoja")) 
    hoja$.subscribe(console.log)
    return "creado"
  }
  listaRegistros():Observable<any>{
    const characterAttributesMapping = {
      id: 'ID',
      name: 'Name',
      email: 'Email Address',
      contact: {
        _prefix: 'Contact ',
        street: 'Street',
        streetNumber: 'Street Number',
        zip: 'ZIP',
        city: 'City',
      },
      skills: {
        _prefix: 'Skill ',
        _listField: true,
      },
    };
    let registros$:Observable<any> = from(this.googleXlsxService.getActive("13EvM-Q8-lCkVKHaxf8a_oxr_Um7A4sFbFarIdomhJTM","Characters",characterAttributesMapping)) 
    //registros$.subscribe(console.log)
    return registros$
  }
  agregaRegistro(data:GeneralObject){
    this.googleXlsxService.setRow<GeneralObject>(data)
  }
  async getUrl(){//https://drive.google.com/file/d/1apcedvtB9l4vC4nYhxi5z1LWKqVHT1TG/view?usp=drive_link
    return await this.googleDriveService.obtenerwebViewLinkv1("1apcedvtB9l4vC4nYhxi5z1LWKqVHT1TG")
    
    
  }
}
