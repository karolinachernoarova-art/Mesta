import { useState, useEffect } from "react";
import { Coffee, Bed, Calendar, Users, XCircle, MapPin } from "lucide-react";
import { useAuth } from '../lib/AuthContext';
import { useNavigate } from "react-router-dom";
import { bookingsApi } from '../api/bookings';
import { Booking } from '../api/types';
import PageLoader from "../components/PageLoader";
import { useFeedback } from "../components/FeedbackProvider";

export default function BookingsList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { confirm, showToast } = useFeedback();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setBookings([]);
      setLoading(false);
      return;
    }

    bookingsApi.list()
      .then(res => {
        setBookings(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [user]);

  const handleCancel = async (bookingId: number) => {
    const accepted = await confirm({
      title: 'Отменить бронирование?',
      message: 'Статус бронирования изменится на отмененное.',
      confirmText: 'Отменить',
      tone: 'danger',
    });
    if (!accepted) return;
    try {
      await bookingsApi.update(bookingId, { status: 'cancelled' });
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
      showToast({ type: 'success', title: 'Бронирование отменено' });
    } catch (err: any) {
      console.error(err);
      showToast({ type: 'error', title: 'Не удалось отменить бронирование' });
    }
  }

  if (!user) {
     return (
       <div className="pb-24 pt-8 px-6 max-w-2xl mx-auto space-y-8 min-h-screen">
          <header>
            <h1 className="text-3xl font-serif font-bold tracking-tight text-[#3A3A2F]">
              Бронирования
            </h1>
          </header>
          <div className="text-center p-10 bg-white rounded-3xl border border-[#E2E2D1] shadow-sm">
             <p className="text-[#8E8E8E] mb-6">Войдите, чтобы просматривать свои бронирования</p>
             <button onClick={() => navigate('/auth')} className="px-6 py-3 bg-[#5A5A40] text-white font-bold rounded-xl">Войти</button>
          </div>
       </div>
     )
  }

  return (
    <div className="pb-24 pt-8 px-6 max-w-2xl mx-auto space-y-8 min-h-screen">
      <header>
        <h1 className="text-3xl font-serif font-bold tracking-tight text-[#3A3A2F]">
          Мои бронирования
        </h1>
      </header>

      {loading ? (
        <PageLoader label="Загрузка бронирований" />
      ) : bookings.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-[#E2E2D1] shadow-sm text-center">
          <p className="text-[#8E8E8E] font-medium">У вас пока нет активных бронирований</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const dateStr = booking.date ? booking.date.split(' ')[0] : '';
            const bDate = new Date(dateStr);
            const isValidDate = !isNaN(bDate.getTime());
            const month = isValidDate ? bDate.toLocaleString('ru-RU', { month: 'short' }) : '-';
            const day = isValidDate ? bDate.getDate() : '-';

            return (
            <div key={booking.id} className={`flex flex-col sm:flex-row bg-white p-5 rounded-3xl border shadow-sm transition-shadow relative overflow-hidden ${booking.status === 'cancelled' ? 'border-red-200 opacity-60' : 'border-[#E2E2D1] hover:shadow-md'}`}>
               <div className="w-full sm:w-20 h-16 sm:h-20 bg-[#F9F9F4] border border-[#E2E2D1] rounded-2xl flex flex-row sm:flex-col items-center justify-center text-[#5A5A40] mb-4 sm:mb-0 sm:mr-5">
                 <span className="text-xs sm:text-[10px] font-bold uppercase tracking-widest text-[#8E8E8E] mr-2 sm:mr-0">{month}</span>
                 <span className="text-xl sm:text-2xl font-serif font-bold sm:mt-1">{day}</span>
               </div>
               <div className="flex-1 flex flex-col justify-center">
                 <div className="flex justify-between items-start mb-1">
                     <h3 className="font-bold text-lg text-[#3A3A2F]">{booking.placeName}</h3>
                     <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${booking.status === 'cancelled' ? 'text-red-500 bg-red-50' : 'text-[#5A5A40] bg-[#5A5A40]/10'}`}>
                       {booking.status === 'cancelled' ? 'Отменено' : 'Подтверждено'}
                     </span>
                 </div>
                 <div className="flex flex-col gap-1 mb-3">
                   <div className="flex items-center text-xs text-[#8E8E8E]">
                       <MapPin className="w-3.5 h-3.5 mr-1 shrink-0" />
                       <span className="truncate">{booking.placeAddress}</span>
                   </div>
                   <div className="flex items-center text-xs text-[#3A3A2F] font-bold">
                       <Calendar className="w-3.5 h-3.5 mr-1 shrink-0 text-[#8E8E8E]" />
                       {booking.date}
                   </div>
                 </div>
                 <div className="flex items-center justify-between">
                     <p className="text-sm font-medium text-[#5A5A40]">{booking.resourceName} • {booking.guests} {booking.placeType === 'отель' ? 'Гостя' : 'Мест'}</p>
                     
                     {booking.status === 'confirmed' && (
                        <button onClick={() => handleCancel(booking.id)} className="text-xs font-bold uppercase disabled:opacity-50 tracking-wider text-[#8E8E8E] hover:text-red-500 transition-colors flex items-center">
                          <XCircle className="w-4 h-4 mr-1 flex-shrink-0" /> Отменить
                        </button>
                     )}
                 </div>
               </div>
            </div>
          )})}
        </div>
      )}
    </div>
  );
}
