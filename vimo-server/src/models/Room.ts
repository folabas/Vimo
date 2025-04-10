import mongoose, { Document, Schema } from 'mongoose';

export interface IMovie {
  id: string;
  title: string;
  source: string;
  thumbnail?: string;
  duration?: number | string;
}

export interface IMessage {
  userId: string;
  username: string;
  text: string;
  timestamp: Date;
}

export interface IRoom extends Document {
  roomCode: string;
  hostId: mongoose.Types.ObjectId;
  movie: IMovie;
  participants: mongoose.Types.ObjectId[];
  isPrivate: boolean;
  subtitlesEnabled: boolean;
  messages: IMessage[];
  currentTime: number;
  isPlaying: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const MovieSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String
  },
  duration: {
    type: Schema.Types.Mixed
  }
});

const RoomSchema = new Schema<IRoom>(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true
    },
    hostId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    movie: {
      type: MovieSchema,
      required: true
    },
    participants: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    isPrivate: {
      type: Boolean,
      default: false
    },
    subtitlesEnabled: {
      type: Boolean,
      default: false
    },
    messages: [MessageSchema],
    currentTime: {
      type: Number,
      default: 0
    },
    isPlaying: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IRoom>('Room', RoomSchema);
