import { Global, Module } from '@nestjs/common';
import { ResponseService } from './services/response.service';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [ResponseService],
  exports: [ResponseService],
})
export class CommonModule {}
