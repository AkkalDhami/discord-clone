import { Types } from "mongoose";

export function validateObjectId(id: string) {
  return Types.ObjectId.isValid(id);
}
