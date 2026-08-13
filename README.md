# Portfolio của Trần Thị Phương Uyên

Trang portfolio tĩnh (HTML/CSS/JS thuần), toàn bộ nội dung được cấu hình qua `config.json`.
Danh sách project được **tự động load từ GitHub** của bạn (`phuyen145`) — không cần cập nhật tay.

## Cấu trúc file

```
portfolio-site/
├── index.html      # khung trang
├── style.css       # giao diện
├── script.js       # đọc config.json + gọi GitHub API
├── config.json     # TOÀN BỘ nội dung bạn cần sửa nằm ở đây
├── assets/
│   └── avatar.jpg  # ảnh đại diện (bạn tự thêm vào)
└── README.md
```

## 1. Sửa nội dung (không cần biết code)

Mở `config.json`, chỉnh các trường:

- `name`, `role`, `location`, `status`, `bio`, `tagline`, `stack`
- `links.github`, `links.linkedin`, `links.email`
- `skills`: mảng các kỹ năng, mỗi item có `name`, `category`, `level` (0–100, quyết định độ dài thanh bar)
- `maxProjects`: số project tối đa hiển thị (mặc định 6, lấy repo có nhiều sao nhất / mới cập nhật nhất)
- Nếu muốn **tự chọn tay** project thay vì lấy tự động từ GitHub, điền vào `manualProjects`, ví dụ:

```json
"manualProjects": [
  {
    "name": "Sales Dashboard",
    "description": "Power BI dashboard phân tích doanh thu theo khu vực.",
    "url": "https://github.com/phuyen145/sales-dashboard",
    "language": "Power BI",
    "stars": 0
  }
]
```

## 2. Thêm ảnh đại diện

Đặt ảnh của bạn vào `assets/avatar.jpg` (đúng tên file này, hoặc đổi đường dẫn trong `config.json` → `avatar`).
Nếu chưa có ảnh, trang sẽ tự hiển thị chữ viết tắt tên bạn (PU) thay thế — không lỗi.

## 3. Đưa lên GitHub Pages (miễn phí)

1. Tạo repository mới trên GitHub, đặt tên **chính xác**: `phuyen145.github.io`
   (phải trùng với username GitHub của bạn, đây là quy định bắt buộc của GitHub Pages)
2. Upload toàn bộ các file trong thư mục này vào repo đó (kéo-thả trên GitHub web, hoặc dùng Git):

```bash
git init
git add .
git commit -m "Initial portfolio"
git branch -M main
git remote add origin https://github.com/phuyen145/phuyen145.github.io.git
git push -u origin main
```

3. Vào repo → **Settings → Pages** → phần "Build and deployment" chọn **Source: Deploy from a branch**,
   branch `main`, folder `/root` → Save.
4. Đợi 1–2 phút, trang sẽ live tại: **https://phuyen145.github.io**

## 4. Cập nhật sau này

- Có project mới trên GitHub → tự động xuất hiện trên trang (không cần sửa gì, vì trang gọi GitHub API trực tiếp).
- Đổi bio, skills, link liên hệ → chỉ cần sửa `config.json` rồi commit + push lại.

## Ghi chú

- Trang gọi `https://api.github.com/users/phuyen145/repos` mỗi khi có người truy cập — GitHub API cho phép
  60 requests/giờ với khách chưa đăng nhập, đủ dùng cho portfolio cá nhân.
- Repo bị fork sẽ tự bị lọc bỏ khỏi danh sách project.
