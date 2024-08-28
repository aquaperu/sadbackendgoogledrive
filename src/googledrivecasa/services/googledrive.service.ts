import { Inject, Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { Buffer } from 'buffer';
import { Readable } from 'stream';
import * as fs from 'fs'
import * as path from 'path'
import { GoogleAutenticarService } from './googleautenticar.service';

@Injectable()
export class GoogleDriveService extends GoogleAutenticarService {

public async crearCarpeta(idForGoogleElement:string,nameForGoogleElement:string){
  const fileMetadata = {
    name: nameForGoogleElement,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [idForGoogleElement]
  };
  try {
    const file = await this.drive.files.create({
     resource: fileMetadata,
      fields: 'id',
    });
    console.log('Folder Id:', file.data.id);
    return file.data.id;
  }catch (err) {
  // TODO(developer) - Handle error
    throw err;
  }

  
    
  
  }
  public async crearCarpetav1(folderContenedorId:string,nameFolder:string){
    const fileMetadata = {
      name: nameFolder,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [folderContenedorId]
    };
    try {
      return this.drive.files.create({
       resource: fileMetadata,
        fields: 'id',
      });
      
    }catch (err) {
    // TODO(developer) - Handle error
      throw err;
    }
  
    
      
    
    }
  
  public async compartirCarpeta(idForGoogleElement:string){
    const service = this.drive;
  

  // Note: Client library does not currently support HTTP batch
  // requests. When possible, use batched requests when inserting
  // multiple permissions on the same item. For this sample,
  // permissions are inserted serially.

    try {
      const result = await service.permissions.create({
        resource:{
          type: 'anyone',
          role: 'writer',
         // emailAddress: targetUserEmail, // 'user@partner.com',uploadsad@sadsinfactura.iam.gserviceaccount.com.
          } ,
        fileId: idForGoogleElement,
        fields: 'id',
      });

      console.log(`Inserted permission id: ${result.data.id}`);
      
      return result.data.id
    } catch (err) {
      // TODO(developer): Handle failed permissions
      console.error(err);
    }
  

  }
  

  /**
   *
   * @param file your upload file like mp3, png, jpeg etc...
   * @return link link four your file on Google Drive
   */
  public async subirImagen(file: Express.Multer.File,idForGoogleElement:string): Promise<string> {
    console.log(idForGoogleElement)
    try {
      
      const { originalname, buffer } = file;

      const fileBuffer = Buffer.from(buffer);

      const media = {
        mimeType: file.mimetype,
        body: Readable.from([fileBuffer]),
      };

      const driveResponse = await this.drive.files.create({
        requestBody: {
          name: originalname,
          mimeType: file.mimetype,
          parents: [idForGoogleElement],
        },
        media: media,
        fields: "id,webContentLink"
      });

      const fileId = driveResponse.data.id;
      //this.compartirCarpeta(fileId)
      //almacenar en la base de datos
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    } catch (e) {
      throw new Error(e);
    }
  }

  /**
   *
   * @param fileId your file id which you want to get
   */
  public async obtenerwebViewLink(idForGoogleElement:string): Promise<string> {
    try {
      const link =  await this.drive.files.get({
        fileId:idForGoogleElement,
        fields:"webViewLink"
        //, webContentLink"
      })
      console.log({"myenlace":link.data.webViewLink})
      //buscar en la base de datos

      
      return `${link.data.webViewLink}`;
    } catch (e) {
      throw new Error(e);
    }
    
  
  
  }
  public async descargaTodosLosArchivosCarpeta(idForGoogleElement:string){//descarga tyodos los archivos de la carpeta
    
      var service = this.drive
    try {

      const result =  await service.files.list({
        q: "'" + idForGoogleElement + "' in parents and trashed=false",
        fields: "files(id, name, mimeType)"
      });
      result.data.files.forEach((file)=>{
        let dest = fs.createWriteStream(`d:\\sistemavalorizaciones\\${file.name}`)
        service.files.get(
          { fileId:file.id, alt: 'media' },
          { responseType: 'stream' }
        ).then(res=>{
          res.data.on('end',()=>{

            console.log('Done downloading file.');
          }).on('error', err => {
            console.error('Error downloading file.');
          }).on('data',d=>{
            console.log({"tama":d.length})
            d+='';
          console.log(d);
          //data will be here
          // pipe it to write stream
  
          }).pipe(dest);
  
        })
        

      })
      
    } catch (error) {
      console.error(error)
      
    }
    
  }
  public async getChildfilesIdIndFolder(idForGoogleElement:string){
    console.log("'1aT_8H66m-3yQWeCwfEKNvRHRB_6WAEWy' in parents")
    const service = this.drive;
    let filesId = [];
    
    try {
      const result =  await service.files.list({
        q: "'" + idForGoogleElement + "' in parents and trashed=false",
        fields: "files(id, name, mimeType)"
      });
      result.data.files.forEach((file)=>{
        filesId.push(file.id)

      })
      return filesId
      
    } catch (error) {
      console.error(error)
      
    }
    
    

  }
  //exporta solo docukmentos creados con google doc
  public async exportaAsPdf(idForGoogleElement:string){
    const service = this.drive;
    
  
    try {
      const result = await service.files.export(
        {
          fileId: idForGoogleElement,
          mimeType: 'application/pdf',
        },
        { responseType: 'stream' }
      );
  
      return result;
    } catch (err) {
      console.log('Failed to export PDF', err);
    }
  }

  public async GeneraIndiceEnPDF(nameFile:string,streamPDFKit:any,carpetaContenedora:string) {
    
    const folderId = carpetaContenedora;

        const fileMetadata = {
            name: `${nameFile}.pdf`,
            parents: [folderId],
        };

        const media = {
            mimeType: "application/pdf",
            body: streamPDFKit,
        };

        try {
          const asPdf= await this.drive.files.create(
            {
                resource: fileMetadata,
                media: media,
                fields: "id",
            },
            
        );
        
        return asPdf.data.id
          
        } catch (error) {
          console.error('Failed to export PDF', error);
        }

       




        
  }

  public descargaImagenArrayBuffer(file_id:string){
    var service = this.drive
    
        
             return service.files.get({fileId: file_id, alt: 'media'}, { responseType: "arraybuffer" })
     
          
  }

  public async GeneraIndiceEnPDFv1(nameFile:string,streamPDFKit:any,carpetaContenedora:string) {
    
    const folderId = carpetaContenedora;

        const fileMetadata = {
            name: `${nameFile}.pdf`,
            parents: [folderId],
        };

        const media = {
            mimeType: "application/pdf",
            body: streamPDFKit,
        };

        try {
           return this.drive.files.create(
            {
                resource: fileMetadata,
                media: media,
                fields: "id",
            },
            
        );
        
        //return asPdf.data.id
          
        } catch (error) {
          console.error('Failed to export PDF', error);
        }
  }
  
  
    
   
}
