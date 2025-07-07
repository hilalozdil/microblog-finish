import React, { use, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

export default function CreatePost({ onPostCreated }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const content = watch('content', '');
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if(!isLoggedIn || !loggedInUser) {
      navigate('/login');
    } else{
      setUser(loggedInUser);
    }
  }, [navigate]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    // denenen API cagrisi
    setTimeout(() => {
      const newPost = {
        id: Date.now(),
        username: user?.fullName || user?.username || 'Anonim',
        handle: user?.username || 'Anonim',
        content: data.content,
        timestamp: 'Şimdi',
        replies: 0,
        retweets: 0,
        likes: 0,
        avatar: `https://via.placeholder.com/48x48/1da1f2/ffffff?text=${user?.fullName?.charAt(0) || 'U'}`
      };
      
      // LocalStorage'a postları kaydet
      const existingPosts = JSON.parse(localStorage.getItem('userPosts') || '[]');
      existingPosts.unshift(newPost);
      localStorage.setItem('userPosts', JSON.stringify(existingPosts));
      
      onPostCreated(newPost);
      reset();
      setIsSubmitting(false);
    }, 1000);
  };

  const remainingChars = 280 - content.length;

  return (
    <div className="x-post">
      <div className="d-flex">
        <img 
          src="https://via.placeholder.com/48x48/1da1f2/ffffff?text=U" 
          alt="Avatar" 
          className="x-avatar me-3"
        />
        <div className="flex-grow-1">
          <form onSubmit={handleSubmit(onSubmit)}>
            <textarea
              {...register('content', { 
                required: 'Post içeriği gereklidir',
                maxLength: { value: 280, message: 'Maksimum 280 karakter' }
              })}
              className="form-control x-form-control border-0 bg-transparent text-white"
              placeholder="Neler oluyor?"
              rows="3"
              style={{ resize: 'none' }}
            />
            {errors.content && (
              <div className="text-danger small mt-1">{errors.content.message}</div>
            )}
            
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div className={`small ${remainingChars < 20 ? 'text-warning' : 'text-muted'}`}>
                <span>{remainingChars}</span> karakter kaldı
              </div>
              <button 
                type="submit" 
                className="btn x-btn-primary rounded-pill px-4"
                disabled={isSubmitting || remainingChars < 0}
              >
                {isSubmitting ? 'Gönderiliyor...' : 'Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

