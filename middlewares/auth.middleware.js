import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "VIETANH_SECRET_KEY";

/**
 * Middleware xác thực: Hỗ trợ cả 2 cách:
 * 1. Dùng query apiKey (theo chuẩn đề bài): ?apiKey=mern-$userId$-$email$-$randomstring$
 * 2. Dùng Bearer JWT Token ở Header (tích hợp theo Lesson 8)
 */
export const authenticate = async (req, res, next) => {
  try {
    const { apiKey } = req.query;
    const authHeader = req.headers.authorization;

    // --- CÁCH 1: Xác thực bằng apiKey (Yêu cầu đề bài) ---
    if (apiKey) {
      console.log("~ Nhận được apiKey:", apiKey);
      // Tìm người dùng có apiKey khớp với apiKey được lưu trong DB
      const user = await User.findOne({ apiKey });
      if (!user) {
        console.log(" apiKey không hợp lệ!");
        return res.status(401).json({
          message: "apiKey không thể xác thực hoặc không hợp lệ",
        });
      }
      console.log(" Xác thực thành công apiKey của user:", user.userName);
      req.user = user;
      return next();
    }

    // --- CÁCH 2: Xác thực bằng JWT Token (Tích hợp như Lesson 8) ---
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      console.log("~ bearerToken:", authHeader);
      console.log("~ token:", token);
      if (!token) {
        return res.status(401).json({ message: "Token không hợp lệ" });
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      console.log("~ verify token:", decoded);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({ message: "User không tồn tại" });
      }

      console.log(" Xác thực thành công JWT Token của user:", user.userName);
      req.user = user;
      return next();
    }

    // Nếu không truyền cả apiKey lẫn token
    return res.status(401).json({
      message: "Không có apiKey hoặc token xác thực. Yêu cầu đăng nhập!",
    });
  } catch (error) {
    return res.status(401).json({
      message: "Xác thực thất bại",
      error: error.message,
    });
  }
};
