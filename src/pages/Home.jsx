import React, { useState, useEffect } from 'react';
import CreatePost from '../components/CreatePost';
import Post from '../components/Post';

export default function Home() {
  const [posts, setPosts] = useState([]);

  // Post verilerini yükle
  useEffect(() => {
    // LocalStorage'dan kullanıcı postlarını yükle
    const userPosts = JSON.parse(localStorage.getItem('userPosts') || '[]');

    const samplePosts = [
      {
        id: 1,
        username: 'Elon Musk',
        handle: 'elonmusk',
        content: 'Nihat hoca harika bir eğitmen 🚀',
        timestamp: '2 saat önce',
        replies: 124,
        retweets: 1.2,
        likes: 5.4,
        avatar: 'https://via.placeholder.com/48x48/1da1f2/ffffff?text=E'
      },
      {
        id: 2,
        username: 'React Dev',
        handle: 'reactdev',
        content: 'React çok eğlenceli! #React #JavaScript',
        timestamp: '4 saat önce',
        replies: 23,
        retweets: 45,
        likes: 156,
        avatar: 'https://via.placeholder.com/48x48/61dafb/ffffff?text=R'
      },
      {
        id: 3,
        username: 'Web Developer',
        handle: 'webdev',
        content: 'Hello world! 💻',
        timestamp: '6 saat önce',
        replies: 8,
        retweets: 12,
        likes: 89,
        avatar: 'https://via.placeholder.com/48x48/7952b3/ffffff?text=W'
      }
    ];

    // Kullanıcı postlarını örnek postlarla birleştir
    const allPosts = [...userPosts, ...samplePosts];
    setPosts(allPosts);
  }, []);

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handleCommentAdded = (postId, commentCount) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, replies: commentCount }
        : post
    ));
  };

  const handleLikeUpdated = (postId, newLikeCount) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, likes: newLikeCount }
        : post
    ));
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));

    // LocalStorage'dan da sil
    const userPosts = JSON.parse(localStorage.getItem('userPosts') || '[]');
    const updatedPosts = userPosts.filter(post => post.id !== postId);
    localStorage.setItem('userPosts', JSON.stringify(updatedPosts));

    // Post ile ilgili yorumları da sil
    localStorage.removeItem(`comments_${postId}`);
    localStorage.removeItem(`likes_${postId}`);
  };

  return (
    <div className="x-container">
      <div className="border-bottom border-secondary">
        <h2 className="text-white p-3 mb-0">Ana Sayfa</h2>
      </div>

      <CreatePost onPostCreated={handlePostCreated} />

      <div className="border-top border-secondary">
        {posts.map(post => (
          <Post
            key={post.id}
            post={post}
            onCommentAdded={handleCommentAdded}
            onLikeUpdated={handleLikeUpdated}
            onPostDeleted={handlePostDeleted}
          />
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center text-muted py-5">
          <p>Henüz post yok. İlk postunu paylaş!</p>
        </div>
      )}
    </div>
  );
};

