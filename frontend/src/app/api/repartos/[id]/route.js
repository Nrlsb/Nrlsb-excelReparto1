import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { getUser, getUserRole, unauthorizedResponse } from '@/lib/auth';

export async function PUT(req, { params }) {
  const user = await getUser(req);
  if (!user) return unauthorizedResponse();

  const { id } = await params;
  const role = await getUserRole(user.id);

  if (role !== 'admin' && role !== 'especial') {
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('repartos')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: 'No tienes permiso para modificar este reparto.' }, { status: 403 });
    }
  }

  try {
    const body = await req.json();
    const { data, error } = await supabaseAdmin
      .from('repartos')
      .update(body)
      .eq('id', id)
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data.length) return NextResponse.json({ error: 'Reparto no encontrado' }, { status: 404 });

    return NextResponse.json(data[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Error procesando solicitud' }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  const user = await getUser(req);
  if (!user) return unauthorizedResponse();

  const { id } = await params;
  const role = await getUserRole(user.id);

  if (role !== 'admin' && role !== 'especial') {
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('repartos')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: 'No tienes permiso para eliminar este reparto.' }, { status: 403 });
    }
  }

  const { error } = await supabaseAdmin.from('repartos').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return new NextResponse(null, { status: 204 });
}
