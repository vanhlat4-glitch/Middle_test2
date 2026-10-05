import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "userId là bắt buộc"],
      ref: "user",
    },
    content: {
      type: String,
      required: [true, "content là bắt buộc"],
      trim: true,
    },
  },
  {
    timestamps: true, // Tự động tạo createdAt và updatedAt kiểu Date
  }
);

const Post = mongoose.model("post", postSchema);

export default Post;
