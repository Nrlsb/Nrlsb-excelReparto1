import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { getUser, unauthorizedResponse } from '@/lib/auth';

export async function PUT(req) {
  const user = await getUser(req);
  if (!user) return unauthorizedResponse();

  try {
    const { username, website, avatar_url } = await req.json();

    // Actualizar metadatos de auth
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { user_metadata: { username: username } }
    );

    if (authError) return NextResponse.json({ error: authError.message }, { status: 500 });

    // Actualizar tabla profiles
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id: user.id,
      username,
      website,
      avatar_url,
      updated_at: new Date(),
    });

    if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });
    
    return NextResponse.json({ message: 'Perfil actualizado correctamente.' });
  } catch (error) {
    return NextResponse.json({ error: 'Error procesando solicitud' }, { status: 400 });
  }
}
