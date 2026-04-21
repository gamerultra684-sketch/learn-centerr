import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAdmin, adminError } from '@/lib/admin';

export async function GET() {
  const { isAdmin, error } = await verifyAdmin();
  if (!isAdmin) return adminError(error!);

  try {
    const supabase = await createClient();

    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('id, username, role, avatar_url, created_at')
      .order('created_at', { ascending: false });

    if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });

    return NextResponse.json({ data: data || [] });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { isAdmin, error } = await verifyAdmin();
  if (!isAdmin) return adminError(error!);

  try {
    const { userId, role } = await req.json();

    if (!userId || !['user', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid userId or role' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select('id, username, role')
      .single();

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
