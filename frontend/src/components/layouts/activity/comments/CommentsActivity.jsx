import { API_URL } from '../../../../config';
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const CommentsActivity = ({ marketId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    const fetchComments = async (pageToFetch = 1, append = false) => {
        try {
            if (append) setLoadingMore(true);
            else setLoading(true);

            const response = await fetch(`${API_URL}/v0/markets/${marketId}/comments?page=${pageToFetch}&limit=10`);
            if (response.ok) {
                const data = await response.json();
                // data is now a Pagination object: { rows: [...], page: 1, limit: 10, totalRows: X, totalPages: Y }
                const newRows = data.rows || [];
                setComments(prev => append ? [...prev, ...newRows] : newRows);
                setHasMore(data.page < data.totalPages);
                setPage(data.page);
            } else {
                console.error('Error fetching comments:', response.statusText);
                setError('Failed to load comments');
            }
        } catch (err) {
            console.error('Error fetching comments:', err);
            setError('Failed to load comments');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        if (marketId) {
            fetchComments(1, false);
        }
    }, [marketId]);

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            fetchComments(page + 1, true);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            setSubmitting(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/v0/markets/${marketId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    content: newComment,
                    replyToId: replyTo ? replyTo.id : null
                })
            });

            if (response.ok) {
                const addedComment = await response.json();
                
                if (addedComment.replyToId) {
                    // Find the parent and add to its replies
                    setComments(prev => prev.map(c => {
                        if (c.id === addedComment.replyToId) {
                            return { ...c, replies: [...(c.replies || []), addedComment] };
                        }
                        return c;
                    }));
                } else {
                    // Add to root comments
                    setComments([addedComment, ...comments]);
                }
                
                setNewComment('');
                setReplyTo(null);
            } else {
                const errData = await response.text();
                alert(`Error posting comment: ${errData}`);
            }
        } catch (err) {
            console.error('Error posting comment:', err);
            alert('Failed to post comment');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const CommentItem = ({ comment, isReply = false }) => (
        <div className={`${isReply ? 'ml-8 mt-3 border-l-2 border-white/5 pl-4' : 'bg-white/[0.02] border border-white/5 p-4'} rounded-xl space-y-3 transition-all hover:bg-white/[0.04]`}>
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-lg shadow-inner overflow-hidden">
                        {comment.User?.avatar ? (
                            <img src={comment.User.avatar} alt={comment.username} className="w-full h-full object-cover" />
                        ) : (
                            comment.User?.personalEmoji || '👤'
                        )}
                    </div>
                    <div>
                        <div className="text-[#ddff5c] text-[11px] font-black uppercase tracking-widest cursor-default">
                            @{comment.username}
                        </div>
                        <span className="text-white/20 text-[9px] font-black uppercase tracking-widest">
                            {formatDate(comment.createdAt)}
                        </span>
                    </div>
                </div>
                {!isReply && (
                    <button 
                        onClick={() => {
                            setReplyTo(comment);
                            // Scroll to input form
                            document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-white/30 hover:text-[#ddff5c] transition-colors"
                        title="Reply"
                    >
                        <span className="material-symbols-outlined text-lg">reply</span>
                    </button>
                )}
            </div>
            
            <div className="text-white/80 text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {comment.content}
                </ReactMarkdown>
            </div>

            {!isReply && comment.replies && comment.replies.length > 0 && (
                <div className="space-y-3 mt-4">
                    {comment.replies.map(reply => (
                        <CommentItem key={reply.id} comment={reply} isReply={true} />
                    ))}
                </div>
            )}
        </div>
    );

    if (loading && page === 1) {
        return (
            <div className="p-8 text-center">
                <div className="text-white/40 text-[10px] font-black uppercase tracking-widest animate-pulse">Loading comments...</div>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6">
            {/* Comment Input */}
            <div className="space-y-4" id="comment-form">
                {replyTo && (
                    <div className="flex justify-between items-center bg-[#ddff5c]/10 border border-[#ddff5c]/20 rounded-lg px-3 py-2">
                        <span className="text-[#ddff5c] text-[10px] font-black uppercase tracking-widest">
                            Replying to @{replyTo.username}
                        </span>
                        <button onClick={() => setReplyTo(null)} className="text-[#ddff5c] hover:brightness-125">
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-3">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white text-sm focus:outline-none focus:border-[#ddff5c]/50 min-h-[120px] resize-none transition-all placeholder:text-white/20"
                        disabled={submitting}
                    />
                    <div className="flex justify-end gap-3">
                        {replyTo && (
                            <button
                                type="button"
                                onClick={() => setReplyTo(null)}
                                className="text-white/40 font-black uppercase tracking-widest text-[10px] px-6 py-2 rounded-full hover:text-white transition-all"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={submitting || !newComment.trim()}
                            className="bg-[#ddff5c] text-black font-black uppercase tracking-widest text-[10px] px-8 py-3 rounded-full hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#ddff5c]/10"
                        >
                            {submitting ? 'Posting...' : (replyTo ? 'Post Reply' : 'Post Comment')}
                        </button>
                    </div>
                </form>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
                {comments.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                        <span className="material-symbols-outlined text-white/10 text-4xl mb-3">chat_bubble</span>
                        <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">No comments yet. Be the first to join the discussion!</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-6">
                            {comments.map((comment) => (
                                <CommentItem key={comment.id} comment={comment} />
                            ))}
                        </div>

                        {hasMore && (
                            <div className="pt-4 flex justify-center">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    className="text-white/40 hover:text-[#ddff5c] text-[10px] font-black uppercase tracking-widest py-3 px-8 rounded-full border border-white/10 hover:border-[#ddff5c]/30 transition-all disabled:opacity-50"
                                >
                                    {loadingMore ? 'Loading...' : 'Load More Comments'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CommentsActivity;
