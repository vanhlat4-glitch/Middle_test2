import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user.model.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "VIETANH_SECRET_KEY";

// ==========================================
// YÊU CẦU 1 (2đ): API ĐĂNG KÝ (POST /users/register)
// ==========================================
router.post("/register", async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!userName || !email || !password) {
      return res.status(400).json({
        message: "userName, email và password là bắt buộc!",
      });
    }

    // Kiểm tra email đã tồn tại chưa (email là duy nhất)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email đã tồn tại trên hệ thống!",
      });
    }

    // Mã hóa mật khẩu với bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Lưu user mới vào cơ sở dữ liệu
    const newUser = await User.create({
      userName,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Đăng ký tài khoản thành công!",
      user: {
        id: newUser._id,
        userName: newUser.userName,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi máy chủ khi đăng ký!",
      error: error.message,
    });
  }
});

// ==========================================
// YÊU CẦU 2 (2đ): API ĐĂNG NHẬP (POST /users/login)
// ==========================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!email || !password) {
      return res.status(400).json({
        message: "Email và password là bắt buộc!",
      });
    }

    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Email không tồn tại!",
      });
    }

    // So khớp mật khẩu đã mã hóa
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Mật khẩu không chính xác!",
      });
    }

    // Sinh randomstring cho apiKey (dùng chuỗi ngẫu nhiên chuẩn UUID)
    const randomstring = crypto.randomUUID();

    // Sinh apiKey theo đúng định dạng đề bài: mern-$userId$-$email$-$randomstring$
    const apiKey = `mern-$${user._id}-$${user.email}-$${randomstring}$`;

    // Cập nhật apiKey mới vào Database cho user (mỗi lần đăng nhập apiKey sẽ được thay đổi)
    user.apiKey = apiKey;
    await user.save();

    // Sinh thêm JWT Token (theo yêu cầu tích hợp Lesson 8)
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

    return res.status(200).json({
      message: "Đăng nhập thành công!",
      apiKey,
      token,
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi máy chủ khi đăng nhập!",
      error: error.message,
    });
  }
});

// ==========================================
// API LẤY THÔNG TIN USER (GET /users/profile)
// Xác thực qua ?apiKey=... hoặc Bearer Token (Lesson 8)
// ==========================================
router.get("/profile", authenticate, async (req, res) => {
  try {
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
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi máy chủ khi lấy profile!",
      error: error.message,
    });
  }
});

export default router;
