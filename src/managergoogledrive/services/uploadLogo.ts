import { Inject, Injectable } from "@nestjs/common";
import { Readable } from "stream";

import { GoogleDriveService } from "./googleDriveService";
import { EFOLDERSIDS } from "../managergoogledrive.module";

@Injectable()
export class UploadLogoService extends GoogleDriveService  {//se recomienda hacer la inyeccion a una propiedad cada vez que se hacen herencias

    @Inject(EFOLDERSIDS.FOLDERLOGOSID) 
    private googleDriveLogoId: string
    
    public async uploadData(file: Express.Multer.File): Promise<string>{
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
                parents: [this.googleDriveLogoId],
              },
              media: media,
            });
      
            const fileId = driveResponse.data.id;
            //almacenar en la base de datos
            return `https://drive.google.com/uc?export=download&id=${fileId}`;
          } catch (e) {
            throw new Error(e);
          }

    }

}
