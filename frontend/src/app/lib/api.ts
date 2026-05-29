import { supabase, QUAN_UUID } from './supabaseClient';

// ── PROFILES ──
export async function getProfile() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', QUAN_UUID)
    .single();
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
}

export async function updateProfile(updates: any) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', QUAN_UUID)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── SCHEDULES ──
export async function getSchedules() {
  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .eq('profile_id', QUAN_UUID);
  if (error) throw error;
  return data || [];
}

export async function upsertSchedule(schedule: any) {
  const { data, error } = await supabase
    .from('schedules')
    .upsert({ ...schedule, profile_id: QUAN_UUID })
    .select();
  if (error) throw error;
  return data;
}

export async function deleteSchedule(id: string) {
  const { error } = await supabase
    .from('schedules')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ── TASKS / DEADLINES ──
export async function getTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('profile_id', QUAN_UUID)
    .order('deadline', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function addTask(task: { title: string; category: string; deadline: string; is_starred?: boolean }) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([{ ...task, profile_id: QUAN_UUID }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTask(id: string, updates: any) {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTask(id: string) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ── NUTRITION (Meal Plans & Groceries) ──
export async function getMealPlanByDate(dateStr: string) {
  const { data, error } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('profile_id', QUAN_UUID)
    .eq('date', dateStr)
    .single();
  if (error && error.code !== 'PGRST116') { // PGRST116 is 'not found', which is fine.
    console.error('Error fetching meal plan:', error);
  }
  return data;
}

export async function upsertMealPlan(plan: any) {
  const { data, error } = await supabase
    .from('meal_plans')
    .upsert({ ...plan, profile_id: QUAN_UUID })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getGroceries(weekStartDate: string) {
  const { data, error } = await supabase
    .from('groceries')
    .select('*')
    .eq('profile_id', QUAN_UUID)
    .eq('week_start_date', weekStartDate)
    .order('category', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function upsertGroceries(groceriesList: any[]) {
  const items = groceriesList.map(item => ({ ...item, profile_id: QUAN_UUID }));
  const { data, error } = await supabase
    .from('groceries')
    .upsert(items)
    .select();
  if (error) throw error;
  return data;
}

export async function toggleGroceryBought(id: string, is_bought: boolean) {
  const { data, error } = await supabase
    .from('groceries')
    .update({ is_bought })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
