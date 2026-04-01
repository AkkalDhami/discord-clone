import mongoose, { Document, Model, Schema } from "mongoose";


export interface IServer extends Document {
  _id: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const serverSchema = new Schema<IServer>(
  {

  },
  {
    timestamps: true
  }
);


const Server: Model<IServer> =
  mongoose.models.Server || mongoose.model<IServer>("Server", serverSchema);

export default Server;