import express from "express";
import Post from "../models/post.model.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ==========================================
// YÊU CẦU 3 (3đ): API TẠO BÀI POST (POST /posts)
// Xác thực qua ?apiKey=... hoặc Authorization Bearer <token>
// ==========================================
router.post("/", authenticate, async (req, res) => {
  try {
    const { content } = req.body;

    // Kiểm tra content bắt buộc
    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "content là bắt buộc!",
      });
    }

    // userId được lấy trực tiếp từ người dùng đã xác thực
    const userId = req.user._id.toString();

    // Tạo bài post mới
    const newPost = await Post.create({
      userId,
      content: content.trim(),
    });

    return res.status(201).json({
      message: "Tạo bài post thành công!",
      post: newPost,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi máy chủ khi tạo bài post!",
      error: error.message,
    });
  }
});

// ==========================================
// YÊU CẦU 4 (3đ): API CẬP NHẬT BÀI POST (PUT /posts/:id)
// Xác thực qua ?apiKey=... hoặc Authorization Bearer <token>
// ==========================================
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    // Kiểm tra content bắt buộc
    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "content cập nhật là bắt buộc!",
      });
    }

    // 1. Kiểm tra bài post có tồn tại không
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        message: "Không tìm thấy bài post với ID đã cung cấp!",
      });
    }

    // 2. Kiểm tra quyền sở hữu (chỉ người tạo bài post mới có quyền cập nhật)
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Bạn không có quyền chỉnh sửa bài post của người khác!",
      });
    }

    // 3. Cập nhật bài post
    post.content = content.trim();
    await post.save();

    return res.status(200).json({
      message: "Cập nhật bài post thành công!",
      post,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi máy chủ khi cập nhật bài post!",
      error: error.message,
    });
  }
});

// API hỗ trợ thêm: Lấy danh sách bài post để tiện kiểm tra
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    return res.status(200).json({
      message: "Lấy danh sách bài post thành công!",
      total: posts.length,
      posts,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi máy chủ khi lấy danh sách bài post!",
      error: error.message,
    });
  }
});

export default router;
