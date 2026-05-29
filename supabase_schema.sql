-- Kích hoạt UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Xóa các bảng cũ nếu đã tồn tại để tránh lỗi trùng lặp
DROP TABLE IF EXISTS groceries CASCADE;
DROP TABLE IF EXISTS meal_plans CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 1. Bảng Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  age INTEGER,
  current_weight DECIMAL(5,2),
  target_weight DECIMAL(5,2),
  height DECIMAL(5,2),
  water_goal INTEGER,
  activity_level TEXT,
  telegram_username TEXT,
  bot_token TEXT,
  bot_personality TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Bảng Schedules (Lịch học/Làm/Tập)
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('class', 'work', 'workout')),
  title TEXT NOT NULL,
  days INTEGER[] NOT NULL, -- Ví dụ: [0, 2, 4] (CN, T3, T5)
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  shift TEXT NOT NULL CHECK (shift IN ('morning', 'afternoon')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Bảng Tasks (Deadline)
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  is_done BOOLEAN DEFAULT FALSE,
  is_starred BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Bảng Meal Plans
CREATE TABLE meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_kcal INTEGER NOT NULL,
  total_protein INTEGER NOT NULL,
  meals JSONB NOT NULL, -- Mảng chứa bữa sáng, trưa, tối (desc, kcal, protein, type)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, date)
);

-- 5. Bảng Groceries (Đi chợ)
CREATE TABLE groceries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  qty TEXT NOT NULL,
  tip TEXT,
  is_bought BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bật Row Level Security (RLS) để bảo mật
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE groceries ENABLE ROW LEVEL SECURITY;

-- Tạo Policy cho phép Đọc/Ghi thoải mái
CREATE POLICY "Allow public all access to profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access to schedules" ON schedules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access to tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access to meal_plans" ON meal_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access to groceries" ON groceries FOR ALL USING (true) WITH CHECK (true);

-- Insert dữ liệu mặc định (Anh Quân)
INSERT INTO profiles (id, full_name, age, current_weight, target_weight, height, water_goal, activity_level)
VALUES ('81552056-57ab-4cde-8f01-23456789abcd', 'Nguyễn Tam Quân', 22, 92.0, 78.0, 172.0, 3500, 'Vừa phải');
