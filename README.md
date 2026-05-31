# Personal Productivity & Weight Loss Assistant (tamquan) 🚀

Hệ thống **Trợ lý số Cá nhân hóa** kết hợp Web Dashboard giúp quản lý hiệu suất làm việc, học tập và thiết lập kỷ luật giảm cân.

## 🌟 Tính Năng Nổi Bật

- **Dashboard Trực Quan**: Giao diện cực mượt, thiết kế "Kính mờ" (Glassmorphism), có chế độ ban đêm chuyên nghiệp.
- **Quản Lý Lịch Trình (Schedules & Deadlines)**: Đồng bộ lịch học FPTU, lịch làm việc và lịch tập luyện thể thao (Pickleball, Gym, Chạy bộ). Tự động theo dõi các deadlines học tập.
- **Huấn Luyện Viên AI "Xéo Xắt" (Groq AI)**: Tích hợp Groq AI Llama 3 tốc độ cực cao làm huấn luyện viên đời sống riêng. Chuyên môn: thiết kế lịch tập linh hoạt, nhắc nhở kỷ luật và châm biếm xéo xắt tạo động lực.
- **Trợ Lý Dinh Dưỡng**: Tự động tính toán quỹ Calo, nhắc uống nước hàng ngày và đề xuất thực đơn siêu tiết kiệm, dễ chế biến (Ức gà, khoai lang, chuối tiêu, ổi giòn...).
- **Đồng Bộ Dữ Liệu Thời Gian Thực**: Sử dụng Supabase PostgreSQL làm hệ quản trị cơ sở dữ liệu. Mọi tương tác trên AI đều được lưu tự động lên hệ thống.

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: Next.js (App Router), React, TypeScript.
- **Styling**: Tailwind CSS, Shadcn UI, Recharts, Lucide Icons.
- **Backend/Database**: Supabase (PostgreSQL), Next.js API Routes (Serverless).
- **Trí Tuệ Nhân Tạo**: Groq SDK (Model: Llama-3.3-70b-versatile).

## 🚀 Khởi Chạy Dự Án

1. Cài đặt các thư viện:
   ```bash
   cd frontend
   npm install
   ```

2. Cấu hình biến môi trường (`.env.local`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   GROQ_API_KEY=your_groq_api_key
   ```

3. Chạy môi trường dev:
   ```bash
   npm run dev
   ```

Truy cập `http://localhost:3000` để xem ứng dụng.

---
*Created by tamquan AI Agent (DeepMind AntiGravity Engine)*
