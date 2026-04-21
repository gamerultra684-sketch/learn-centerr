import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAdmin, adminError } from '@/lib/admin';
import { z } from 'zod';
import { sanitize } from '@/lib/sanitizer';

const deckSchema = z.object({
  title: z.string().min(3),
  subject: z.string().min(2),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

export async function GET() {
  const { isAdmin, error } = await verifyAdmin();
  if (!isAdmin) return adminError(error!);

  try {
    const supabase = await createClient();
    // Get decks with card count
    const { data, error: fetchError } = await supabase
      .from('flashcard_decks')
      .select('*, flashcards(count)')
      .order('created_at', { ascending: false });

    if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });

    const formatted = data.map((d: any) => ({
      ...d,
      card_count: d.flashcards?.[0]?.count || 0
    }));

    return NextResponse.json({ data: formatted });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { user, isAdmin, error } = await verifyAdmin();
  if (!isAdmin) return adminError(error!);

  try {
    const rawBody = await req.json();
    const validated = deckSchema.parse(rawBody);

    const supabase = await createClient();
    const { data, error: insertError } = await supabase
      .from('flashcard_decks')
      .insert({
        ...validated,
        title: sanitize(validated.title),
        subject: sanitize(validated.subject),
        description: sanitize(validated.description || ''),
        user_id: user!.id
      })
      .select()
      .single();

    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

    return NextResponse.json({ data });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
