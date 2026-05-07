import { supabaseAdmin } from './supabaseServer';
import { NextResponse } from 'next/server';

export async function getUser(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return null;
    return user;
  } catch (error) {
    return null;
  }
}

export async function getUserRole(userId) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.error(`Error obteniendo rol para ${userId}:`, error?.message);
    return 'user';
  }
  return data.role;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
}
