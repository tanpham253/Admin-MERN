// users.model.ts
import { Schema, model, Document } from "mongoose";
import { applyPasswordHashing } from "../configs/hashPassword";

export type IUsers = {
  first_name: string;
  last_name: string;
  roles: string[];
  password: string;
  email: string;
  is_active?: boolean;
}

const usersSchema = new Schema(
  {
    // 1 user can have more than 1 role
    roles: {
      type: [String],
      default: ["staff"],
      enum: ["staff", "admin"],
    },

    password: {
      type: String,
      minLength: 6,
      maxLength: 255,
      require: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      maxlength: 160,
      lowercase: true,
    },
    first_name: { type: String, required: false },
    last_name: { type: String, required: false },
    is_active: { type: Boolean, required: false },
  },
  {
    timestamps: false,
    virtuals: {
      fullName:{
        get() {
          return `${this.first_name} ${this.last_name}`;
        }
      }
    },
    toJSON: {
      virtuals: true,
      transform: (doc,ret) => {
        delete (ret as { password?: string }).password; // do not return password
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: (doc,ret) => {
        delete (ret as { password?: string }).password; // do not return password
        return ret;
      }
    }
  }
);

applyPasswordHashing(usersSchema);

const User = model("User", usersSchema);
export default User;
