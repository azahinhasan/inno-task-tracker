import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Logging, LoggingSchema } from './logging.schema';
import { LoggingsService } from './logging.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Logging.name, schema: LoggingSchema }]),
  ],
  providers: [LoggingsService],
  exports: [LoggingsService],
})
export class LoggingModule {}
