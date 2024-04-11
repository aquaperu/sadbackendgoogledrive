import { Inject, Injectable } from '@nestjs/common';
import { google } from 'googleapis';

import { GoogleDriveConfig } from '../types/GoogleDriveConfig';
import { EFOLDERSIDS } from '../managergoogledrive.module';



@Injectable()
export class GoogleAutenticarService{
  public drive;
  public docs;
  public script;
  constructor(
    @Inject(EFOLDERSIDS.CONFIG) private config: GoogleDriveConfig,
    
  ) {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: this.config.client_email,
        private_key: this.config.private_key,
      },
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/documents.readonly',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.metadata.readonly'
       
      ],
    });
    this.drive = google.drive({ version: 'v3', auth });
    this.docs = google.docs({ version: 'v1', auth })
    
    
    
    
  }

}