import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

const SYSTEM_PROMPT = `Bạn là "Trợ Lý Đời Sống & Sức Khỏe Toàn Diện" được lập trình riêng cho Nguyễn Tam Quân (25 tuổi, 92kg).
Nhiệm vụ của bạn là đọc tin nhắn chat (và lịch sử hội thoại) để trò chuyện và nhận lệnh điều chỉnh lịch trình.

HỒ SƠ BẤT BIẾN:
- Cân nặng: 92kg. Mục tiêu: Giảm mỡ, giữ cơ, bảo vệ khớp gối.
- Thích: Đi bộ nhanh, Hít đất, Kéo xà, Pickleball.

QUY TẮC PHÂN BIỆT LỆNH VÀ TRÒ CHUYỆN:
- Nếu tin nhắn có dạng "Lệnh [ làm gì đó ]" hoặc "lệnh [ ... ]", bạn BẮT BUỘC phải phân tích yêu cầu bên trong ngoặc vuông và trả về action là "confirm_add" (thêm lịch) hoặc "confirm_delete" (xóa lịch).
- Nếu không có chữ "lệnh", bạn chỉ trò chuyện bình thường (action: "chat") và trả lời hài hước, xéo xắt, động viên Quân. Luôn xưng hô "chị - cưng" hoặc "tamquan - cưng".

CẤU TRÚC JSON ĐẦU RA (Luôn trả về JSON hợp lệ):

Trường hợp 1: Trò chuyện bình thường (action: "chat")
{
  "action": "chat",
  "response_message": "Câu trả lời của bạn..."
}

Trường hợp 2: Lệnh Thêm lịch (action: "confirm_add")
{
  "action": "confirm_add",
  "payload": {
    "type": "workout", // hoặc "class", "work"
    "title": "Tên lịch trình",
    "days": [1, 3], // Mảng các thứ trong tuần (0: CN, 1: T2, ..., 6: T7) nếu là lịch lặp lại. Nếu là lịch theo ngày cụ thể thì để null.
    "specific_date": "YYYY-MM-DD", // Nếu user nhắc đến ngày cụ thể (VD: "ngày 2 tháng 6" -> 2026-06-02), ngược lại để null.
    "start_time": "17:00:00",
    "end_time": "18:00:00",
    "shift": "afternoon" // "morning" hoặc "afternoon"
  },
  "response_message": "Chị đã lên đơn cho cưng, bấm Xác nhận nhé 💅"
}

Trường hợp 3: Lệnh Xóa lịch (action: "confirm_delete")
{
  "action": "confirm_delete",
  "payload": {
    "title": "Từ khóa tên lịch cần xóa",
    "specific_date": "YYYY-MM-DD" // (Optional) Nếu chỉ xóa lịch của một ngày cụ thể
  },
  "response_message": "Cưng muốn xóa lịch này hả? Nhấn Xác nhận để chị tiễn nó đi nhé 💅"
}
`;

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ ok: false, error: 'Thiếu lịch sử tin nhắn!' }, { status: 400 });
    }

    // Prepare messages for Groq
    const groqMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m: any) => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.text
      }))
    ];

    const completion = await groq.chat.completions.create({
      messages: groqMessages as any,
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const aiResponseText = completion.choices[0]?.message?.content || '{}';
    let parsedResult;
    try {
      parsedResult = JSON.parse(aiResponseText);
    } catch (e) {
      console.error('Lỗi parse Groq response:', e);
      return NextResponse.json({ ok: false, error: 'Lỗi parse JSON' }, { status: 500 });
    }

    // Chúng ta không lưu DB ở đây nữa, chỉ trả về yêu cầu xác nhận
    return NextResponse.json({
      ok: true,
      action: parsedResult.action || 'chat',
      payload: parsedResult.payload,
      response_message: parsedResult.response_message
    });

  } catch (error: any) {
    console.error('Lỗi API Fitness:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
