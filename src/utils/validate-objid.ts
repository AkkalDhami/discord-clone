import { isValidObjectId } from "mongoose";

export function validateObjectId(id: string) {
  return isValidObjectId(id);
}
