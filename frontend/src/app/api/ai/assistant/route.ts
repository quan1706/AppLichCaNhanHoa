import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Master System Prompt cho Agent Mới (Theo sát Báo Cáo Thiết Kế)
const SYSTEM_PROMPT = `Bạn là "Trợ Lý Đời Sống & Sức Khỏe Toàn Diện" được lập trình riêng cho Nguyễn Tam Quân (25 tuổi, 92kg, Sinh viên FPTU). Bạn có nhiệm vụ đọc dữ liệu lịch trình từ cơ sở dữ liệu Supabase để tự động thiết kế lịch ăn và lịch tập cá nhân hóa theo từng ngày.

HỒ SƠ BẤT BIẾN CỦA USER:
- Cân nặng: 92kg. Mục tiêu: Giảm mỡ, giữ cơ, BẢO VỆ KHỚP GỐI (Tuyệt đối không chạy bộ, không nhảy nặng).
- Bộ môn hình thể: Đi bộ nhanh (Cardio đốt mỡ), Hít đất (Push-up), Kéo xà (Pull-up), Dây kháng lực.
- Bộ môn đối kháng: Pickleball (Cố định Thứ 3, Thứ 5 từ 17:00 - 19:00).
- Tiêu chí dinh dưỡng: Chuẩn sinh viên, rẻ, nấu dưới 15 phút. Nguồn đạm luân phiên: Trứng gà, ức gà, đậu khuôn, cá hộp. Tinh bột: Khoai lang, yến mạch, cơm lứt. Trái cây: Chuối (ngày tập), Ổi (ngày nghỉ).

QUY TẮC ĐỌC DỮ LIỆU JSON ĐỂ LÊN LỊCH:
Khi nhận được dữ liệu JSON từ bảng \`user_schedule\`, bạn phải:
1. Xác định các khoảng thời gian trống sau giờ làm/giờ học (thường là sau 17:00).
2. Nếu ngày đó có sự kiện "Pickleball" hoặc \`category = 'sport'\`: Thiết kế Bữa xế có 1 quả chuối/khoai lang trước tập 1 tiếng. Nhắc nhở uống nước điện giải (Oresol/viên sủi). Bữa tối ăn tinh bột tốt (khoai lang) để phục hồi. Không xếp thêm bài tập tại nhà.
3. Nếu là ngày bình thường: Xếp 30-45 phút Đi bộ vào khoảng trống + 15 phút tập kháng lực tại nhà (Thứ 2-6: Hít đất; Thứ 4-7: Kéo xà). Bữa xế ăn 1 quả ổi. Bữa tối TUYỆT ĐỐI KHÔNG tinh bột (Chỉ ăn Đậu khuôn/Trứng + Rau/Dưa leo).
4. Phải luôn tính toán tổng lượng đạm đạt mốc 110g - 138g protein tinh chất/ngày dựa trên công thức đa dạng đạm.

ĐỊNH DẠNG ĐẦU RA (OUTPUT FORM):
Bạn phải trả về dữ liệu cấu trúc rõ ràng theo từng ngày dưới định dạng JSON hợp lệ, bao gồm mốc giờ chính xác. Luôn sẵn sàng nhận lệnh điều chỉnh khẩn cấp từ user để tính toán lại ngay lập tức.
Cấu trúc JSON yêu cầu:
{
  "action": "generate_plan",
  "plans": [
    {
      "date": "YYYY-MM-DD",
      "meal_breakfast": "Chi tiết món ăn sáng",
      "meal_lunch": "Chi tiết món ăn trưa",
      "meal_snack": "Chi tiết bữa xế",
      "workout_schedule": "Chi tiết lịch tập (Ví dụ: 17:15-18:00: Đi bộ + Hít đất)",
      "meal_dinner": "Chi tiết bữa tối",
      "water_remind": "Lời nhắc uống nước"
    }
  ],
  "response_message": "Lời nhắn động viên gửi đến Quân 🏋️‍♂️💪💅"
}`;

export async function POST(request: Request) {
  try {
    const { message, startDate, endDate } = await request.json();
    if (!message || !message.trim()) {
      return NextResponse.json({ ok: false, error: 'Tin nhắn không được để trống!' }, { status: 400 });
    }

    // Reference Vietnam ICT Time
    const now = new Date();
    const currentIctOffset = 7 * 60 * 60 * 1000;
    const vietnamTime = new Date(now.getTime() + currentIctOffset);
    const todayStr = vietnamTime.toISOString().split('T')[0];

    // Default: Next 7 days
    const queryStart = startDate || todayStr;
    const end = new Date(vietnamTime.getTime() + 7 * 24 * 60 * 60 * 1000);
    const queryEnd = endDate || end.toISOString().split('T')[0];

    // 1. Fetch user_schedule for the specified period
    const { data: schedules, error: schedError } = await supabase
      .from('user_schedule')
      .select('*')
      .gte('date', queryStart)
      .lte('date', queryEnd)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (schedError) throw schedError;

    const schedulesJson = JSON.stringify(schedules, null, 2);

    const userPrompt = `Tin nhắn từ Quân: "${message}"

Dữ liệu lịch trình hiện tại (user_schedule) từ ${queryStart} đến ${queryEnd}:
${schedulesJson}

Hãy phân tích và trả về lịch ăn/tập luyện (ai_fitness_plan) theo đúng cấu trúc JSON yêu cầu.`;

    // 2. LLM Call via Gemini
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: { responseMimeType: "application/json" }
    });

    const completion = await model.generateContent(userPrompt);

    const aiResponseText = completion.response.text() || '{}';
    let parsedResult;
    try {
      parsedResult = JSON.parse(aiResponseText);
    } catch (e) {
      console.error('Failed to parse Gemini response:', e);
      return NextResponse.json({ ok: false, error: 'Lỗi parse JSON từ AI' }, { status: 500 });
    }

    const { action, plans, response_message } = parsedResult;

    let insertedPlans = [];
    if (plans && Array.isArray(plans)) {
      // 3. Delete old plans for these dates and insert new ones
      const dates = plans.map((p: any) => p.date);
      if (dates.length > 0) {
        await supabase
          .from('ai_fitness_plan')
          .delete()
          .in('date', dates);

        const { data, error } = await supabase
          .from('ai_fitness_plan')
          .insert(plans)
          .select();

        if (error) throw error;
        insertedPlans = data;
      }
    }

    return NextResponse.json({
      ok: true,
      action,
      response_message,
      insertedPlans
    });

  } catch (error: any) {
    console.error('CRITICAL ERROR IN ASSISTANT API ROUTE:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
