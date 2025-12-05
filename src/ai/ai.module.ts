import { Module, Global } from '@nestjs/common';
import { AiService } from './ai.service';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai.controller';

@Global() 
@Module({
  imports: [ConfigModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService], 
})
export class AiModule {}
