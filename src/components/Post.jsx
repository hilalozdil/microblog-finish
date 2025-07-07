import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

export default function Post({ post, onCommentAdded, onLikeUpdated, onPostDeleted }) {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [comments, setComments] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [currentUser, setCurrentUser] = useState(null);
  const [replyingToComment, setReplyingToComment] = useState(null);
  const [visibleComments, setVisibleComments] = useState(1);

  // Yanıt formu için ayrı useForm hook'u
  const { 
    register: registerReply, 
    handleSubmit: handleSubmitReply, 
    reset: resetReply, 
    formState: { errors: errorsReply } 
  } = useForm();

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null');
    setCurrentUser(loggedInUser);
  }, []);

  // LocalStorage'dan yorumları yükle
  useEffect(() => {
    const storedComments = localStorage.getItem(`comments_${post.id}`);
    if (storedComments) {
      setComments(JSON.parse(storedComments));
    }
  }, [post.id]);

  // LocalStorage'dan beğeni durumunu yükle
  useEffect(() => {
    const likePostCount = localStorage.getItem(`likes_${post.id}`)
    if (likePostCount !== null) {
      setLikeCount(parseInt(likePostCount));
    } else {
      setLikeCount(post.likes || 0);
    }
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    setIsLiked(likedPosts.includes(post.id));
  }, [post.id]);

  const handleCommentSubmit = (data) => {
    console.log('Yorum gönderiliyor:', data); // Debug
    
    const newComment = {
      id: Date.now(),
      username: currentUser?.fullName || currentUser?.username || 'Anonim',
      handle: currentUser?.username || 'Anonim',
      content: data.comment,
      timestamp: 'Şimdi',
      avatar: `https://via.placeholder.com/32x32/1da1f2/ffffff?text=${currentUser?.fullName?.charAt(0) || 'U'}`
    };

    const updatedComments = [newComment, ...comments];
    setComments(updatedComments);

    // LocalStorage'a yorumları kaydet
    localStorage.setItem(`comments_${post.id}`, JSON.stringify(updatedComments));

    // Ana post'a yorum sayısını güncelle
    if (onCommentAdded) {
      onCommentAdded(post.id, updatedComments.length);
    }

    reset();
    setShowCommentForm(false);
  };

  const handleCommentReplySubmit = (data) => {
    const parentComment = comments.find(comment => comment.id === replyingToComment);

    const newReply = {
      id: Date.now(),
      username: currentUser?.fullName || currentUser?.username || 'Anonim',
      handle: currentUser?.username || 'Anonim',
      content: data.comment,
      timestamp: 'Şimdi',
      avatar: `https://via.placeholder.com/32x32/1da1f2/ffffff?text=${currentUser?.fullName?.charAt(0) || 'U'}`,
      parentId: replyingToComment,
      replyTo: parentComment.username
    };

    const updatedComments = [newReply, ...comments];
    setComments(updatedComments);

    // LocalStorage'a yorumları kaydet
    localStorage.setItem(`comments_${post.id}`, JSON.stringify(updatedComments));

    // Ana post'a yorum sayısını güncelle
    if (onCommentAdded) {
      onCommentAdded(post.id, updatedComments.length);
    }

    resetReply();
    setReplyingToComment(null);
  };

  const handleLike = () => {
    const newLikeCount = isLiked ? Math.max(0, likeCount - 1) : likeCount + 1;
    setLikeCount(newLikeCount);
    setIsLiked(!isLiked);

    localStorage.setItem(`likes_${post.id}`, newLikeCount);
    // LocalStorage'a beğeni durumunu kaydet
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    if (isLiked) {
      const updatedLikedPosts = likedPosts.filter(id => id !== post.id);
      localStorage.setItem('likedPosts', JSON.stringify(updatedLikedPosts));
    } else {
      likedPosts.push(post.id);
      localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
    }

    // Ana bileşene beğeni güncellemesini bildir
    if (onLikeUpdated) {
      onLikeUpdated(post.id, newLikeCount);
    }
  };

  const handleDeletePost = () => {
    if (window.confirm('Bu postu silmek istediğinizden emin misiniz?')) {
      // Ana bileşene post silindiğini bildir
      if (onPostDeleted) {
        onPostDeleted(post.id);
      }
    }
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm('Bu yorumu silmek istediğinizden emin misiniz?')) {
      const updatedComments = comments.filter(comment => comment.id !== commentId);
      setComments(updatedComments);

      // LocalStorage'a güncellemeyi kaydet
      localStorage.setItem(`comments_${post.id}`, JSON.stringify(updatedComments));

      // Ana post'a yorum sayısını güncelle
      if (onCommentAdded) {
        onCommentAdded(post.id, updatedComments.length);
      }
    }
  };

  const handleReplyToComment = (commentId) => {
    setReplyingToComment(commentId);
  };

  const loadMoreComments = () => {
    setVisibleComments(prev => prev + 3);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num;
  };

  return (
    <div className="x-post">
      <div className="d-flex">
        <img
          src={post.avatar || 'https://via.placeholder.com/48x48/1da1f2/ffffff?text=U'}
          alt="Avatar"
          className="x-avatar me-3"
        />
        <div className="flex-grow-1">
          <div className="d-flex align-items-center mb-1">
            <span className="fw-bold text-white me-2">{post.username}</span>
            <span className="text-muted">@{post.handle}</span>
            <span className="text-muted ms-2">·</span>
            <span className="text-muted ms-2">{post.timestamp}</span>
          </div>
          <p className="text-white mb-2">{post.content}</p>

          {/* Beğeni,yorum butonları */}
          <div className="d-flex justify-content-between text-muted mb-3">
            <button
              className="btn btn-link text-muted p-0 me-3"
              onClick={(e) => {
                e.preventDefault();
                console.log('Yorum butonu tıklandı, showCommentForm:', !showCommentForm);
                setShowCommentForm(!showCommentForm);
              }}
            >
              <i className="bi bi-chat me-1"></i>
              {formatNumber(post.replies || comments.length)}
            </button>
            <button
              className={`btn btn-link p-0  ${isLiked ? 'text-danger' : 'text-muted'}`}
              onClick={handleLike}
              disabled={!currentUser}
            >
              <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'} me-1`}></i>
              {formatNumber(likeCount)}
            </button>

            {currentUser?.username === post.handle ? (
              <button
                className="btn btn-link text-muted p-0"
                onClick={handleDeletePost}
              >
                <i className="bi bi-trash me-1"></i>
              </button>
            ) : (
              <div style={{ width: '40px' }}></div>
            )}
          </div>

          {/* YORUM FORMU - BU EKSİKTİ! */}
          {currentUser && showCommentForm && !replyingToComment && (
            <div className="mb-3 p-3 bg-dark rounded">
              <form onSubmit={handleSubmit(handleCommentSubmit)}>
                <div className="d-flex">
                  <img
                    src={currentUser.avatar || `https://via.placeholder.com/32x32/1da1f2/ffffff?text=${currentUser?.fullName?.charAt(0) || 'U'}`}
                    alt="Avatar"
                    className="rounded-circle me-2"
                    style={{ width: '32px', height: '32px' }}
                  />
                  <div className="flex-grow-1">
                    <textarea
                      {...register('comment', {
                        required: 'Yorum gereklidir',
                        maxLength: { value: 280, message: 'Maksimum 280 karakter' }
                      })}
                      className="form-control x-form-control border-0 bg-transparent text-white"
                      placeholder="Yorumunuzu yazın..."
                      rows="2"
                      style={{ resize: 'none' }}
                    />
                    {errors.comment && (
                      <div className="text-danger small mt-1">{errors.comment.message}</div>
                    )}

                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <div className="text-muted small">
                        <span>280</span> karakter kaldı
                      </div>
                      <div>
                        <button
                          type="button"
                          className="btn btn-link text-muted me-2"
                          onClick={() => setShowCommentForm(false)}
                        >
                          İptal
                        </button>
                        <button
                          type="submit"
                          className="btn x-btn-primary rounded-pill px-3"
                        >
                          Yorumla
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Yoruma yanıt formu */}
          {currentUser && replyingToComment && (
            <div className="mb-3 p-3 bg-dark rounded">
              <div className="text-muted small mb-2">
                @{comments.find(c => c.id === replyingToComment)?.username} kullanıcısına yanıt veriyorsunuz
              </div>
              <form onSubmit={handleSubmitReply(handleCommentReplySubmit)}>
                <div className="d-flex">
                  <img
                    src={currentUser.avatar || `https://via.placeholder.com/32x32/1da1f2/ffffff?text=${currentUser?.fullName?.charAt(0) || 'U'}`}
                    alt="Avatar"
                    className="rounded-circle me-2"
                    style={{ width: '32px', height: '32px' }}
                  />
                  <div className="flex-grow-1">
                    <textarea
                      {...registerReply('comment', {
                        required: 'Yanıt gereklidir',
                        maxLength: { value: 280, message: 'Maksimum 280 karakter' }
                      })}
                      className="form-control x-form-control border-0 bg-transparent text-white"
                      placeholder="Yanıtınızı yazın..."
                      rows="2"
                      style={{ resize: 'none' }}
                    />
                    {errorsReply.comment && (
                      <div className="text-danger small mt-1">{errorsReply.comment.message}</div>
                    )}

                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <div className="text-muted small">
                        <span>280</span> karakter kaldı
                      </div>
                      <div>
                        <button
                          type="button"
                          className="btn btn-link text-muted me-2"
                          onClick={() => setReplyingToComment(null)}
                        >
                          İptal
                        </button>
                        <button
                          type="submit"
                          className="btn x-btn-primary rounded-pill px-3"
                        >
                          Yanıtla
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Yorumlar */}
          {comments.length > 0 && (
            <div className="border-top border-secondary pt-3">
              <h6 className="text-muted mb-3">Yorumlar ({comments.length})</h6>
              {comments.slice(0, visibleComments).map(comment => (
                <div key={comment.id} className="mb-3">
                  {comment.replyTo && (
                    <div className="text-muted small mb-1">
                      <i className="bi bi-arrow-return-right me-1"></i>
                      @{comment.replyTo} kullanıcısına yanıt
                    </div>
                  )}
                  <div className="d-flex">
                    <img
                      src={comment.avatar}
                      alt="Avatar"
                      className="rounded-circle me-2"
                      style={{ width: '32px', height: '32px' }}
                    />
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center mb-1">
                        <span className="fw-bold text-white me-2">{comment.username}</span>
                        <span className="text-muted">@{comment.handle}</span>
                        <span className="text-muted ms-2">·</span>
                        <span className="text-muted ms-2">{comment.timestamp}</span>
                      </div>
                      <p className="text-white mb-1">{comment.content}</p>
                      <div className="d-flex text-muted small">
                        <button className="btn btn-link text-muted p-0 me-3">
                          <i className="bi bi-heart me-1"></i>
                        </button>
                        <button
                          className="btn btn-link text-muted p-0 me-3"
                          onClick={() => handleReplyToComment(comment.id)}
                        >
                          <i className="bi bi-reply me-1"></i>
                        </button>
                        {currentUser?.username === comment.handle ? (
                          <button
                            className="btn btn-link text-muted p-0"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            <i className="bi bi-trash me-1"></i>
                          </button>
                        ) : (
                          <div style={{ width: '40px' }}></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Load More butonu */}
              {visibleComments < comments.length && (
                <div className="text-center mt-3">
                  <button
                    className="btn btn-link text-primary"
                    onClick={loadMoreComments}
                  >
                    Daha fazla yorum göster ({comments.length - visibleComments} kaldı)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};