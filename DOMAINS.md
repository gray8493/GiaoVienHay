# 🌐 Danh Sách Domain & Endpoint Hệ Thống GiaoVienHay

Bảng tổng hợp toàn bộ liên kết truy cập hệ thống (Backend, Frontend Admin Web, Mobile App và Dịch vụ liên kết).

---

## 🚀 1. Backend API (NestJS)

### 🌍 Production (Render Cloud)
- **Base URL**: `https://giaovienhay.onrender.com`
- **API Prefix (v1)**: `https://giaovienhay.onrender.com/api/v1`
- **Swagger UI (Tài liệu tương tác & Test API)**: [`https://giaovienhay.onrender.com/api/docs`](https://giaovienhay.onrender.com/api/docs)
- **Health Check Endpoint (Giữ server 24/24)**: [`https://giaovienhay.onrender.com/api/v1/health`](https://giaovienhay.onrender.com/api/v1/health)

### 💻 Localhost (Môi trường phát triển nội bộ)
- **Local Base URL**: `http://localhost:3000`
- **Local API Prefix (v1)**: `http://localhost:3000/api/v1`
- **Local Swagger UI**: [`http://localhost:3000/api/docs`](http://localhost:3000/api/docs)
- **Local Health Check**: `http://localhost:3000/api/v1/health`

---

## 💻 2. Frontend Admin Web (Next.js)

### 🌍 Production (Vercel / Cloud)
- **Dashboard URL**: *(Cập nhật sau khi triển khai lên Vercel)*

### 💻 Localhost
- **Local Admin Portal**: `http://localhost:3001` (hoặc `http://localhost:3000`)

---

## 📱 3. Mobile App (React Native / Expo)

- **Expo Dev Server**: `http://localhost:8081`
- **Metro Bundler**: `exp://localhost:8081`

---

## 🛠️ 4. Bảng điều khiển & Giám sát (Services & Monitoring)

- **Firebase Console (Database & Auth)**: [https://console.firebase.google.com/project/giaovienhay](https://console.firebase.google.com/project/giaovienhay)
- **Render Dashboard (Server Hosting)**: [https://dashboard.render.com](https://dashboard.render.com)
- **UptimeRobot (Ping 24/24 Free)**: [https://uptimerobot.com](https://uptimerobot.com)
  - URL cần ping: `https://giaovienhay.onrender.com/api/v1/health`

---

> *Tài liệu cập nhật và đồng bộ theo trạng thái mới nhất của hệ thống GiaoVienHay.*
