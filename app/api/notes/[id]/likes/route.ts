import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { count, error } = await supabase
      .from('note_likes')
      .select('id', { count: 'exact', head: true })
      .eq('note_id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Check if current user liked it
    let userLiked = false;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: like } = await supabase
        .from('note_likes')
        .select('id')
        .eq('note_id', id)
        .eq('user_id', user.id)
        .single();
      userLiked = !!like;
    }

    return NextResponse.json({ count: count || 0, userLiked });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: noteId } = await params;

    // Check existing like
    const { data: existingLike } = await supabase
      .from('note_likes')
      .select('id')
      .eq('note_id', noteId)
      .eq('user_id', user.id)
      .single();

    if (existingLike) {
      // Unlike
      await supabase.from('note_likes').delete().eq('id', existingLike.id);
      return NextResponse.json({ liked: false });
    } else {
      // Like
      await supabase.from('note_likes').insert({ note_id: noteId, user_id: user.id });
      return NextResponse.json({ liked: true });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
