import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ManagergoogledriveModule } from './managergoogledrive/managergoogledrive.module';

@Module({
  imports: [AuthModule, ManagergoogledriveModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
