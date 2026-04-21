import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAdmin, adminError } from '@/lib/admin';
import { z } from 'zod';

const quizSchema = z.object({
  title: z.string().min(3),
  subject: z.string().min(2),
  description: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  time_limit: z.number().min(5).default(30),
  is_public: z.boolean().default(false),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data, error } = await supabase
      .from('quizzes')
      .select('*, quiz_questions(*)')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
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
  const { user, isAdmin, error: authErr } = await verifyAdmin();
  if (!isAdmin) return adminError(authErr!);

  try {
    const { id } = await params;
    const body = await req.json();
    const validated = quizSchema.partial().parse(body);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('quizzes')
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
      .from('quizzes')
      .delete()
      .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
