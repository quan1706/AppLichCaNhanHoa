import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';

// Initialize Supabase Client with service role key to bypass RLS at the server level
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Groq Client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const QUAN_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';
const QUAN_UUID = '81552056-57ab-4cde-8f01-23456789abcd'; // Static UUID for Quan to sync Telegram and Web dashboard

// Helper to send message back to Telegram
async function sendTelegramMessage(chatId: string, text: string) {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
      }),
    });
    if (!res.ok) {
      console.error('Failed to send Telegram message:', await res.text());
    }
  } catch (error) {
    console.error('Error sending Telegram message:', error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('--- RECEIVED TELEGRAM WEBHOOK ---', JSON.stringify(body));

    // Support standard webhook message updates
    if (!body.message || !body.message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = String(body.message.chat.id);
    const messageText = body.message.text.trim();
    const username = body.message.from.first_name || 'Quân';

    // 1. Authorization: Only allow Quan to communicate with this bot
    if (chatId !== QUAN_CHAT_ID) {
      console.log(`Unauthorized user attempted to chat: ${chatId}`);
      await sendTelegramMessage(
        chatId,
        `❌ <b>CẢNH BÁO XÂM NHẬP!</b>\n\nỦa cưng là ai thế? Chị chỉ phục vụ đại ca <b>Nguyễn Tam Quân</b> (mập 92kg đang giảm cân) thôi nhé! Xéo đi chỗ khác chơi không chị block bây giờ! 💅`
      );
      return NextResponse.json({ ok: true });
    }

    // 2. Ensure Quan has a profile in Supabase
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', QUAN_UUID)
      .single();

    if (profileError && profileError.code === 'PGRST116') {
      // Profile does not exist, create a default profile for Quan
      console.log('Profile for Quan does not exist. Creating default profile...');
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: QUAN_UUID,
          current_weight: 92.0,
          target_weight: 78.0,
          daily_water_goal: 3500.0,
          daily_calorie_goal: 1600.0,
          daily_protein_goal: 130.0,
        });

      if (insertError) {
        console.error('Failed to create default profile:', insertError);
      }
    }

    // Get current date & time in Vietnam (ICT, GMT+7) for Groq NLP parser reference
    const now = new Date();
    // Offset for GMT+7
    const currentIctOffset = 7 * 60 * 60 * 1000;
    const vietnamTime = new Date(now.getTime() + currentIctOffset);
    const timeString = vietnamTime.toISOString();
    const dayOfWeekNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const currentDayName = dayOfWeekNames[vietnamTime.getUTCDay()];

    console.log(`Current Time (ICT) Reference for Groq: ${timeString} (${currentDayName})`);

    // 3. Use Groq to parse natural language message
    const systemPrompt = `
Bạn là tamquan, một trợ lý nữ ảo cực kỳ đanh đá, sắc sảo, nghiêm khắc nhưng hài hước và châm biếm thực tế. 
Nhiệm vụ của bạn là giúp người dùng tên "Quân" (hiện tại nặng 92kg, mục tiêu giảm xuống 78kg, học tại FPTU) quản lý uống nước, lịch biểu và deadline bài tập.

THÔNG TIN BỐI CẢNH THỜI GIAN THỰC TẾ (HÃY DÙNG LÀM MỐC SO SÁNH):
- Thời gian hiện tại ở Việt Nam: ${timeString}
- Hôm nay là ngày thứ: ${currentDayName}

PHÂN TÍCH TIN NHẮN CỦA QUÂN:
Bạn hãy phân tích tin nhắn của Quân và xác định hành động của anh ấy. Bạn PHẢI trả về một chuỗi JSON hợp lệ (không chứa block markdown \`\`\`json) có cấu trúc như sau:

{
  "action": "water" | "schedule" | "deadline" | "chat",
  "data": {
    // Nếu action là "water":
    "amount": number, // lượng nước uống nạp vào (ml), ví dụ 250, 500, 1000. Nếu không có số, mặc định 250.
    
    // Nếu action là "schedule":
    "title": "tên sự kiện",
    "event_type": "academic" | "work" | "social" | "fitness",
    "start_time": "ISO TIMESTAMP WITH TIMEZONE (ICT +07:00)", // Thời gian bắt đầu sự kiện
    "end_time": "ISO TIMESTAMP WITH TIMEZONE (ICT +07:00)", // Thời gian kết thúc sự kiện (nếu không nói cụ thể, cộng thêm 1 tiếng từ start_time)
    
    // Nếu action là "deadline":
    "title": "tên môn học / bài tập",
    "due_date": "ISO TIMESTAMP WITH TIMEZONE (ICT +07:00)" // Hạn chót nộp bài
  },
  "response_message": "Câu trả lời của bạn gửi lại cho Quân"
}

QUY TẮC CÂU THOẠI PHẢN HỒI (response_message):
- Luôn gọi người dùng là "Quân" hoặc "cưng", tự xưng là "chị" hoặc "tamquan".
- Giọng điệu đanh đá, xéo sắc, châm biếm, nghiêm khắc để đôn đốc kỷ luật.
- Nếu Quân báo UỐNG NƯỚC: khen ngợi một cách châm biếm ("Biết khát rồi hả cưng? Uống đi cho bớt mỡ!", "Chị ghi nhận nạp thêm {amount}ml rồi đấy, lo mà uống đủ 3500ml đi kẻo thành heo đất!").
- Nếu Quân báo LỊCH TRÌNH / DEADLINE: nhắc nhở né giờ học FPTU, giờ làm việc và nhắc nhở phải kỷ luật, không được lười biếng.
- Nếu Quân CHAT THÔNG THƯỜNG: trò chuyện sắc sảo, châm chọc việc béo 92kg, lười tập thể dục hoặc lười học. Luôn lôi các chỉ số cân nặng, đạm (110g-138g/ngày) và calo thâm hụt (mục tiêu 1600kcal) ra kháy khía một cách khôi hài để kích thích động lực.
`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: messageText },
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
    });

    const aiResponseText = completion.choices[0]?.message?.content || '{}';
    console.log('Groq Parser Result Raw:', aiResponseText);
    
    let parsedResult;
    try {
      parsedResult = JSON.parse(aiResponseText);
    } catch (e) {
      console.error('Failed to parse Groq response:', e);
      parsedResult = {
        action: 'chat',
        response_message: 'Hic cưng ơi, mạng Groq bị sao ý làm đầu chị quay cuồng luôn rồi. Nói lại chị nghe xem nào! 💅',
      };
    }

    const { action, data, response_message } = parsedResult;

    // 4. Execute action and save to Supabase Database
    if (action === 'water' && data && data.amount) {
      console.log(`Ghi nhận uống nước: ${data.amount} ml`);
      const { error: dbError } = await supabase
        .from('water_tracking')
        .insert({
          user_id: QUAN_UUID,
          amount: Number(data.amount),
        });

      if (dbError) {
        console.error('Error inserting water tracking:', dbError);
      }
    } else if (action === 'schedule' && data && data.title && data.start_time) {
      console.log(`Ghi nhận lịch trình: ${data.title} (${data.start_time} - ${data.end_time})`);
      const { error: dbError } = await supabase
        .from('schedules')
        .insert({
          user_id: QUAN_UUID,
          title: data.title,
          type: data.event_type || 'academic',
          start_time: data.start_time,
          end_time: data.end_time || new Date(new Date(data.start_time).getTime() + 60 * 60 * 1000).toISOString(),
          is_fixed: false, // New schedules added through AI are dynamic/not fixed unless specified
        });

      if (dbError) {
        console.error('Error inserting schedule:', dbError);
      }
    } else if (action === 'deadline' && data && data.title && data.due_date) {
      console.log(`Ghi nhận deadline: ${data.title} hạn ${data.due_date}`);
      const { error: dbError } = await supabase
        .from('deadlines')
        .insert({
          user_id: QUAN_UUID,
          title: data.title,
          due_date: data.due_date,
          status: 'pending',
        });

      if (dbError) {
        console.error('Error inserting deadline:', dbError);
      }
    }

    // 5. Reply back to Quan on Telegram
    await sendTelegramMessage(chatId, response_message);

    return NextResponse.json({ ok: true, action, data, response_message });
  } catch (error: any) {
    console.error('CRITICAL ERROR IN WEBHOOK HANDLER:', error);
    return NextResponse.json({ ok: false, error: error.message });
  }
}
