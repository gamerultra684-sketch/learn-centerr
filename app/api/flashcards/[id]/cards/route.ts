import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { sanitizeObject } from '@/lib/sanitizer';

const cardSchema = z.object({
  front: z.string().min(1),
  back: z.string().min(1)
});

const batchSchema = z.array(cardSchema);

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: deckId } = await params;
    const rawBody = await req.json();
    const validated = batchSchema.parse(rawBody);
    const sanitized = sanitizeObject(validated);

    // Verify ownership
    const { data: deck, error: deckErr } = await supabase
      .from('flashcard_decks')
      .select('id')
      .eq('id', deckId)
      .eq('user_id', user.id)
      .single();

    if (deckErr || !deck) {
      return NextResponse.json({ error: 'Deck not found or unauthorized' }, { status: 403 });
    }

    // Delete existing cards for this deck, then insert new batch
    await supabase.from('flashcards').delete().eq('deck_id', deckId);

    const rows = sanitized.map((c: any) => ({
      deck_id: deckId,
      front: c.front,
      back: c.back,
    }));

    if (rows.length > 0) {
      const { error: insertError } = await supabase
        .from('flashcards')
        .insert(rows);

      if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
