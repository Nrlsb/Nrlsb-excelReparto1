import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { getUser, getUserRole, unauthorizedResponse } from '@/lib/auth';

export async function DELETE(req) {
  const user = await getUser(req);
  if (!user) return unauthorizedResponse();

  const role = await getUserRole(user.id);
  let query = supabaseAdmin.from('repartos').delete();

  if (role === 'admin' || role === 'especial') {
    query = query.neq('id', 0); 
  } else {
    query = query.eq('user_id', user.id);
  }

  const { error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return new NextResponse(null, { status: 204 });
}
