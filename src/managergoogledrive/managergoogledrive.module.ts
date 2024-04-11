import { HttpModule } from '@nestjs/axios';
import { Module,DynamicModule } from '@nestjs/common';

import { GoogleDocService } from './services/googleDocService';
import { GoogleDriveService } from './services/googleDriveService';

import { GoogleDriveConfig } from './types/GoogleDriveConfig';
import { GoogleAutenticarService } from './services/googleAutenticarService';

export const enum EFOLDERSIDS {
  CONFIG = "CONFIG",
  FOLDERBASEID = "FOLDERBASEID",
  FOLDERLOGOSID = "FOLDERLOGOSID", 
  FOLDERARCHIVOSID = "FOLDERARCHIVOSID"

}
@Module({
    imports: [HttpModule],
})
export class GoogleDriveModule {
    /**
   *
   * @param googleDriveConfig your config file/all config fields
   * @param googleDriveFolderId your Google Drive folder id
   */
  static register(
    googleDriveConfig: GoogleDriveConfig,
  

    googleDriveBaseFolderId: string,//carpeta base en donde se lojara todos los archivos de los usuarios
    //googleDriveLogosFolderId: string,//carpeta donde se alojará el logo del usuario
    //googleDriveArchivosFolderId: string,//carpeta donde se alojara toda la gestion documentaria del usuario
  ): DynamicModule {
    return {
      module: GoogleDriveModule,
      global: true,
      providers: [
        GoogleAutenticarService,
        GoogleDriveService,
        GoogleDocService,
        { provide: EFOLDERSIDS.CONFIG, useValue: googleDriveConfig },
       
        { provide: EFOLDERSIDS.FOLDERBASEID, useValue: googleDriveBaseFolderId },
        
      ],
      exports: [
        GoogleAutenticarService,
        GoogleDriveService,
        GoogleDocService,
        { provide: EFOLDERSIDS.CONFIG, useValue: googleDriveConfig },
     
        { provide: EFOLDERSIDS.FOLDERBASEID, useValue: googleDriveBaseFolderId },
      
      ],
    };
  }
}
