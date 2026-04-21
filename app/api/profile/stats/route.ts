import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch recent attempts
    const { data: recentAttempts } = await supabase
      .from('quiz_results')
      .select('id, score, total_points, mode, quizzes(title, subject)')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(5);

    // 2. Fetch all attempts for stats
    const { data: allAttempts } = await supabase
      .from('quiz_results')
      .select('score, total_points')
      .eq('user_id', user.id);

    const attemptsCount = allAttempts?.length || 0;
    let avgScore = 0;
    
    if (allAttempts && attemptsCount > 0) {
      const totalScorePct = allAttempts.reduce((acc, curr) => acc + (curr.score / (curr.total_points || 1)), 0);
      avgScore = Math.round((totalScorePct / attemptsCount) * 100);
    }

    // 3. Notes count
    const { count: notesCount } = await supabase
      .from('notes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // 4. Flashcards count (progress)
    const { count: flashcardsCount } = await supabase
      .from('flashcard_progress')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    return NextResponse.json({
      stats: {
        quiz_attempts: attemptsCount,
        avg_score: avgScore,
        flashcards_studied: flashcardsCount || 0,
        notes: notesCount || 0,
      },
      recent_attempts: (recentAttempts || []).map((a: any) => ({
        id: a.id,
        score: a.score,
        total_points: a.total_points,
        mode: a.mode,
        quiz_title: a.quizzes?.title,
        subject: a.quizzes?.subject,
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
