import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";

import UserRouter from "./routes/user.routes.js";
import PostRouter from "./routes/post.routes.js";
import { authenticate } from "./middlewares/auth.middleware.js";

const app = express();

// Middleware phân tích dữ liệu JSON từ request body
app.use(express.json());

// Biến môi trường
const PORT = process.env.PORT || 3000;
const URI_MONGO =
  process.env.URI_MONGO ||
  "mongodb+srv://vleg8428_db_user:Vietanh123@cluster0.7evhhcd.mongodb.net/middle_test?appName=Cluster0";

// Kết nối đến MongoDB
try {
  await mongoose.connect(URI_MONGO);
  console.log(" Kết nối MongoDB thành công!");
} catch (error) {
  console.error(" Lỗi kết nối MongoDB:", error.message);
  process.exit(1);
}

// Route kiểm tra trạng thái server
app.get("/", (req, res) => {
  res.json({
    message: "Chào mừng đến với hệ thống bài kiểm tra giữa kỳ Middle_Test!",
  });
});

// Gắn các routers theo yêu cầu đề bài
app.use("/users", UserRouter); // /users/register, /users/login, /users/profile
app.use("/posts", PostRouter); // /posts, /posts/:id

// API lấy profile trực tiếp: GET /profile (giống hệt Lesson 8)
app.get("/profile", authenticate, (req, res) => {
  console.log("➡️ [GET /profile] Đang trả về thông tin profile của user:", req.user.userName);
  return res.status(200).json({
    message: "Lấy thông tin profile thành công!",
    user: {
      id: req.user._id,
      userName: req.user.userName,
      email: req.user.email,
      apiKey: req.user.apiKey,
      createdAt: req.user.createdAt,
    },
  });
});

// Khởi chạy server
app.listen(PORT, () => {
  console.log(` Server đang chạy trên cổng http://localhost:${PORT}`);
});
