'use client';

import { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaComment, FaPaperPlane, FaUser } from 'react-icons/fa';
import GlassCard from './GlassCard';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

export default function NoteInteractions({ noteId }: { noteId: string }) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Fetch likes
    fetch(`/api/notes/${noteId}/likes`)
      .then(res => res.json())
      .then(data => {
        if (data.count !== undefined) setLikes(data.count);
        if (data.userLiked !== undefined) setHasLiked(data.userLiked);
      })
      .catch(console.error);

    // Fetch comments
    fetch(`/api/notes/${noteId}/comments`)
      .then(res => res.json())
      .then(data => {
        if (data.data) setComments(data.data);
      })
      .catch(console.error)
      .finally(() => setLoadingComments(false));
  }, [noteId]);

  async function toggleLike() {
    if (!user) {
      alert('Silakan login terlebih dahulu untuk menyukai catatan ini.');
      return;
    }
    
    // Optimistic UI
    setHasLiked(!hasLiked);
    setLikes(prev => hasLiked ? prev - 1 : prev + 1);

    try {
      const res = await fetch(`/api/notes/${noteId}/likes`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error('Failed to toggle like');
      // Sync with server if needed
      setHasLiked(data.liked);
    } catch (err) {
      console.error(err);
      // Revert optimistic update
      setHasLiked(hasLiked);
      setLikes(prev => hasLiked ? prev + 1 : prev - 1);
    }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      alert('Silakan login terlebih dahulu untuk berkomentar.');
      return;
    }
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/notes/${noteId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment })
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setComments(prev => [...prev, json.data]);
        setNewComment('');
      } else {
        throw new Error(json.error || 'Failed to post comment');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
      {/* Actions */}
      <div className="flex items-center gap-6 mb-8">
        <button 
          onClick={toggleLike}
          className="flex items-center gap-2 group transition-colors focus:outline-none"
        >
          {hasLiked ? (
            <FaHeart className="text-red-500 text-xl group-hover:scale-110 transition-transform" />
          ) : (
            <FaRegHeart className="text-gray-400 group-hover:text-red-500 text-xl group-hover:scale-110 transition-transform" />
          )}
          <span className={`font-medium ${hasLiked ? 'text-red-500' : 'text-gray-500'}`}>{likes} Suka</span>
        </button>
        <div className="flex items-center gap-2 text-gray-500">
          <FaComment className="text-xl" />
          <span className="font-medium">{comments.length} Komentar</span>
        </div>
      </div>

      {/* Comments Section */}
      <GlassCard padding="p-6">
        <h3 className="text-lg font-bold mb-6">Komentar Diskusi</h3>
        
        {/* Comment Form */}
        <form onSubmit={submitComment} className="flex gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center flex-shrink-0">
             {user?.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover"/> : <FaUser className="text-white text-sm" />}
          </div>
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={user ? "Tulis komentar Anda..." : "Login untuk berkomentar..."}
              disabled={!user || submitting}
              className="w-full px-4 py-3 pr-12 glass rounded-xl border border-white/20 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            />
            <button 
              type="submit" 
              disabled={!user || submitting || !newComment.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary-500 hover:text-primary-600 disabled:opacity-50 disabled:hover:text-primary-500 transition-colors"
            >
              <FaPaperPlane />
            </button>
          </div>
        </form>

        {/* Comment List */}
        <div className="space-y-6">
          {loadingComments ? (
            <p className="text-gray-500 text-sm text-center py-4">Memuat komentar...</p>
          ) : comments.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">Belum ada komentar. Jadilah yang pertama berdiskusi!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  {comment.avatar_url ? <img src={comment.avatar_url} className="w-full h-full rounded-full object-cover"/> : <span className="font-bold text-gray-500 text-xs">{comment.username?.[0]?.toUpperCase()}</span>}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm">{comment.username || 'Pengguna'}</span>
                    <span className="text-xs text-gray-500">• {formatDate(comment.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-r-xl rounded-bl-xl inline-block border border-gray-100 dark:border-gray-800">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}
