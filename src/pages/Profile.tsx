import React, { useState, useEffect } from "react";
import { User as UserIcon, Settings, Info, LogOut, ShieldCheck, ChevronLeft, Phone, Heart, MapPin, Star, BarChart3 } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import { Place } from '../data/mockData';
import ImageWithFallback from '../components/ImageWithFallback';
import { fetchApi } from '../lib/api';
import { uploadImage } from '../api/uploads';
import { useFeedback } from "../components/FeedbackProvider";

export default function Profile() {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useFeedback();

  const [view, setView] = useState<'profile' | 'settings' | 'help' | 'favorites'>('profile');

  // Load / Save Settings
  const [contactName, setContactName] = useState(() => localStorage.getItem("contactName") || "");
  const [contactPhone, setContactPhone] = useState(() => localStorage.getItem("contactPhone") || "");
  const [personalDataAccepted, setPersonalDataAccepted] = useState(() => localStorage.getItem("personalDataAccepted") === "true");
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [favoritePlaces, setFavoritePlaces] = useState<Place[]>([]);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setCustomAvatar(user.photoUrl || null);
    }
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.length) return;
    try {
      const url = await uploadImage(e.target.files[0]);
      await fetchApi('/auth/me', {
         method: 'PUT',
         body: JSON.stringify({ photoUrl: url })
      });
      setCustomAvatar(url);
      showToast({ type: 'success', title: 'Фото профиля обновлено' });
    } catch(err) {
      console.error(err);
      showToast({ type: 'error', title: 'Не удалось загрузить фото', message: err instanceof Error ? err.message : undefined });
    } finally {
      e.target.value = '';
    }
  };

  useEffect(() => {
    localStorage.setItem("contactName", contactName);
  }, [contactName]);

  useEffect(() => {
    localStorage.setItem("contactPhone", contactPhone);
  }, [contactPhone]);

  useEffect(() => {
    localStorage.setItem("personalDataAccepted", personalDataAccepted ? "true" : "false");
  }, [personalDataAccepted]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (view === 'favorites' && user) {
      const loadFavorites = async () => {
        const favs = JSON.parse(localStorage.getItem(`favorites_${user.id}`) || "[]");
        if (favs.length === 0) {
           setFavoritePlaces([]);
           return;
        }
        
        try {
           const allPlaces = await fetchApi('/places');
           const loaded = allPlaces.filter((p: Place) => favs.includes(p.id));
           setFavoritePlaces(loaded);
        } catch (e) {
           console.error(e);
        }
      };
      loadFavorites();
    }
  }, [view, user]);

  if (view === 'favorites') {
    return (
      <div className="pb-24 pt-8 px-6 max-w-2xl mx-auto space-y-6 animate-in slide-in-from-right-8 fade-in h-screen">
        <header className="flex items-center mb-8">
          <button onClick={() => setView('profile')} className="w-10 h-10 bg-[var(--bg-surface)] rounded-full flex items-center justify-center border border-[var(--border-main)] shadow-sm hover:scale-105 transition-transform mr-4">
            <ChevronLeft className="w-5 h-5 text-[var(--text-main)]" />
          </button>
          <h1 className="text-2xl font-serif font-bold tracking-tight text-[var(--text-main)]">
            Избранное
          </h1>
        </header>

        {favoritePlaces.length === 0 ? (
          <div className="text-center p-10 bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-main)] shadow-sm">
             <p className="text-[var(--text-muted)]">У вас пока нет избранных мест.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {favoritePlaces.map(place => (
               <Link key={place.id} to={`/place/${place.id}`} className="flex flex-col sm:flex-row bg-[var(--bg-surface)] p-4 rounded-3xl border border-[var(--border-main)] shadow-sm hover:shadow-md transition-shadow">
                 <div className="w-full sm:w-24 h-40 sm:h-24 bg-[var(--bg-subtle)] rounded-2xl mb-4 sm:mb-0 sm:mr-4 overflow-hidden relative">
                   <ImageWithFallback src={place.imageUrl || (place.images?.[0])} alt={place.name} className="w-full h-full object-cover" />
                 </div>
                 <div className="flex-1 flex flex-col justify-center">
                   <h3 className="font-bold text-lg text-[var(--text-main)] mb-1">{place.name}</h3>
                   <div className="flex items-center text-xs text-[var(--text-muted)] mb-3">
                      <MapPin className="w-3.5 h-3.5 mr-1" />
                      {place.address}
                   </div>
                   <div className="flex items-center gap-1 text-[var(--brand-primary)]">
                     <Star className="w-4 h-4 fill-current"/>
                     <span className="text-sm font-bold text-[var(--text-main)] ml-1">{place.rating?.toFixed(1) || '0.0'}</span>
                   </div>
                 </div>
               </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (view === 'settings') {
    return (
      <div className="pb-24 pt-8 px-6 max-w-2xl mx-auto space-y-6 animate-in slide-in-from-right-8 fade-in min-h-screen">
        <header className="flex items-center mb-8">
          <button onClick={() => setView('profile')} className="w-10 h-10 bg-[var(--bg-surface)] rounded-full flex items-center justify-center border border-[var(--border-main)] shadow-sm hover:scale-105 transition-transform mr-4">
            <ChevronLeft className="w-5 h-5 text-[var(--text-main)]" />
          </button>
          <h1 className="text-2xl font-serif font-bold tracking-tight text-[var(--text-main)]">
            Настройки
          </h1>
        </header>

        <section className="bg-[var(--bg-surface)] rounded-3xl p-6 border border-[var(--border-main)] shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Контактные данные</h2>
          
          {user && (
            <div className="flex items-center space-x-4 mb-4">
              <img src={customAvatar || `https://ui-avatars.com/api/?name=${user.email}`} className="w-16 h-16 rounded-full shadow-sm border border-[var(--border-main)]" alt="Avatar"/>
              <div>
                <label
                  htmlFor="avatarUpload"
                  aria-disabled={!personalDataAccepted}
                  className={cn(
                    "relative inline-block text-sm font-bold text-[var(--brand-primary)] hover:underline cursor-pointer",
                    !personalDataAccepted && "text-[var(--text-muted)] no-underline cursor-not-allowed"
                  )}
                >
                  Изменить фото
                </label>
                <input
                  id="avatarUpload"
                  type="file"
                  className="absolute h-px w-px overflow-hidden opacity-0"
                  accept="image/*,.heic,.heif,.avif"
                  disabled={!personalDataAccepted}
                  onChange={handleAvatarUpload}
                />
                {!personalDataAccepted && (
                  <p className="mt-1 text-xs text-[var(--text-muted)]">Сначала отметьте согласие ниже.</p>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--text-main)] mb-1">Имя</label>
            <div className="flex bg-[var(--bg-accent)] rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-[var(--brand-primary)] transition-colors">
              <UserIcon className="w-5 h-5 text-[var(--text-muted)] mr-3" />
              <input disabled={!personalDataAccepted} value={contactName} onChange={e => setContactName(e.target.value)} type="text" placeholder="Ваше имя" className="w-full bg-transparent outline-none font-medium text-[var(--text-main)] disabled:opacity-60" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--text-main)] mb-1">Телефон</label>
            <div className="flex bg-[var(--bg-accent)] rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-[var(--brand-primary)] transition-colors">
              <Phone className="w-5 h-5 text-[var(--text-muted)] mr-3" />
              <input disabled={!personalDataAccepted} value={contactPhone} onChange={e => setContactPhone(e.target.value)} type="tel" placeholder="+7 (999) 000-00-00" className="w-full bg-transparent outline-none font-medium text-[var(--text-main)] disabled:opacity-60" />
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-2">Рекомендуется указывать для связи с администраторами заведений.</p>
          </div>

          <label className="flex items-start gap-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-main)] p-4 cursor-pointer">
            <input
              type="checkbox"
              checked={personalDataAccepted}
              onChange={e => setPersonalDataAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-[var(--text-muted)] accent-[var(--brand-primary)]"
            />
            <span className="text-xs leading-relaxed text-[var(--text-muted)] font-medium">
              Согласен на обработку имени, телефона и фотографии профиля для работы аккаунта, бронирований и связи по заявкам.
            </span>
          </label>
        </section>

        <section className="bg-[var(--bg-surface)] rounded-3xl p-6 border border-[var(--border-main)] shadow-sm flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)]">Тёмная тема</h2>
            <button 
              onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} 
              className={cn("w-14 h-8 rounded-full transition-colors flex items-center px-1", theme === 'dark' ? "bg-[var(--brand-primary)]" : "bg-[var(--border-main)]")}
            >
              <div className={cn("w-6 h-6 bg-[var(--bg-surface)] rounded-full shadow-sm transform transition-transform", theme === 'dark' ? "translate-x-6" : "")} />
            </button>
        </section>
      </div>
    );
  }

  if (view === 'help') {
    return (
      <div className="pb-24 pt-8 px-6 max-w-2xl mx-auto space-y-6 animate-in slide-in-from-right-8 fade-in min-h-screen">
         <header className="flex items-center mb-8">
          <button onClick={() => setView('profile')} className="w-10 h-10 bg-[var(--bg-surface)] rounded-full flex items-center justify-center border border-[var(--border-main)] shadow-sm hover:scale-105 transition-transform mr-4">
            <ChevronLeft className="w-5 h-5 text-[var(--text-main)]" />
          </button>
          <h1 className="text-2xl font-serif font-bold tracking-tight text-[var(--text-main)]">
            Помощь
          </h1>
        </header>

        <section className="bg-[var(--bg-surface)] rounded-3xl p-6 border border-[var(--border-main)] shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">Как забронировать?</h2>
          <ul className="space-y-4 text-sm text-[var(--text-main)] leading-relaxed font-medium">
            <li>Откройте каталог или карту и выберите подходящее место.</li>
            <li>Нажмите «Забронировать» на странице места.</li>
            <li>Укажите необходимые детали: дату, количество человек, а также выберите подходящий номер или столик.</li>
            <li>Подтвердите данные и проверьте список ваших бронирований в разделе «Мои брони».</li>
          </ul>
        </section>

        <section className="bg-[var(--bg-surface)] rounded-3xl p-6 border border-[var(--border-main)] shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">Согласие на данные</h2>
          <p className="text-sm text-[var(--text-main)] leading-relaxed font-medium">
            При регистрации вы соглашаетесь на обработку email и данных аккаунта, чтобы входить в профиль и видеть свои бронирования. При указании имени, телефона или фото вы разрешаете использовать их для оформления брони, связи по заявке и отображения в личном кабинете.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-8 px-6 max-w-2xl mx-auto space-y-8 animate-in fade-in min-h-screen">
      <header>
        <h1 className="text-3xl font-serif font-bold tracking-tight text-[var(--text-main)]">
          Профиль
        </h1>
      </header>

      {user ? (
        <div className="bg-[var(--bg-surface)] rounded-3xl p-8 flex flex-col items-center border border-[var(--border-main)] shadow-sm relative overflow-hidden">
          {isAdmin && (
            <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1" /> Админ
            </div>
          )}
          <img src={customAvatar || user.photoUrl || `https://ui-avatars.com/api/?name=${user.email}`} className="w-24 h-24 rounded-full shadow-md border-4 border-[var(--bg-surface)] mb-4" alt="Avatar"/>
          <h2 className="text-2xl font-serif font-bold text-[var(--text-main)]">{contactName || user.email?.split('@')[0] || "Пользователь"}</h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">{user.email}</p>
          <button onClick={() => setView('settings')} className="mt-6 px-8 py-3 bg-[var(--bg-base)] font-bold text-sm uppercase tracking-wider rounded-full text-[var(--brand-primary)] hover:opacity-80 transition-opacity border border-[var(--border-main)]">
            Редактировать
          </button>
        </div>
      ) : (
        <div className="bg-[var(--bg-surface)] rounded-3xl p-8 flex flex-col items-center border border-[var(--border-main)] shadow-sm">
          <div className="w-24 h-24 bg-[var(--brand-primary)] rounded-3xl rotate-3 shadow-lg flex items-center justify-center text-[var(--bg-surface)] mb-6">
            <div className="-rotate-3">
               <UserIcon className="w-10 h-10" />
            </div>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[var(--text-main)]">Гость</h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">Войдите для бронирования</p>
          <button onClick={() => navigate('/auth')} className="mt-6 px-8 py-3 bg-[var(--brand-primary)] text-[var(--bg-surface)] font-bold text-sm uppercase tracking-wider rounded-full shadow-lg hover:scale-[1.02] transition-transform">
            Войти в систему
          </button>
        </div>
      )}

      <div className="bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-main)] shadow-sm overflow-hidden flex flex-col">
        {user && (
          <button onClick={() => setView('favorites')} className="w-full px-6 py-6 flex items-center justify-between border-b border-[var(--bg-base)] hover:bg-[var(--bg-subtle)] transition-colors group">
              <div className="flex items-center text-[var(--text-main)] font-bold"><Heart className="w-6 h-6 mr-4 text-[var(--brand-primary)] group-hover:scale-110 transition-transform"/> Избранное</div>
          </button>
        )}
        {isAdmin && (
          <Link to="/admin" className="w-full px-6 py-6 flex items-center justify-between border-b border-[var(--bg-base)] hover:bg-[var(--bg-subtle)] transition-colors group">
              <div className="flex items-center text-[var(--text-main)] font-bold"><ShieldCheck className="w-6 h-6 mr-4 text-[var(--brand-primary)] group-hover:scale-110 transition-transform"/> Админ панель</div>
          </Link>
        )}
        {user && !isAdmin && (
          <Link to="/owner-analytics" className="w-full px-6 py-6 flex items-center justify-between border-b border-[var(--bg-base)] hover:bg-[var(--bg-subtle)] transition-colors group">
              <div className="flex items-center text-[var(--text-main)] font-bold"><BarChart3 className="w-6 h-6 mr-4 text-[var(--brand-primary)] group-hover:scale-110 transition-transform"/> Аналитика заведения</div>
          </Link>
        )}
        <button onClick={() => setView('settings')} className="w-full px-6 py-6 flex items-center justify-between border-b border-[var(--bg-base)] hover:bg-[var(--bg-subtle)] transition-colors group">
            <div className="flex items-center text-[var(--text-main)] font-bold"><Settings className="w-6 h-6 mr-4 text-[var(--brand-primary)] group-hover:scale-110 transition-transform"/> Настройки</div>
        </button>
        <button onClick={() => setView('help')} className="w-full px-6 py-6 flex items-center justify-between border-b border-[var(--bg-base)] hover:bg-[var(--bg-subtle)] transition-colors group">
            <div className="flex items-center text-[var(--text-main)] font-bold"><Info className="w-6 h-6 mr-4 text-[var(--brand-primary)] group-hover:scale-110 transition-transform"/> Помощь</div>
        </button>
        {user && (
          <button onClick={signOut} className="w-full px-6 py-6 flex items-center justify-between hover:opacity-80 transition-colors text-red-500 group">
              <div className="flex items-center font-bold"><LogOut className="w-6 h-6 mr-4 group-hover:-translate-x-1 transition-transform"/> Выйти</div>
          </button>
        )}
      </div>
    </div>
  );
}
