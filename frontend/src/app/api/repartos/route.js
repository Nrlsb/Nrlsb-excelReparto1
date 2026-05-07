import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { getUser, getUserRole, unauthorizedResponse } from '@/lib/auth';

export async function GET(req) {
  const user = await getUser(req);
  if (!user) return unauthorizedResponse();

  const role = await getUserRole(user.id);
  let query = supabaseAdmin.from('repartos').select('*');

  if (role !== 'admin' && role !== 'especial') {
    query = query.eq('user_id', user.id);
  }

  const { data, error } = await query.order('id', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req) {
  const user = await getUser(req);
  if (!user) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { data, error } = await supabaseAdmin
      .from('repartos')
      .insert([{ ...body, user_id: user.id }])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0], { status: 21 });
  } catch (error) {
    return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 });
  }
}
