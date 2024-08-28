import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DynamicModule } from '@nestjs/common';
import { DocsService } from './services/docs.service';
import { DocsConfig } from './types/docs.config';

@Module({
    imports: [HttpModule],
})
export class DocsModule {
    /**
   *
   * @param docsConfig your config file/all config fields
   * @param googleDriveFolderId your Google Drive folder id
   */
  static register(
    docsConfig: DocsConfig,
  ): DynamicModule {
    return {
      module: DocsModule,
      global: true,
      providers: [
        DocsService,
        { provide: "CONFIG", useValue: docsConfig },
      ],
      exports: [
        DocsService,
        { provide: "CONFIG", useValue: docsConfig },
      ],
    };
  }

}
