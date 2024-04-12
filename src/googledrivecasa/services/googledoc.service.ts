import { Inject, Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { Buffer } from 'buffer';
import { Readable } from 'stream';
import { GoogleDriveConfig } from '../types/googledriveconfig';
import { EFOLDERSIDS } from '../googledrivecasa.module';
const stream = require("stream");
import { GoogleAutenticarService } from './googleautenticar.service';
import { concat } from 'rxjs';
const {GoogleAuth} = require('google-auth-library');
import createReport from 'docx-templates';
import * as fs from 'fs'

import { HttpService } from "@nestjs/axios";


@Injectable()
export class GoogleDocService extends GoogleAutenticarService { //es el cliente que en sus metodos llamará segun sea el caso a que carpeta se almacenará
  
  
    public async creaCopia(idForGoogleElement:string,nameForNewFile:string,destinoFolder:string){
        
        try {
            
            const response = await this.drive.files.copy({
                fileId:idForGoogleElement
            });
        
            if (response.status === 200) {
              const newFileId = response.data.id;
              if (nameForNewFile) {
                try {
                  await this.drive.files.update({
                    fileId: newFileId,
                    resource: {
                      name: nameForNewFile
                    },
                    addParents: destinoFolder,
                    
                  });
                } catch (err) {
                  console.error('Failed to rename the file', err);
                }
              }
              return newFileId;
            }
        
            return response;
          }
          catch (err) {
            console.error('Failed to copy doc', err);
          }

    }

    
    /**
     *  const finds = ['<DATE>', '<NUMBER>', '<EMPLOYER>', '<EMPLOYER ADDRESS>', '<AMOUNT PAYABLE>'];
        const replaces = ['2020-01-01', '1234', 'Employer Co Ltd', '1 Office Street', String(10,000)];
        await findAndReplaceTextInDoc(newFileId, finds, replaces);
     * @description
     * @param reemplazos 
     * @param busquedas 
     * @param idForGoogleElement 
     * @returns 
     */
    public async buscaReemplaza(reemplazos:Array<any>,busquedas:Array<any>,idForGoogleElement:string){
        let finds = Array.isArray(reemplazos) ? reemplazos : [reemplazos]; //asegura siempre que sean arrays
        let replaces = Array.isArray(busquedas) ? busquedas : [busquedas]; //asegura siempre que sean arrays
        try {
            
            const docs = this.docs
        
            let requests = [];
        
            for (let i = 0; i < finds.length; i++) {
              requests.push(
                {
                  replaceAllText: {
                    containsText: {
                      text: finds[i],
                      matchCase: true,
                    },
                    replaceText: replaces[i],
                  },
                }
              );
            }
        
            const res = await docs.documents.batchUpdate({
              documentId:idForGoogleElement,
              resource: {
                requests
              }
            });
        
            return res;
          } catch (err) {
            console.log(err);
          }
    }


    public async insertaImagenCabecera(webViewLink:string,idForGoogleElement:string){
      const docs = this.docs
     try {
      let requests = [{
        "createHeader" : {
          "sectionBreakLocation" : {
              "index" : 0,
          },
          "type" : "DEFAULT",
        }
       }
      ]
     
        
            const res = await docs.documents.batchUpdate({
              documentId:idForGoogleElement,
              requestBody:{requests}
            })
    
    
            //console.log(res.config.data.requests[0].createHeader.sectionBreakLocation)
            //console.log(res.data.replies)//[ { createHeader: { headerId: 'kix.px61a9y43w82' } } ]
    let requests1 = [{
      'insertInlineImage': {
        'location': {
          'segmentId' : res.data.replies[0].createHeader.headerId,
            'index': 0
        },
        'uri':
            webViewLink,
        'objectSize': {
            'height': {
                'magnitude': 50,
                'unit': 'PT'
            },
            'width': {
                'magnitude': 50,
                'unit': 'PT'
            }
        },
     },
      },
      
        {
          'updateParagraphStyle' : {
            'range' : {'startIndex' : 0, 'endIndex' : 1, 'segmentId' : res.data.replies[0].createHeader.headerId},
            'paragraphStyle' : {'alignment' : 'CENTER'},
            'fields' : 'alignment'
            }
         
    
        }
    
           
    ]
    
    
    
    await docs.documents.batchUpdate({
      documentId:idForGoogleElement,
      requestBody:{requests:requests1}
    })
    
            return res;
          } catch (err) {
            console.log(err);
          }
    }
    public async eliminaDocumentoCarpeta(googleFileId:string){
      const file = await this.drive.files.delete({
        fileId: googleFileId,
    },
    function (err, file) {
      if (err) {
        console.error(err);
        return;
      }
      console.log(file.data.id);
      return "eliminado correctamente"
    })
    
    }

    
    public async creaDocumento(content1:Uint8Array,nombreArhivoDocx:string,carpetaContenedoraId:string){
      
      var filename = nombreArhivoDocx;  // Please set the filename of created Google Document.
      var rootFolderId = carpetaContenedoraId;  // Please set the folder ID.
      var bufferStream = new stream.PassThrough();
          bufferStream.end(Uint8Array.from(content1));
      var fileMetadata = {
          name: filename,
          parents: [rootFolderId],
          mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"//"application/vnd.google-apps.document",
          };
      var media = {
          mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",//"text/plain",  // <--- Added
          body: bufferStream
          } ;
      const file = await this.drive.files.create({
          resource: fileMetadata,
          media
      })
      return file.data.id

    /*  this.drive.files.export(
        {
          fileId: idForGoogleElement,
          mimeType: "text/plain",
        },
        { responseType: "stream" },
        (err, { data }) => {
          if (err) {
            console.log(err);
            return;
          }
          let buf = [];
          data.on("data", (e) => buf.push(e));
          data.on("end", () => {
            const stream = require("stream");
      
            const content = "\n" + "Added text data";  // Here, the text data is added to the existing text in Document.
      
            buf.push(Buffer.from(content, "binary"));
            const bufferStream = new stream.PassThrough();
            bufferStream.end(Uint8Array.from(Buffer.concat(buf)));
            var media = {
              body: bufferStream,
            };
            this.drive.files.update(
              {
                fileId: idForGoogleElement,
                resource: {},
                media: media,
                fields: "id",
              },
              function (err, file) {
                if (err) {
                  console.error(err);
                  return;
                }
                console.log(file.data.id);
              }
            );
          });
        }
      );*/
      
    
   

  
  }

    
    
   
}