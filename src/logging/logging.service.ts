import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { Logging, LoggingDocument } from './logging.schema';

@Injectable()
export class LoggingsService {
  constructor(
    @InjectModel(Logging.name) private loggingModel: Model<LoggingDocument>,
  ) {}

  async create(
    requestType: string,
    status: string,
    userId:string,
    session?: ClientSession,
  ) {
    const doc = new this.loggingModel({
      requestType,
      status,
      userId
    });

    
    return session ? doc.save({ session }) : doc.save();
  }

  async findAll() {
    try {
      return await this.loggingModel.find();
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to fetch loggings');
    }
  }

}
