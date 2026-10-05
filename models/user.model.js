import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "userName là bắt buộc"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "email là bắt buộc"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "password là bắt buộc"],
    },
    apiKey: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("user", userSchema);

export default User;
