import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sanitize } from '@/lib/sanitizer';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data, error } = await supabase
      .from('note_comments')
      .select('id, content, created_at, user_id, profiles(username, avatar_url)')
      .eq('note_id', id)
      .order('created_at', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const formatted = data.map((c: any) => ({
      id: c.id,
      content: c.content,
      created_at: c.created_at,
      user_id: c.user_id,
      username: Array.isArray(c.profiles) ? c.profiles[0]?.username : c.profiles?.username,
      avatar_url: Array.isArray(c.profiles) ? c.profiles[0]?.avatar_url : c.profiles?.avatar_url,
    }));

    return NextResponse.json({ data: formatted });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: noteId } = await params;
    const body = await req.json();

    if (!body.content || typeof body.content !== 'string' || body.content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('note_comments')
      .insert({
        note_id: noteId,
        user_id: user.id,
        content: sanitize(body.content)
      })
      .select('id, content, created_at, user_id, profiles(username, avatar_url)')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const formatted = {
      id: data.id,
      content: data.content,
      created_at: data.created_at,
      user_id: data.user_id,
      username: Array.isArray(data.profiles) ? data.profiles[0]?.username : (data.profiles as any)?.username,
      avatar_url: Array.isArray(data.profiles) ? data.profiles[0]?.avatar_url : (data.profiles as any)?.avatar_url,
    };

    return NextResponse.json({ data: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
