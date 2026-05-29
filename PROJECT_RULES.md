# 📝 BÁO CÁO TOÀN BỘ DỰ ÁN: TRỢ LÝ SỐ CÁ NHÂN HÓA (TELE-PERSONAL ASSISTANT)

## 1. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)
- **Tên dự án**: Trợ lý số Cá nhân hóa - Quản lý hiệu suất và Giảm cân (Personal Productivity & Weight Loss Assistant).
- **Mục tiêu cốt lõi**: Thiết kế một hệ thống tối ưu hóa hiệu suất học tập/làm việc, đồng thời thiết lập kỷ luật dinh dưỡng, tập luyện giúp người dùng giảm mỡ lành mạnh (từ mốc cân nặng 92kg).
- **Nền tảng triển khai**: Giao diện Web tổng (Dashboard) kết hợp tương tác chính qua Telegram Bot.
- **Tiêu chí kỹ thuật**: Tối ưu hóa chi phí vận hành (Cost Optimization), ưu tiên sử dụng hạ tầng Serverless 0 đồng (Vercel, Supabase, Gemini Flash API).

## 2. PHÂN TÍCH YÊU CẦU NGHIỆP VỤ (BUSINESS REQUIREMENTS)

### 2.1. Module Quản lý Lịch trình & Deadline (Schedule & Task Management)
- **Lịch cố định (Học & Làm)**: Hệ thống ghi nhận lịch cố định từ Tháng 5 - Tháng 7/2026. Lịch này có độ ưu tiên cao nhất, các lịch sinh hoạt khác phải tự động né khung giờ này.
- **Cơ chế xử lý Deadline**:
  - **Cảnh báo sớm**: Gửi thông báo qua Telegram trước 24 tiếng kèm 2 nút tương tác nhanh: `[Done]` / `[Chưa Done]`.
  - **Báo động khẩn cấp (Critical Alert)**: Nếu trạng thái là `[Chưa Done]`, trước deadline 1 tiếng, hệ thống sẽ kích hoạt "Cảnh báo động", tự động tag người dùng hoặc spam tin nhắn nhắc nhở liên tục sau mỗi 15 phút cho đến khi bấm `[Done]`.

### 2.2. Module Dinh dưỡng & Mua sắm (AI Nutrition & Meal Prep)
- **Tính toán Thâm hụt Calo (Caloric Deficit)**: Dựa trên thể trạng 92kg, AI tự động tính toán lượng đạm cần thiết (~110g - 138g protein/ngày, tương đương 250g - 350g ức gà).
- **Gợi ý món ăn theo Ngân sách (Smart Budgeting)**: Trước mỗi tuần, hệ thống sẽ hỏi ngân sách khả dụng. AI ưu tiên gợi ý thực đơn trong tầm giá, cho phép vượt rào tối đa 10% nếu thực phẩm đó tối ưu cho việc giảm mỡ.
- **Quản lý Mua sắm & Bảo quản**: Gom toàn bộ nguyên liệu thành danh sách mua sắm (Shopping List) cho cả tuần và đính kèm hướng dẫn chi tiết cách bảo quản thực phẩm một tuần trong tủ lạnh.
- **Quỹ Calo dự phòng (Cheat Meal Buffer)**: Tự động trừ hao 10-15% tổng calo tuần để bù đắp cho các bữa trưa ăn quán với bạn bè hoặc các bữa tiệc đột xuất.
- **Nhập liệu tối ưu chi phí**: Loại bỏ tính năng quét ảnh món ăn (để né chi phí AI Vision lớn và lỗi timeout trên Vercel). Thay thế hoàn toàn bằng nhập liệu bằng text nhanh hoặc bấm nút `[Ăn quán/Đi tiệc]`, hệ thống tự mặc định trừ calo.

### 2.3. Module Tập luyện Linh hoạt (Dynamic Fitness Scheduling)
- **Khóa lịch cố định**: Thứ 3 và Thứ 5 từ 17h - 19h (Lịch chơi Pickleball cố định).
- **Gợi ý bài tập linh hoạt (AI Recommendation)**:
  - Thứ 2, 4, 6: AI gợi ý bài tập Cardio nhẹ nhàng, đi bộ hoặc tập kháng lực từ 30 phút - 1 tiếng (tránh áp lực lên khớp gối ở mức cân 92kg).
  - Cuối tuần (Thứ 7, CN): Gợi ý các bài tập dài hơn (> 1 tiếng).
- **Logic dời lịch**: Nếu người dùng báo bận không tập được, AI sẽ tự động dời bài tập đó sang ngày hôm sau và tăng nhẹ độ khó (tập bù).

### 2.4. Module Theo dõi Uống nước & Động viên (Hydration & Gamification)
- **Mục tiêu**: Nạp đủ ~3.5 lít nước/ngày.
- **Cơ chế "10 phút kiểm tra"**: Bot gửi nhắc nhở kèm nút bấm `[Đã uống 500ml]`. Nếu quá 10 phút người dùng không tương tác, hệ thống ghi nhận là đã quên (Missed) và tự động tính toán tái phân bổ lượng nước còn lại vào các khung giờ sau.
- **Persona (Tính cách của Bot)**: Nghiêm khắc, hài hước, sử dụng ngôn từ thực tế, "khét tiếng" để trị chứng nhanh chán của người dùng.

### 2.5. Tính năng Đọc ngôn ngữ tự nhiên (NLP Calendar Input)
- Người dùng có thể chat trực tiếp với Bot bằng ngôn ngữ tự nhiên để thêm lịch nhanh (Ví dụ: "Hôm nay 29/5 có lịch đi họp" hoặc "Thứ 7 tuần sau có lịch đi sinh nhật Đạt"). AI sẽ tự bóc tách text, quy đổi ra ngày dương lịch chính xác và tự động điền vào cơ sở dữ liệu.

## 3. KIẾN TRÚC HỆ THỐNG & ĐỀ XUẤT CÔNG NGHỆ (TECH STACK)
Để tối ưu chi phí 0 đồng và loại bỏ hoàn toàn việc duy trì một Backend truyền thống chạy ngầm gây tốn kém (như trên Render), hệ thống sẽ sử dụng kiến trúc Serverless & Backend-as-a-Service (BaaS):

- **Frontend & API Routes (Serverless Backend)**: Next.js deploy trên Vercel. Các API xử lý Webhook từ Telegram sẽ được viết trực tiếp trong Next.js API Routes.
- **Database & Security**: Supabase (PostgreSQL). Thao tác dữ liệu trực tiếp từ Frontend bằng Supabase Client SDK, bảo mật tuyệt đối thông qua cấu hình Row Level Security (RLS) trên từng bảng.
- **AI Engine (Xử lý NLP & Thực đơn)**: Gemini 1.5 Flash API (Tốc độ phản hồi cực nhanh, chi phí token siêu rẻ, có hạn mức free lớn).
- **Hệ thống Hẹn giờ (Automation & Cron Jobs)**: Dùng Supabase Edge Functions kết hợp với một dịch vụ kích hoạt định kỳ bên ngoài (Upstash Cron hoặc Cron-job.org) để quét database gửi tin nhắn nhắc nhở uống nước/deadline theo thời gian thực.

## 4. THIẾT KẾ CƠ SỞ DỮ LIỆU SƠ KHỞI (DATABASE SCHEMA)
Dưới đây là cấu trúc các bảng (Tables) cần thiết trên Supabase:

### 4.1. Bảng `profiles` (Thông tin người dùng)
- `id`: uuid (Primary Key, liên kết với Supabase Auth)
- `current_weight`: numeric (Mặc định: 92)
- `target_weight`: numeric
- `daily_water_goal`: numeric (Mặc định: 3500ml)
- `weekly_budget`: numeric

### 4.2. Bảng `schedules` (Lịch học, làm việc, sự kiện sinh nhật, đi họp...)
- `id`: bigint (Primary Key, Auto Increment)
- `user_id`: uuid (Foreign Key)
- `title`: text (Ví dụ: "Học FPTU", "Đi sinh nhật Đạt")
- `type`: text (Các giá trị: 'academic', 'work', 'social', 'fitness')
- `start_time`: timestamp with time zone
- `end_time`: timestamp with time zone
- `is_fixed`: boolean (Mặc định true cho lịch học/làm để AI không tự ý dời)

### 4.3. Bảng `deadlines` (Quản lý deadline môn học)
- `id`: bigint (Primary Key)
- `user_id`: uuid (Foreign Key)
- `title`: text
- `due_date`: timestamp with time zone
- `status`: text (Các giá trị: 'pending', 'done')
- `last_alert_sent`: timestamp with time zone (Để theo dõi lịch sử spam tin nhắn 15 phút/lần)

### 4.4. Bảng `water_tracking` (Theo dõi uống nước)
- `id`: bigint (Primary Key)
- `user_id`: uuid (Foreign key)
- `scheduled_time`: timestamp with time zone (Giờ hệ thống hẹn uống)
- `amount`: integer (Mặc định 500)
- `status`: text (Các giá trị: 'pending', 'completed', 'missed')

### 4.5. Bảng `meals_fitness_tracking` (Nhật ký ăn uống và tập luyện)
- `id`: bigint (Primary Key)
- `user_id`: uuid (Foreign Key)
- `date`: date
- `meal_plan`: jsonb (Lưu thực đơn AI gợi ý và trạng thái thực tế)
- `exercise_plan`: jsonb (Bài tập AI gợi ý: Cardio/Kháng lực/Pickleball và trạng thái hoàn thành)

## 5. KẾ HOẠCH TRIỂN KHAI (ROADMAP)
- **Giai đoạn 1 (Thiết lập nền móng)**: Khởi tạo Project trên Supabase, tạo các bảng dữ liệu, cấu hình RLS. Tạo bot Telegram trên BotFather lấy Token.
- **Giai đoạn 2 (Xử lý Core Bot)**: Code Next.js API Routes để nhận Webhook từ Telegram. Tích hợp Gemini 1.5 Flash để bóc tách tin nhắn text dời lịch/thêm lịch.
- **Giai đoạn 3 (Xử lý Automation)**: Viết Supabase Edge Function để chạy ngầm lịch nhắc uống nước và cảnh báo động deadline.
- **Giai đoạn 4 (Hoàn thiện Giao diện)**: Xây dựng trang Web Dashboard bằng Next.js kết hợp thư viện UI (như Shadcn/ui, TailwindCSS) hiển thị biểu đồ lịch và tiến trình giảm cân trực quan.
