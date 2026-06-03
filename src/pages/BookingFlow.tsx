import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Room, Table, Place } from "../data/mockData";
import { ChevronLeft, Users, Calendar, CheckCircle2, Info, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";
import { fetchApi } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import PageLoader from "../components/PageLoader";
import { useFeedback } from "../components/FeedbackProvider";

export default function BookingFlow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useFeedback();
  
  const [place, setPlace] = useState<Place | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState<"date" | "selection" | "details" | "success">("date");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  // Booking details
  const [bookingDate, setBookingDate] = useState("");
  const [checkoutDate, setCheckoutDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingGuests, setBookingGuests] = useState(1);
  const [contactName, setContactName] = useState(() => localStorage.getItem("contactName") || "");
  const [contactPhone, setContactPhone] = useState(() => localStorage.getItem("contactPhone") || "");
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [personalDataAccepted, setPersonalDataAccepted] = useState(() => localStorage.getItem("personalDataAccepted") === "true");

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
    if (!id) return;
    
    Promise.all([
      fetchApi(`/places/${id}`),
      fetchApi(`/places/${id}/resources`)
    ])
    .then(([p, res]) => {
      setPlace(p);
      if (res.rooms) setRooms(res.rooms);
      if (res.tables) setTables(res.tables);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <PageLoader label="Загрузка бронирования" />;
  if (!place) return <div className="p-10 text-center text-[#8E8E8E]">Место не найдено</div>;

  const handleNextStep = () => {
    if (step === "date") {
      setStep("selection");
    } else if (step === "selection") {
      if (!user) {
          navigate("/auth");
          return;
      }
      setStep("details");
    }
  };

  const handleBack = () => {
    if (step === "selection") setStep("date");
    else if (step === "details") setStep("selection");
    else navigate(-1);
  };

  const handleBook = async () => {
    if (!user || !id) return;
    try {
      setBookingSubmitting(true);
      const resourceData = place.type === 'отель' ? selectedRoom : selectedTable;
      if (!resourceData) return;

      await fetchApi('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          placeId: id,
          placeName: place.name,
          placeType: place.type,
          placeAddress: place.address,
          resourceId: resourceData.id,
          resourceName: place.type === 'отель' ? (resourceData as Room).name : `Столик ${(resourceData as Table).number}`,
          date: place.type === 'отель' ? `${bookingDate} - ${checkoutDate}` : `${bookingDate} в ${bookingTime}`,
          contactName,
          contactPhone,
          guests: bookingGuests
        })
      });
      setStep("success");
    } catch (e) {
      console.error(e);
      showToast({ type: 'error', title: 'Не удалось создать бронь', message: e instanceof Error ? e.message : undefined });
    } finally {
      setBookingSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F5F5F0] min-h-screen pb-safe font-sans flex flex-col">
      <header className="bg-white px-6 py-4 flex items-center border-b border-[#E2E2D1] shadow-sm sticky top-0 z-20 shrink-0">
        {step !== "success" && (
          <button onClick={handleBack} className="mr-4 text-[#5A5A40] hover:bg-[#F5F5F0] p-1 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        <h1 className="text-xl font-serif font-bold text-[#3A3A2F] flex-1">
          {step === "date" ? "Дата и гости" :
           step === "selection" ? (place.type === "отель" ? "Выбрать номер" : "Выбрать столик") : 
           step === "details" ? "Подтверждение" : "Успешно"}
        </h1>
      </header>

      <main className="p-4 w-full max-w-2xl mx-auto flex-col flex flex-1">
        {step === "date" && (
          <div className="bg-white p-6 rounded-3xl border border-[#E2E2D1] shadow-sm space-y-6 m-4 mt-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-serif font-bold text-[#3A3A2F]">Когда планируете визит?</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#8E8E8E] mb-2">{place?.type === 'отель' ? 'Дата заезда' : 'Дата визита'}</label>
                <div className="flex bg-[#ECECE1] rounded-2xl px-5 py-4 transition-colors focus-within:ring-2 focus-within:ring-[#5A5A40]">
                  <Calendar className="w-5 h-5 text-[#5A5A40] mr-3" />
                  <input 
                    type="date" 
                    value={bookingDate} 
                    onChange={e => {
                        setBookingDate(e.target.value);
                        if (place?.type === 'отель' && checkoutDate && e.target.value > checkoutDate) {
                            setCheckoutDate("");
                        }
                    }} 
                    min={new Date().toISOString().split('T')[0]}
                    className="bg-transparent outline-none w-full text-sm font-medium text-[#3A3A2F]" 
                  />
                </div>
              </div>

              {place?.type === 'отель' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#8E8E8E] mb-2">Дата выезда</label>
                  <div className="flex bg-[#ECECE1] rounded-2xl px-5 py-4 transition-colors focus-within:ring-2 focus-within:ring-[#5A5A40]">
                    <Calendar className="w-5 h-5 text-[#5A5A40] mr-3" />
                    <input 
                      type="date" 
                      value={checkoutDate} 
                      onChange={e => setCheckoutDate(e.target.value)} 
                      min={bookingDate || new Date().toISOString().split('T')[0]}
                      className="bg-transparent outline-none w-full text-sm font-medium text-[#3A3A2F]" 
                    />
                  </div>
                </div>
              )}

              {place?.type === 'ресторан' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#8E8E8E] mb-2">Время визита</label>
                  <div className="flex bg-[#ECECE1] rounded-2xl px-5 py-4 transition-colors focus-within:ring-2 focus-within:ring-[#5A5A40]">
                    <svg className="w-5 h-5 text-[#5A5A40] mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <input 
                      type="time" 
                      value={bookingTime} 
                      onChange={e => setBookingTime(e.target.value)} 
                      className="bg-transparent outline-none w-full text-sm font-medium text-[#3A3A2F] appearance-none" 
                    />
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#8E8E8E] mb-2">Количество гостей</label>
                <div className="flex bg-[#ECECE1] rounded-2xl px-5 py-4 transition-colors focus-within:ring-2 focus-within:ring-[#5A5A40]">
                  <Users className="w-5 h-5 text-[#5A5A40] mr-3" />
                  <select value={bookingGuests} onChange={e => setBookingGuests(parseInt(e.target.value))} className="bg-transparent outline-none w-full text-sm font-medium text-[#3A3A2F] appearance-none">
                    <option value={1}>1 персона</option>
                    <option value={2}>2 персоны</option>
                    <option value={3}>3 персоны</option>
                    <option value={4}>4 персоны</option>
                    <option value={5}>5 персон</option>
                    <option value={6}>6+ персон</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === "selection" && place.type === "отель" && (
          <HotelRoomSelector rooms={rooms} selected={selectedRoom} onSelect={setSelectedRoom} guests={bookingGuests} />
        )}
        
        {step === "selection" && place.type === "ресторан" && (
          <RestaurantTableSelector placeId={id} tables={tables} selected={selectedTable} onSelect={setSelectedTable} guests={bookingGuests} />
        )}

        {step === "details" && (
          <div className="bg-white p-6 rounded-3xl border border-[#E2E2D1] shadow-sm space-y-6 m-4 mt-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-serif font-bold text-[#3A3A2F]">Детали бронирования</h2>
            <div className="p-5 bg-[#F9F9F4] rounded-2xl border-2 border-[#5A5A40] space-y-2">
              <p className="font-bold text-[#3A3A2F] text-lg">{place.name}</p>
              <p className="text-sm text-[#8E8E8E] mb-2">
                {place.type === 'отель' ? `${bookingDate} - ${checkoutDate}` : `${bookingDate} в ${bookingTime}`} • {bookingGuests} {bookingGuests === 1 ? 'персона' : 'персоны'}
              </p>
              
              {place.type === "отель" && selectedRoom && (
                <p className="text-sm text-[#5A5A40] font-medium pt-2 border-t border-[#E2E2D1]">{selectedRoom.name} <span className="float-right font-serif">{selectedRoom.price} ₽</span></p>
              )}
              {place.type === "ресторан" && selectedTable && (
                <p className="text-sm text-[#5A5A40] font-medium pt-2 border-t border-[#E2E2D1]">Столик: {selectedTable.number} ({selectedTable.seats} мест)</p>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#8E8E8E] mb-2">Имя</label>
                <div className="flex bg-[#ECECE1] rounded-2xl px-5 py-4 transition-colors focus-within:ring-2 focus-within:ring-[#5A5A40]">
                  <input 
                    type="text" 
                    value={contactName} 
                    onChange={e => setContactName(e.target.value)} 
                    placeholder="Как к вам обращаться?"
                    className="bg-transparent outline-none w-full text-sm font-medium text-[#3A3A2F]" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#8E8E8E] mb-2">Телефон</label>
                <div className="flex bg-[#ECECE1] rounded-2xl px-5 py-4 transition-colors focus-within:ring-2 focus-within:ring-[#5A5A40]">
                  <input 
                    type="tel" 
                    value={contactPhone} 
                    onChange={e => setContactPhone(e.target.value)} 
                    placeholder="+7 (999) 000-00-00"
                    className="bg-transparent outline-none w-full text-sm font-medium text-[#3A3A2F]" 
                  />
                </div>
              </div>
            </div>

            <label className="flex items-start gap-3 rounded-2xl bg-[#F9F9F4] border border-[#E2E2D1] p-4 cursor-pointer">
              <input
                type="checkbox"
                checked={personalDataAccepted}
                onChange={e => setPersonalDataAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-[#8E8E8E] accent-[#5A5A40]"
              />
              <span className="text-xs leading-relaxed text-[#5A5A40] font-medium">
                Согласен на обработку имени и телефона для оформления бронирования и связи по нему.
              </span>
            </label>

            <div className="flex gap-2 text-xs leading-relaxed text-[#8E8E8E] bg-[#F5F5F0] rounded-2xl p-4">
              <Info className="w-4 h-4 shrink-0 text-[#5A5A40] mt-0.5" />
              <p>Контактные данные используются только для подтверждения брони, уточнения деталей визита и отображения в вашем профиле.</p>
            </div>

            <button disabled={!contactName || !contactPhone || !personalDataAccepted || bookingSubmitting} onClick={handleBook} className="w-full bg-[#5A5A40] text-white disabled:bg-[#ECECE1] disabled:text-[#8E8E8E] disabled:shadow-none font-bold py-4 rounded-2xl shadow-lg shadow-[#5A5A40]/20 flex justify-center items-center gap-2 hover:scale-[1.02] transition-transform mt-8">
              {bookingSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
              {bookingSubmitting ? 'Создаем бронь...' : 'Подтвердить бронь'}
            </button>
          </div>
        )}

        {step === "success" && (
          <div className="text-center py-24 px-6 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-[#5A5A40] text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-[#5A5A40]/30">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-[#3A3A2F] mb-3">Успешно!</h2>
            <p className="text-[#8E8E8E] mb-10 text-sm">Ваше бронирование подтверждено. Будем рады видеть вас.</p>
            <button onClick={() => navigate("/bookings")} className="w-full bg-[#ECECE1] text-[#3A3A2F] font-bold py-4 rounded-2xl hover:bg-[#E2E2D1] transition-colors shadow-sm">
              К моим бронированиям
            </button>
          </div>
        )}
      </main>

      {(step === "date" || step === "selection") && (
        <div className="sticky bottom-0 left-0 right-0 px-6 pt-4 pb-[calc(env(safe-area-inset-bottom,0px)+28px)] bg-white/90 backdrop-blur-md border-t border-[#E2E2D1] z-30 animate-in slide-in-from-bottom-full mt-auto shrink-0">
          <button
            disabled={
              (step === "date" && (!bookingDate || (place?.type === 'отель' && !checkoutDate) || (place?.type === 'ресторан' && !bookingTime))) || 
              (step === "selection" && place?.type === "отель" && !selectedRoom) || 
              (step === "selection" && place?.type === "ресторан" && !selectedTable)
            }
            onClick={handleNextStep}
            className="w-full bg-[#5A5A40] disabled:bg-[#ECECE1] disabled:text-[#8E8E8E] disabled:shadow-none hover:scale-[1.02] active:scale-[0.98] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#5A5A40]/20 transition-all duration-200"
          >
            {step === "date" ? "Перейти к выбору" : "Продолжить"}
          </button>
        </div>
      )}
    </div>
  );
}

function HotelRoomSelector({ rooms, selected, guests, onSelect }: { rooms: Room[], selected: Room | null, guests: number, onSelect: (r: Room) => void }) {
  const filteredRooms = rooms.filter(r => r.capacity >= guests);
  
  if (rooms.length === 0) return <div className="text-center py-10">Нет номеров.</div>;
  
  return (
    <div className="space-y-4 px-2">
      {filteredRooms.length === 0 && <div className="text-center py-10 text-sm text-[#8E8E8E]">Нет номеров, вмещающих {guests} гостей. Возвращайтесь на шаг назад и измените количество гостей.</div>}
      {filteredRooms.map(room => (
        <label key={room.id} className={cn(
          "block bg-white rounded-3xl overflow-hidden border-2 cursor-pointer transition-all duration-300",
          selected?.id === room.id ? "border-[#5A5A40] bg-[#F9F9F4] shadow-md transform scale-[1.01]" : "border-[#E2E2D1] hover:border-[#5A5A40]/50"
        )}>
          <input type="radio" className="sr-only" checked={selected?.id === room.id} onChange={() => onSelect(room)} />
          <div className="p-6">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-[#3A3A2F] text-lg">{room.name}</h3>
              <p className="font-serif font-bold text-[#5A5A40] text-lg">{room.price} ₽<span className="block text-[10px] text-right font-sans font-normal text-[#8E8E8E]">/ ночь</span></p>
            </div>
            <p className="text-sm text-[#8E8E8E] mb-5 line-clamp-2">{room.description}</p>
            <div className="flex flex-wrap gap-2">
              <div className="text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 bg-[#ECECE1] rounded-lg text-[#5A5A40] flex items-center">
                <Users className="w-3.5 h-3.5 mr-1" /> До {room.capacity}
              </div>
              {room.amenities.slice(0,2).map(am => (
                <div key={am} className="text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 bg-[#F5F5F0] rounded-lg text-[#8E8E8E]">{am}</div>
              ))}
            </div>
          </div>
        </label>
      ))}
    </div>
  );
}

function RestaurantTableSelector({ placeId, tables, selected, guests, onSelect }: { placeId: string | undefined, tables: Table[], selected: Table | null, guests: number, onSelect: (t: Table) => void }) {
  if (tables.length === 0) return <div className="text-center py-10">Нет столиков.</div>;
  
  const getLayoutDecorations = () => {
    switch(placeId) {
      case 'rest_moscow_white_rabbit':
        return (
          <>
            <div className="absolute right-0 top-0 w-4 h-full bg-[#A0C4FF] border-l border-[#7AA3E5] pointer-events-none flex items-center justify-center opacity-70">
               <div className="text-[10px] text-white font-bold tracking-widest -rotate-90 whitespace-nowrap">ПАНОРАМА</div>
            </div>
          </>
        );
      case 'rest_moscow_savva':
        return (
          <>
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-36 h-8 bg-[#D9C5B2] border border-[#8B7E66] rounded-b-2xl opacity-70 pointer-events-none flex items-center justify-center text-[9px] font-bold text-[#5A5A40] uppercase tracking-widest">
              Бар
            </div>
            <div className="absolute right-0 top-24 w-3 h-28 bg-[#A0C4FF] rounded-l-xl pointer-events-none opacity-70">
            </div>
          </>
        );
      case 'rest_spb_cococo':
        return <div className="absolute top-0 left-0 right-0 h-3 bg-[#A0C4FF] pointer-events-none opacity-60" />;
      case 'rest_kazan_tugan_avylym':
        return (
          <>
            <div className="absolute top-2 right-3 w-20 h-9 rounded-xl bg-[#D9C5B2] border border-[#8B7E66] text-[9px] font-bold text-[#5A5A40] flex items-center justify-center pointer-events-none opacity-70">СЦЕНА</div>
            <div className="absolute left-0 top-0 bottom-0 w-3 bg-[#C9B18E] pointer-events-none opacity-50" />
          </>
        );
      case 'rest_sochi_barceloneta':
        return (
          <>
            <div className="absolute left-0 top-0 w-full h-3 bg-[#A0C4FF] pointer-events-none opacity-70" />
            <div className="absolute top-2 right-4 w-20 h-9 bg-[#E7D7C1] rounded-xl border border-[#B99B74] text-[9px] font-bold text-[#7A5A36] flex items-center justify-center pointer-events-none opacity-75">БАР</div>
          </>
        );
      case 'rest_nsk_goodman':
        return <div className="absolute top-2 right-3 w-20 h-10 sm:w-24 sm:h-12 bg-[#e0ac98] border border-[#a45d41] rounded-xl flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-[#812c0e] opacity-70 uppercase tracking-widest pointer-events-none">ГРИЛЬ</div>;
      case 'rest_ekb_troyekurov':
        return (
          <>
            <div className="absolute top-2 left-3 w-16 h-8 bg-[#D9C5B2] rounded-xl border border-[#8B7E66] text-[9px] font-bold text-[#5A5A40] flex items-center justify-center pointer-events-none opacity-70">VIP</div>
            <div className="absolute right-0 bottom-16 w-3 h-24 bg-[#A0C4FF] rounded-l-xl pointer-events-none opacity-60" />
          </>
        );
      case 'rest_vladivostok_zuma':
        return <div className="absolute bottom-8 right-3 w-28 h-8 bg-[#8B7E66] border border-[#5A5A40] pointer-events-none flex items-center justify-center rounded-lg opacity-70 text-white text-[9px] font-bold tracking-widest">СУШИ-БАР</div>;
      case 'rest_paris_septime':
        return <div className="absolute left-0 top-0 bottom-0 w-3 bg-[#A0C4FF] pointer-events-none opacity-60" />;
      default:
        return (
          <>
            <div className="absolute top-8 left-0 w-2 h-20 bg-[#A0C4FF] border border-[#7AA3E5] pointer-events-none flex items-center justify-center rounded-r-lg opacity-80 z-0">
               <div className="text-[8px] text-white font-bold tracking-widest -rotate-90">ОКНО</div>
            </div>
            <div className="absolute bottom-16 left-0 w-2 h-20 bg-[#A0C4FF] border border-[#7AA3E5] pointer-events-none flex items-center justify-center rounded-r-lg opacity-80 z-0">
               <div className="text-[8px] text-white font-bold tracking-widest -rotate-90">ОКНО</div>
            </div>
            <div className="absolute top-3 right-3 w-20 h-10 sm:w-24 sm:h-12 bg-[#e0ac98] border border-[#a45d41] rounded-xl flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-[#812c0e] opacity-70 uppercase tracking-widest pointer-events-none">
               ГРИЛЬ
            </div>
          </>
        );
    }
  }

  return (
    <>
      <div className="bg-white rounded-3xl border border-[#E2E2D1] p-5 text-center mb-6 shadow-sm">
        <p className="text-sm font-bold text-[#8E8E8E] uppercase tracking-widest">Выберите столик</p>
        <p className="text-xs text-[#5A5A40] mt-1">Доступны столики для {guests} {guests === 1 ? 'персоны' : 'персон'}</p>
        <div className="flex justify-center flex-wrap gap-4 mt-4 text-xs font-medium text-[#3A3A2F]">
          <div className="flex items-center"><div className="w-4 h-4 bg-white border-2 border-[#5A5A40] rounded-md mr-2"></div> Доступен</div>
          <div className="flex items-center"><div className="w-4 h-4 bg-[#5A5A40] rounded-md mr-2"></div> Выбран</div>
          <div className="flex items-center"><div className="w-4 h-4 bg-[#ECECE1] border-2 border-[#E2E2D1] rounded-md mr-2"></div> Занят</div>
        </div>
      </div>
      
      {/* Interactive Map Area */}
      <div className="bg-[#F5F5F0] rounded-3xl aspect-[4/5] sm:aspect-[4/3] relative overflow-hidden border border-[#E2E2D1] p-4 shadow-inner" style={{ backgroundImage: 'radial-gradient(#E2E2D1 2px, transparent 2px)', backgroundSize: '30px 30px' }}>
        
        {getLayoutDecorations()}
        
        {/* Entrance - common for all */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-white border-4 border-dashed border-[#E2E2D1] border-b-0 rounded-t-xl flex justify-center text-[8px] font-bold tracking-widest text-[#5A5A40] pt-0.5">ВХОД</div>

        {tables.map(table => {
          const isSelected = selected?.id === table.id;
          const fitsGuests = table.seats >= guests;
          const disabled = !table.isAvailable || !fitsGuests;
          
          return (
            <button
              key={table.id}
              disabled={disabled}
              onClick={() => onSelect(table)}
              className={cn(
                "absolute flex items-center justify-center font-bold transition-all shadow-sm",
                table.shape === "circle" ? "rounded-full" : "rounded-xl",
                table.seats <= 2 ? "w-8 h-8 sm:w-10 sm:h-10 text-[11px] sm:text-xs" : table.seats <= 4 ? "w-10 h-10 sm:w-12 sm:h-12 text-xs sm:text-sm" : "w-12 h-11 sm:w-16 sm:h-14 text-sm sm:text-base",
                disabled 
                  ? "bg-[#ECECE1] text-[#8E8E8E] border-2 border-[#E2E2D1] cursor-not-allowed opacity-70"
                  : isSelected 
                    ? "bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/30 z-10" 
                    : "bg-white text-[#3A3A2F] border-2 border-[#5A5A40] hover:bg-[#F9F9F4] cursor-pointer"
              )}
              style={{
                left: `${table.x}%`,
                top: `${table.y}%`,
                transform: `translate(-50%, -50%) ${isSelected ? 'scale(1.15)' : ''}`,
              }}
              title={!fitsGuests ? `Нужно минимум ${guests} мест, тут ${table.seats}` : ""}
            >
              {table.number}
            </button>
          )
        })}
      </div>
    </>
  );
}
