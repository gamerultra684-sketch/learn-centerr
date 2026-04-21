import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAdmin, adminError } from '@/lib/admin';
import { z } from 'zod';
import { sanitizeObject } from '@/lib/sanitizer';

const questionSchema = z.object({
  question: z.string().min(1),
  question_text: z.string().optional(), // alias for question
  question_type: z.enum(['multiple_choice', 'true_false', 'multiple_answer', 'essay']),
  options: z.array(z.string()).optional(),
  correct_answer: z.union([z.string(), z.number()]).transform(String),
  explanation: z.string().optional(),
  points: z.number().min(1).default(1),
  order_num: z.number().optional(),
});

const batchSchema = z.array(questionSchema);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', id)
      .order('created_at', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data: data || [] });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, isAdmin, error } = await verifyAdmin();
  if (!isAdmin) return adminError(error!);

  try {
    const { id: quizId } = await params;
    const rawBody = await req.json();
    const validated = batchSchema.parse(rawBody);
    const sanitized = sanitizeObject(validated);

    const supabase = await createClient();

    // Delete existing questions for this quiz, then insert new batch
    await supabase.from('quiz_questions').delete().eq('quiz_id', quizId);

    const rows = sanitized.map((q: any, idx: number) => ({
      quiz_id: quizId,
      user_id: user!.id,
      question: q.question_text || q.question,
      question_text: q.question_text || q.question,
      question_type: q.question_type,
      options: q.options ? JSON.stringify(q.options) : '[]',
      correct_answer: Number(q.correct_answer),
      explanation: q.explanation || null,
      points: q.points ?? 1,
    }));

    const { error: insertError } = await supabase
      .from('quiz_questions')
      .insert(rows);

    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

