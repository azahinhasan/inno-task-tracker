import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../auth/schemas/user.schema';

export type LoggingDocument = Logging & Document;

@Schema({ timestamps: true })
export class Logging {
  @Prop({ required: true })
  requestType: string;

  @Prop({ required: true })
  status: string;

  @Prop({ type: Types.ObjectId, ref: User.name })
  userId: Types.ObjectId;
}


export const LoggingSchema = SchemaFactory.createForClass(Logging);
