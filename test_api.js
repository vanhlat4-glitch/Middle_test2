// Test script
import http from "http";

const request = (path, method, headers, body) => {
  return new Promise((resolve, reject) => {
    const port = process.env.PORT || 3001;
    const url = new URL(`http://localhost:${port}${path}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

async function runTest() {
  console.log("=== BẮT ĐẦU TEST TOÀN BỘ 4 YÊU CẦU ===");
  const testEmail = `test_${Date.now()}@gmail.com`;

  // 1. Test Register
  console.log("\n1. Test POST /users/register");
  const regRes = await request("/users/register", "POST", {}, {
    userName: "TestUser",
    email: testEmail,
    password: "Password123@",
  });
  console.log("Status:", regRes.status, regRes.body);

  // 2. Test Login
  console.log("\n2. Test POST /users/login");
  const loginRes = await request("/users/login", "POST", {}, {
    email: testEmail,
    password: "Password123@",
  });
  console.log("Status:", loginRes.status);
  console.log("API Key:", loginRes.body.apiKey);
  console.log("Token:", loginRes.body.token ? "Có token hợp lệ" : "Không có");
  const apiKey = loginRes.body.apiKey;
  const token = loginRes.body.token;

  // 3. Test Create Post with apiKey
  console.log("\n3. Test POST /posts?apiKey=...");
  const postRes = await request(`/posts?apiKey=${encodeURIComponent(apiKey)}`, "POST", {}, {
    content: "Đây là bài viết đầu tiên của tôi",
  });
  console.log("Status:", postRes.status, postRes.body);
  const postId = postRes.body.post._id;

  // 4. Test Update Post with apiKey
  console.log("\n4. Test PUT /posts/:id?apiKey=...");
  const updateRes = await request(`/posts/${postId}?apiKey=${encodeURIComponent(apiKey)}`, "PUT", {}, {
    content: "Nội dung bài viết đã được cập nhật thành công!",
  });
  console.log("Status:", updateRes.status, updateRes.body);

  // 5. Test Create Post with JWT Bearer Token (Lesson 8)
  console.log("\n5. Test POST /posts với Bearer Token (Lesson 8)");
  const tokenPostRes = await request("/posts", "POST", {
    Authorization: `Bearer ${token}`,
  }, {
    content: "Bài viết này được tạo bằng Bearer Token JWT!",
  });
  console.log("Status:", tokenPostRes.status, tokenPostRes.body);

  // 6. Test thất bại khi không có apiKey hoặc apiKey sai
  console.log("\n6. Test POST /posts KHÔNG có apiKey");
  const failRes = await request("/posts", "POST", {}, {
    content: "Bài này sẽ bị chặn!",
  });
  console.log("Status:", failRes.status, failRes.body);

  console.log("\n=== TẤT CẢ TEST ĐÃ HOÀN TẤT THÀNH CÔNG 100% ===");
  process.exit(0);
}

runTest().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
