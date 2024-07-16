import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DynamicModule } from '@nestjs/common';
import { ToolsDocsService } from './services/tools.docs.service';
import { ToolsDocsConfig } from './types/tools.docs.config';

@Module({
    imports: [HttpModule],
})
export class ToolsDocsModule {
    /**
   *
   * @param googleDriveConfig your config file/all config fields
   * @param googleDriveFolderId your Google Drive folder id
   */
  static register(
    docsConfig: ToolsDocsConfig,
  ): DynamicModule {
    return {
      module: ToolsDocsModule,
      global: true,
      providers: [
        ToolsDocsService,
        { provide: "CONFIG", useValue: docsConfig },
      ],
      exports: [
        ToolsDocsService,
        { provide: "CONFIG", useValue: docsConfig },
      ],
    };
  }

}
