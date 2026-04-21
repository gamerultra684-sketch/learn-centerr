import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // To do true interleaving, we want questions from multiple quizzes randomly
    // Supabase has a trick to get random rows: select everything then shuffle in memory (if small),
    // but better is to use a PostgreSQL function. For simplicity here, we'll fetch a larger set and shuffle.
    // If table gets huge, a custom RPC `get_random_questions` is better.
    
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('id, question_text, question_type, options, explanation, points, quizzes(title, subject)')
      .limit(limit * 3); // Fetch 3x and pick random

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (!data || data.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Shuffle and pick limit
    const shuffled = data.sort(() => 0.5 - Math.random()).slice(0, limit);

    // Normalize
    const normalized = shuffled.map((q: any) => ({
      id: q.id,
      question: q.question_text,
      question_type: q.question_type,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
      explanation: q.explanation,
      points: q.points,
      quiz_title: q.quizzes?.title,
      subject: q.quizzes?.subject,
    }));

    return NextResponse.json({ data: normalized });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
