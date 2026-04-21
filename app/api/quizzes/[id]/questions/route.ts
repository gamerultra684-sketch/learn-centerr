import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Fetch quiz questions — strips correct_answer for client safety
    // Correct answers are only evaluated server-side in /api/quizzes/attempt
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('id, question, question_text, question_type, options, explanation, points')
      .eq('quiz_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Normalize: ensure question_text field exists
    const normalized = (data || []).map((q: any) => ({
      ...q,
      question_text: q.question_text || q.question,
      options: Array.isArray(q.options)
        ? q.options
        : (typeof q.options === 'string' ? JSON.parse(q.options) : []),
    }));

    return NextResponse.json({ data: normalized });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
