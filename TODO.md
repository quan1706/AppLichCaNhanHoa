# TODO - AppLichCaNhanHoa

## Mục tiêu
- Lưu `notes` của Screen2 (tasks/deadlines) vào Database
- Đổi giao diện cột trong bảng tasks: thêm cột `note`
- Note hiển thị truncation, click mở popup xem chi tiết, click ngoài đóng

## Steps
- [x] 1) (DB) Thêm cột `notes` (text, nullable) vào bảng `tasks`
- [x] 2) Cập nhật `src/app/components/tasks/index.tsx`: payload insert/update có `notes`, mapdb đọc `notes`
- [x] 3) Cập nhật header & grid columns trong `src/app/components/tasks/index.tsx` để có cột `note`
- [x] 4) Cập nhật `src/app/components/tasks/TaskRow.tsx`:
      - [x] render cột note với font cố định, ẩn nếu dài
      - [x] popup xem chi tiết
      - [x] click ngoài khung popup đóng
- [ ] 5) Test nhanh: tạo/sửa task có note -> refresh kiểm tra lưu DB


