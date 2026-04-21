import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAdmin, adminError } from '@/lib/admin';
import { z } from 'zod';

const deckSchema = z.object({
  title: z.string().min(3),
  subject: z.string().min(2),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { isAdmin, error: authErr } = await verifyAdmin();
  if (!isAdmin) return adminError(authErr!);

  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data, error } = await supabase
      .from('flashcard_decks')
      .select('*, flashcards(*)')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { isAdmin, error: authErr } = await verifyAdmin();
  if (!isAdmin) return adminError(authErr!);

  try {
    const { id } = await params;
    const body = await req.json();
    const validated = deckSchema.partial().parse(body);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('flashcard_decks')
      .update(validated)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { isAdmin, error: authErr } = await verifyAdmin();
  if (!isAdmin) return adminError(authErr!);

  try {
    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase
      .from('flashcard_decks')
      .delete()
      .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
