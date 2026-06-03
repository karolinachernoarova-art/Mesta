import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, Loader2 } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const { signInEmail, signUpEmail } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await signInEmail(email, password);
      } else {
        await signUpEmail(email, password);
      }
      navigate('/profile');
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col font-sans px-6 pt-12">
      <header className="mb-10 flex items-center">
        <button onClick={() => navigate(-1)} className="mr-4 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm text-[#5A5A40]">
          <ChevronLeft className="w-6 h-6" />
        </button>
      </header>

      <div className="max-w-sm w-full mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-serif font-bold text-[#3A3A2F] mb-2">
            {isLogin ? 'С возвращением' : 'Создать аккаунт'}
          </h1>
          <p className="text-[#8E8E8E] text-sm">
            {isLogin ? 'Войдите в свой профиль, чтобы продолжить' : 'Присоединяйтесь для бронирования'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-[#E2E2D1] shadow-sm flex flex-col gap-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm text-center border border-red-100 font-medium">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#8E8E8E] mb-2">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-[#ECECE1] rounded-2xl px-5 py-4 text-sm font-medium text-[#3A3A2F] outline-none focus:ring-2 focus:ring-[#5A5A40]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#8E8E8E] mb-2">Пароль</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-[#ECECE1] rounded-2xl px-5 py-4 text-sm font-medium text-[#3A3A2F] outline-none focus:ring-2 focus:ring-[#5A5A40]"
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <label className="flex items-start gap-3 rounded-2xl bg-[#F9F9F4] border border-[#E2E2D1] p-4 cursor-pointer">
              <input
                type="checkbox"
                checked={consentAccepted}
                onChange={e => setConsentAccepted(e.target.checked)}
                required
                className="mt-1 h-4 w-4 rounded border-[#8E8E8E] accent-[#5A5A40]"
              />
              <span className="text-xs leading-relaxed text-[#5A5A40] font-medium">
                Согласен на обработку email и данных аккаунта для регистрации, входа, хранения профиля и работы бронирований.
              </span>
            </label>
          )}

          {!isLogin && (
            <div className="flex gap-2 text-xs leading-relaxed text-[#8E8E8E] bg-[#F5F5F0] rounded-2xl p-4">
              <Info className="w-4 h-4 shrink-0 text-[#5A5A40] mt-0.5" />
              <p>Согласие нужно, чтобы создать профиль, защищать доступ к нему и связывать ваши бронирования с аккаунтом.</p>
            </div>
          )}

          <button
            type="submit" 
            disabled={loading || (!isLogin && !consentAccepted)}
            className="w-full bg-[#5A5A40] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#5A5A40]/20 mt-4 hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            <span className="inline-flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? 'Проверяем...' : (isLogin ? 'Войти' : 'Создать')}
            </span>
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-[#8E8E8E]">
            {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
            <button 
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); setConsentAccepted(false); }}
              className="ml-2 font-bold text-[#5A5A40] hover:underline"
            >
              {isLogin ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
