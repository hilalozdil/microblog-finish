import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import '../Login.css';


export default function Login() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setLoginError('');

    // Kayıtlı kullanıcıları getir
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    setTimeout(() => {
      const user = users.find(u => u.email === data.email && u.password === data.password);

      if (user) {
        // Başarılı login
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/');
      } else {
        setLoginError('Email veya şifre hatalı');
      }
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="login-container">
      <div className="card">
        <div>
          <h2>★</h2>
          <h2>Hesabına giriş yap</h2>
        </div>
     

      <div className="card-body">
        {loginError && (
          <div className="alert alert-danger" role="alert">
            {loginError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
          <div >
            <label htmlFor="email" className="form-label text-white">
              Email
            </label>
            <input
              type="email"
              id="email"
              {...register('email', {
                required: 'Email gereklidir',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Geçerli bir email adresi girin'
                }
              })}
              className="form-control x-form-control"
              placeholder="Email adresinizi girin"
            />
            {errors.email && (
              <div className="text-danger">{errors.email.message}</div>
            )}
          </div>

          <div>
            <label htmlFor="password" className="form-label text-white">
              Şifre
            </label>
            <input
              type="password"
              id="password"
              {...register('password', {
                required: 'Şifre gereklidir',
                minLength: { value: 6, message: 'Şifre en az 6 karakter olmalıdır' }
              })}
              className="form-control x-form-control"
              placeholder="Şifrenizi girin"
            />
            {errors.password && (
              <div className="text-danger">{errors.password.message}</div>
            )}
          </div>

          <div className="form-check">
            <input
              type="checkbox"
              id="rememberMe"
              className="form-check-input"
              {...register('rememberMe')}
            />
            <label className="form-check-label text-white" htmlFor="rememberMe">
              Beni hatırla
            </label>
          </div>

          <button
            type="submit"
            className="x-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div>
          <Link to="/register" className="register-link">
            <span className="text-check">Hesabın yok mu? </span>
            <span className="text-primary">Kayıt ol</span>
          </Link>
        </div>

        {/* <div className="text-center">
          <Link to="/register" className="text-decoration-none">
            <span className="text-white">Hesabın yok mu? </span>
            <span className="text-primary">Kayıt ol</span>
          </Link>
        </div> */}


      </div>
    </div>
 </div>
  );
};

