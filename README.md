# BÀI THI GIỮA KỲ: WEB FULLSTACK - MID TERM

Dự án xây dựng hệ thống REST API cho phép người dùng đăng ký, đăng nhập và đăng bài chia sẻ trên nền tảng.

---

## 1. Cấu trúc thư mục
```
Middle_Test/
├── models/
│   ├── user.model.js           # Định nghĩa User Schema (userName, email, password, apiKey)
│   └── post.model.js           # Định nghĩa Post Schema (userId, content, timestamps)
├── middlewares/
│   └── auth.middleware.js      # Middleware xác thực (hỗ trợ cả query apiKey & Bearer JWT token)
├── routes/
│   ├── user.routes.js          # API /users/register, /users/login
│   └── post.routes.js          # API /posts, /posts/:id (tạo và cập nhật bài post)
├── .env                        # Biến môi trường (PORT, URI_MONGO, JWT_SECRET)
├── index.js                    # File khởi chạy server và kết nối MongoDB
├── package.json
├── test_api.js                 # File script kiểm thử tự động toàn bộ 4 yêu cầu
└── Middle_Test.postman_collection.json  # File collection Postman để import test
```

---

## 2. Các yêu cầu trong đề bài & Kết quả cài đặt

### Yêu cầu 1 (2đ): API Đăng ký (`POST /users/register`)
- **Body gửi lên:**
  ```json
  {
    "userName": "vietanh",
    "email": "vietanh@gmail.com",
    "password": "Password123@"
  }
  ```
- **Xử lý:**
  - Kiểm tra `userName`, `email`, `password` bắt buộc.
  - Kiểm tra `email` duy nhất trong Database.
  - Mã hóa `password` bằng `bcrypt`.
- **Trả về:** HTTP Status `201 Created` kèm thông tin user (ẩn password).

---

### Yêu cầu 2 (2đ): API Đăng nhập (`POST /users/login`)
- **Body gửi lên:**
  ```json
  {
    "email": "vietanh@gmail.com",
    "password": "Password123@"
  }
  ```
- **Xử lý:**
  - Kiểm tra tồn tại email và so khớp mật khẩu mã hóa bằng `bcrypt.compare`.
  - Sinh chuỗi `apiKey` theo đúng định dạng đề bài yêu cầu:
    `mern-$userId$-$email$-$randomstring$`
    *(Ví dụ: `mern-$6ac3a9f8...$-$vietanh@gmail.com$-$9bb4d-3b7d-4ad...$`)*
  - Lưu `apiKey` vào Database (mỗi lần đăng nhập apiKey sẽ được làm mới).
  - **Tích hợp thêm JWT Token (Lesson 8):** Sinh thêm trường `token` dạng JWT với thời hạn 1 giờ.
- **Trả về:** HTTP Status `200 OK` kèm `apiKey`, `token` và thông tin user.

---

### Yêu cầu 3 (3đ): API Tạo bài post (`POST /posts?apiKey=...`)
- **URL kèm Query:** `http://localhost:3001/posts?apiKey=mern-...`
- **Hoặc dùng Header (Lesson 8):** `Authorization: Bearer <token>`
- **Body gửi lên:**
  ```json
  {
    "content": "Nội dung bài viết chia sẻ đầu tiên"
  }
  ```
- **Xử lý:**
  - Bắt buộc phải có `apiKey` hợp lệ hoặc `token`. Nếu không có hoặc sai -> trả về lỗi `401 Unauthorized`.
  - `userId` được tự động lấy từ người dùng đã đăng nhập.
  - `createdAt` và `updatedAt` tự động lưu thời gian tạo.
- **Trả về:** HTTP Status `201 Created` và thông tin bài post đã tạo.

---

### Yêu cầu 4 (3đ): API Cập nhật bài post (`PUT /posts/:id?apiKey=...`)
- **URL:** `http://localhost:3001/posts/<post_id>?apiKey=mern-...`
- **Body gửi lên:**
  ```json
  {
    "content": "Nội dung bài viết đã được chỉnh sửa"
  }
  ```
- **Xử lý:**
  - Bắt buộc xác thực `apiKey` hoặc `token`.
  - Kiểm tra bài post có tồn tại không. Nếu không có trả về `404 Not Found`.
  - Kiểm tra quyền sở hữu (chỉ người tạo mới được sửa bài của mình). Nếu không phải trả về `403 Forbidden`.
  - Cập nhật nội dung và `updatedAt`.
- **Trả về:** HTTP Status `200 OK` và dữ liệu bài viết sau khi cập nhật.

---

## 3. Cách chạy và kiểm thử

### Cách 1: Chạy Server
```bash
cd "Middle_Test"
npm run dev
```

### Cách 2: Chạy kiểm thử tự động 100% trong 2 giây:
```bash
node test_api.js
```
*(Script sẽ tự động đăng ký user mới -> đăng nhập lấy apiKey & token -> tạo bài post -> sửa bài post -> test chặn quyền truy cập).*

### Cách 3: Import vào Postman
Mở Postman -> Bấm **Import** -> Chọn file `Middle_Test.postman_collection.json`.
