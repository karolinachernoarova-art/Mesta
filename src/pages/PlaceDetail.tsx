import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, MapPin, Star, Share, Heart, ImagePlus, X, Trash2, Loader2 } from "lucide-react";
import { useAuth } from '../lib/AuthContext';
import { Place, Review } from "../data/mockData";
import ImageWithFallback from "../components/ImageWithFallback";
import { fetchApi } from '../lib/api';
import { uploadImage } from '../api/uploads';
import { useFeedback } from "../components/FeedbackProvider";
import PageLoader from "../components/PageLoader";

export default function PlaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { showToast, confirm } = useFeedback();
  const [place, setPlace] = useState<Place | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState(0);
  
  // review form
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewImages, setNewReviewImages] = useState<string[]>([]);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !user) return;
    const favs = JSON.parse(localStorage.getItem(`favorites_${user.uid}`) || "[]");
    setIsFavorite(favs.includes(id));
  }, [id, user]);

  const toggleFavorite = () => {
    if (!user) {
      showToast({ type: 'info', title: 'Нужно войти', message: 'Авторизуйтесь, чтобы добавлять места в избранное.' });
      return;
    }
    const key = `favorites_${user.uid}`;
    let favs = JSON.parse(localStorage.getItem(key) || "[]");
    if (isFavorite) {
      favs = favs.filter((fid: string) => fid !== id);
    } else {
      favs.push(id);
    }
    localStorage.setItem(key, JSON.stringify(favs));
    setIsFavorite(!isFavorite);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: place?.name,
          text: place?.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showToast({ type: 'success', title: 'Ссылка скопирована' });
      }
    } catch (e) {
      console.log('Error sharing:', e);
    }
  };

  useEffect(() => {
    if (!id) return;
    
    Promise.all([
      fetchApi(`/places/${id}`),
      fetchApi(`/places/${id}/reviews`)
    ])
    .then(([p, revs]) => {
      setPlace(p);
      setReviews(revs);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);

  const submitReview = async () => {
    if (!user || !id || !newReviewText.trim()) return;
    setReviewSubmitting(true);

    try {
      await fetchApi(`/places/${id}/reviews`, {
        method: 'POST',
        body: JSON.stringify({
          rating: newReviewRating,
          comment: newReviewText,
          images: newReviewImages
        })
      });
      // reload reviews
      const revs = await fetchApi(`/places/${id}/reviews`);
      setReviews(revs);
      
      setNewReviewText("");
      setNewReviewRating(5);
      setNewReviewImages([]);
      showToast({ type: 'success', title: 'Отзыв опубликован', message: 'Спасибо, что помогаете другим гостям выбрать место.' });
    } catch (e) {
      console.error(e);
      const message = e instanceof Error ? e.message : 'Не удалось отправить отзыв';
      showToast({
        type: 'error',
        title: message.includes('модерац') || message.includes('спам') || message.includes('нецензур')
          ? 'Отзыв не прошел модерацию'
          : 'Не удалось отправить отзыв',
        message,
      });
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files);
    
    // limit to 3 images per review to save space
    const remainingSlots = 3 - newReviewImages.length;
    const filesToUpload = files.slice(0, remainingSlots) as File[];
    
    if (filesToUpload.length < files.length) {
      showToast({ type: 'info', title: 'Максимум 3 фото', message: 'Лишние изображения не были добавлены.' });
    }
    
    try {
      setImageUploading(true);
      const urls = await Promise.all(filesToUpload.map(f => uploadImage(f)));
      setNewReviewImages(prev => [...prev, ...urls]);
      showToast({ type: 'success', title: 'Фото добавлены' });
    } catch (err) {
      console.error('Ошибка загрузки фото', err);
      showToast({ type: 'error', title: 'Не удалось загрузить фото', message: err instanceof Error ? err.message : undefined });
    } finally {
      setImageUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteReview = async (reviewId: string, reviewRating: number) => {
    if (!id || !place) return;
    const accepted = await confirm({
      title: 'Удалить отзыв?',
      message: 'Отзыв исчезнет со страницы, а рейтинг места будет пересчитан.',
      confirmText: 'Удалить',
      tone: 'danger',
    });
    if (!accepted) return;

    try {
      setDeletingReviewId(reviewId);
      await fetchApi(`/reviews/${reviewId}`, { method: 'DELETE' });
      const revs = await fetchApi(`/places/${id}/reviews`);
      setReviews(revs);
      showToast({ type: 'success', title: 'Отзыв удален' });
    } catch (e) {
      console.error(e);
      showToast({ type: 'error', title: 'Не удалось удалить отзыв' });
    } finally {
      setDeletingReviewId(null);
    }
  };

  if (loading) return <PageLoader label="Загрузка места" />;
  if (!place) return <div className="p-10 text-center text-[var(--text-muted)]">Место не найдено</div>;

  const allImages = Array.from(new Set((place.images && place.images.length > 0 ? [place.imageUrl, ...place.images] : [place.imageUrl]).filter(Boolean)));
  const showPrevImage = () => setCurrentImageIdx(idx => (idx - 1 + allImages.length) % allImages.length);
  const showNextImage = () => setCurrentImageIdx(idx => (idx + 1) % allImages.length);
  const finishSwipe = () => {
    if (Math.abs(touchDeltaX) > 48) {
      touchDeltaX > 0 ? showPrevImage() : showNextImage();
    }
    setTouchStartX(null);
    setTouchDeltaX(0);
  };

  return (
    <div className="pb-24 bg-[var(--bg-base)] min-h-screen">
      <div
        className="relative aspect-square md:aspect-[21/9] bg-[#1A1A1A] overflow-hidden touch-pan-y select-none"
        onTouchStart={e => {
          if (allImages.length <= 1) return;
          setTouchStartX(e.touches[0].clientX);
          setTouchDeltaX(0);
        }}
        onTouchMove={e => {
          if (touchStartX === null) return;
          setTouchDeltaX(e.touches[0].clientX - touchStartX);
        }}
        onTouchEnd={finishSwipe}
        onMouseDown={e => {
          if (allImages.length <= 1) return;
          setTouchStartX(e.clientX);
          setTouchDeltaX(0);
        }}
        onMouseMove={e => {
          if (touchStartX === null || e.buttons !== 1) return;
          setTouchDeltaX(e.clientX - touchStartX);
        }}
        onMouseUp={finishSwipe}
        onMouseLeave={() => {
          if (touchStartX !== null) finishSwipe();
        }}
      >
        <ImageWithFallback
          src={allImages[currentImageIdx]}
          alt={place.name}
          className="w-full h-full object-cover opacity-90 transition-opacity duration-300 cursor-pointer"
          onClick={() => setFullscreenImage(allImages[currentImageIdx])}
        />
        {allImages.length > 1 && Math.abs(touchDeltaX) > 6 && (
          <div
            className="absolute inset-0 pointer-events-none bg-white/10 transition-transform"
            style={{ transform: `translateX(${Math.max(-80, Math.min(80, touchDeltaX))}px)` }}
          />
        )}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start bg-gradient-to-b from-[#3A3A2F]/60 to-transparent pointer-events-none">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[var(--brand-primary)] shadow-sm hover:scale-105 transition-transform pointer-events-auto"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex space-x-3 pointer-events-auto">
            <button onClick={handleShare} className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[var(--brand-primary)] shadow-sm hover:scale-105 transition-transform">
              <Share className="w-5 h-5" />
            </button>
            <button onClick={toggleFavorite} className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[var(--brand-primary)] shadow-sm hover:scale-105 transition-transform">
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-[#5A5A40]" : ""}`} />
            </button>
          </div>
        </div>
        {allImages.length > 1 && (
          <>
            <button onClick={showPrevImage} className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 text-[#5A5A40] items-center justify-center shadow-sm">‹</button>
            <button onClick={showNextImage} className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 text-[#5A5A40] items-center justify-center shadow-sm">›</button>
            <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-2 z-20">
              {allImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIdx(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIdx ? 'bg-white w-4' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="px-6 pt-8 pb-8 bg-[var(--bg-surface)] border-b border-[var(--border-main)] rounded-b-3xl shadow-sm relative -mt-6">
        <div className="flex flex-col items-start mb-6">
          <div className="bg-[var(--bg-accent)] px-3 py-1 rounded-lg text-xs font-bold text-[var(--brand-primary)] mb-3 uppercase tracking-wider">
            {place.type === 'отель' ? 'Отель' : 'Ресторан'}
          </div>
          <h1 className="text-3xl font-serif font-bold text-[var(--text-main)] leading-tight mb-2">{place.name}</h1>
          <div className="flex items-center text-[var(--text-muted)] text-sm">
            <MapPin className="w-4 h-4 mr-1.5" />
            {place.address}
          </div>
        </div>

        <div className="flex items-center gap-1 text-[#C4A484] mb-6">
          {[...Array(Math.floor(place.rating || 0))].map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-current" />
          ))}
          {(place.rating || 0) % 1 !== 0 && <Star className="w-5 h-5 fill-current opacity-50" />}
          <span className="text-sm text-[#8E8E8E] ml-2 font-medium">({place.reviewCount || 0} отзывов)</span>
        </div>

        <p className="text-[#3A3A2F] text-sm leading-relaxed mb-8">
          {place.description}
        </p>

        <div className="mt-10">
          <h2 className="text-lg font-bold text-[#3A3A2F] mb-6 uppercase tracking-widest text-[#8E8E8E]">Отзывы</h2>
          
          {user ? (
            <div className="bg-[#ECECE1]/50 p-4 rounded-xl border border-[#E2E2D1] mb-6">
               <h3 className="font-bold text-sm text-[#3A3A2F] mb-2">Оставить отзыв</h3>
               <div className="flex text-[#C4A484] mb-3 cursor-pointer">
                  {[1,2,3,4,5].map(star => (
                    <Star key={star} onClick={() => setNewReviewRating(star)} className={`w-6 h-6 transition-all ${star <= newReviewRating ? 'fill-current' : 'fill-transparent text-[#8E8E8E] opacity-40'}`} />
                  ))}
               </div>
               <textarea value={newReviewText} onChange={e => setNewReviewText(e.target.value)} placeholder="Напишите ваш отзыв..." className="w-full bg-white rounded-lg p-3 text-sm font-medium text-[#3A3A2F] outline-none border border-[#E2E2D1] focus:border-[#5A5A40] mb-3 rows-3 resize-none"></textarea>
               
               {newReviewImages.length > 0 && (
                 <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                   {newReviewImages.map((img, idx) => (
                     <div key={idx} className="relative w-16 h-16 flex-shrink-0">
                        <img src={img} alt="upload preview" className="w-full h-full object-cover rounded-lg border border-[#E2E2D1]" />
                        <button onClick={() => setNewReviewImages(prev => prev.filter((_, i) => i !== idx))} className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                     </div>
                   ))}
                 </div>
               )}

               <div className="flex items-center gap-3">
                 <label
                   htmlFor="reviewImageUpload"
                   aria-disabled={imageUploading || newReviewImages.length >= 3}
                   className={`flex items-center justify-center w-10 h-10 border-2 border-dashed border-[#5A5A40]/30 text-[#5A5A40] rounded-lg hover:bg-[#5A5A40]/5 transition-colors cursor-pointer ${(imageUploading || newReviewImages.length >= 3) ? 'opacity-50 cursor-not-allowed' : ''}`}
                   title="Добавить фото"
                 >
                   {imageUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
                 </label>
                 <input id="reviewImageUpload" type="file" className="absolute h-px w-px overflow-hidden opacity-0" accept="image/*,.heic,.heif,.avif" multiple disabled={imageUploading || newReviewImages.length >= 3} onChange={handleImageUpload} />
                 
                 <button
                   onClick={submitReview}
                   disabled={reviewSubmitting || !newReviewText.trim()}
                   className="px-4 py-2 h-10 bg-[#5A5A40] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2 active:scale-[0.98]"
                 >
                   {reviewSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                   {reviewSubmitting ? 'Проверяем...' : 'Отправить'}
                 </button>
               </div>
            </div>
          ) : (
             <div className="bg-[#ECECE1]/50 p-4 rounded-xl border border-[#E2E2D1] mb-6 text-sm text-[#8E8E8E]">
                Войдите в профиль, чтобы оставить отзыв.
             </div>
          )}

          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-[#F9F9F4] p-5 rounded-2xl border border-[#E2E2D1] relative">
                {user && (user.uid === review.userId || isAdmin) && (
                  <button disabled={deletingReviewId === String(review.id)} onClick={() => handleDeleteReview(review.id, review.rating)} className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors disabled:opacity-50">
                    {deletingReviewId === String(review.id) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                )}
                <div className="flex justify-between items-start mb-3 pr-6">
                  <span className="font-bold text-sm text-[#3A3A2F]">{review.userName}</span>
                  <div className="flex text-[#C4A484]">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-[#3A3A2F] leading-relaxed mb-3">{review.comment}</p>
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {review.images.map((img, i) => (
                      <img key={i} src={img} alt="review" onClick={() => setFullscreenImage(img)} className="w-20 h-20 object-cover rounded-lg flex-shrink-0 cursor-pointer" />
                    ))}
                  </div>
                )}
                <div className="text-xs text-[#8E8E8E] mt-1 font-medium">
                   {((review as any).createdAt || (review as any).date) ? new Date((review as any).createdAt || (review as any).date).toLocaleDateString('ru-RU') : ''}
                </div>
              </div>
            ))}
            {reviews.length === 0 && <p className="text-sm text-[#8E8E8E]">Пока нет отзывов.</p>}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-6 pt-4 pb-[calc(env(safe-area-inset-bottom,0px)+28px)] bg-white/90 backdrop-blur-md border-t border-[#E2E2D1] z-40">
        <Link
          to={`/book/${place.id}`}
          className="w-full bg-[#5A5A40] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#5A5A40]/20 flex items-center justify-center hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          {place.type === "отель" ? "Выбрать номер и забронировать" : "Забронировать столик"}
        </Link>
      </div>

      {fullscreenImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setFullscreenImage(null)}>
          <button className="absolute top-6 right-6 text-white bg-black/50 rounded-full p-2 hover:bg-black/80 transition-colors">
            <X className="w-6 h-6" />
          </button>
          <img src={fullscreenImage} alt="fullscreen" className="max-w-full max-h-full object-contain rounded-lg" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
