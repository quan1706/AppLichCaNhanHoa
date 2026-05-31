import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const QUAN_UUID = '81552056-57ab-4cde-8f01-23456789abcd'; // From schema default

export async function POST(request: Request) {
  try {
    const { action, payload } = await request.json();

    if (!action || !payload) {
      return NextResponse.json({ ok: false, error: 'Thiếu tham số' }, { status: 400 });
    }

    if (action === 'confirm_add') {
      const scheduleToInsert = {
        profile_id: QUAN_UUID,
        type: payload.type || 'workout',
        title: payload.title || 'Lịch tập',
        days: payload.days || null,
        specific_date: payload.specific_date || null,
        start_time: payload.start_time || '17:00:00',
        end_time: payload.end_time || '18:00:00',
        shift: payload.shift || 'afternoon'
      };

      const { data, error } = await supabase
        .from('schedules')
        .insert([scheduleToInsert])
        .select();

      if (error) {
        console.error('Lỗi thêm lịch:', error);
        throw error;
      }

      return NextResponse.json({ ok: true, data: data[0] });
    } 
    
    else if (action === 'confirm_delete') {
      let query = supabase.from('schedules').delete().eq('profile_id', QUAN_UUID);

      if (payload.title) {
        query = query.ilike('title', `%${payload.title}%`);
      }
      
      if (payload.specific_date) {
        query = query.eq('specific_date', payload.specific_date);
      } else {
        // Nếu không có specific_date thì xóa các lịch lặp lại (days is not null hoặc theo title)
        // Việc ilike title ở trên đã là đủ, không cần query phức tạp thêm.
      }

      const { error } = await query;
      if (error) {
        console.error('Lỗi xóa lịch:', error);
        throw error;
      }

      return NextResponse.json({ ok: true, message: 'Đã xóa thành công' });
    }

    return NextResponse.json({ ok: false, error: 'Hành động không hợp lệ' }, { status: 400 });

  } catch (error: any) {
    console.error('Lỗi API Execute:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
