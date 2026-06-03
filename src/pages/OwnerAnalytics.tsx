import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Bot, ChevronLeft, MessageSquareText, Star, Users } from "lucide-react";
import { fetchApi } from "../lib/api";
import { Booking, Place, Review } from "../api/types";
import PageLoader from "../components/PageLoader";

interface OwnerAnalyticsResponse {
  place: Place;
  summary: {
    totalBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    totalGuests: number;
    averageRating: number;
    totalReviews: number;
    positive: number;
    neutral: number;
    negative: number;
    highlights: string[];
  };
  recentBookings: Booking[];
  recentReviews: Review[];
  aiAnalysis: {
    summary: string;
    strengths: string[];
    risks: string[];
    actions: string[];
    source?: string;
  };
}

export default function OwnerAnalytics() {
  const navigate = useNavigate();
  const [data, setData] = useState<OwnerAnalyticsResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<OwnerAnalyticsResponse>("/places/owner/analytics")
      .then(setData)
      .catch(err => setError(err instanceof Error ? err.message : "Нет доступа к аналитике"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader label="Загрузка аналитики" />;

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
        <p className="text-xl font-bold text-[#3A3A2F] mb-3">Аналитика недоступна</p>
        <p className="text-sm text-[#8E8E8E] max-w-sm mb-6">{error || "Email аккаунта должен совпадать с email заведения."}</p>
        <button onClick={() => navigate("/profile")} className="px-6 py-3 rounded-2xl bg-[#5A5A40] text-white font-bold">В профиль</button>
      </div>
    );
  }

  const { place, summary, recentBookings, recentReviews, aiAnalysis } = data;

  return (
    <div className="pb-24 pt-8 px-6 max-w-3xl mx-auto space-y-6">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-[#E2E2D1] shadow-sm">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#3A3A2F]">Аналитика заведения</h1>
          <p className="text-sm text-[#8E8E8E]">{place.name}</p>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3">
        <Metric icon={BarChart3} label="Бронирования" value={summary.totalBookings} />
        <Metric icon={Users} label="Гостей" value={summary.totalGuests} />
        <Metric icon={Star} label="Рейтинг" value={summary.averageRating.toFixed(1)} />
        <Metric icon={MessageSquareText} label="Отзывы" value={summary.totalReviews} />
      </section>

      <section className="bg-white rounded-3xl border border-[#E2E2D1] p-6 shadow-sm">
        <h2 className="font-bold text-[#3A3A2F] mb-4">Анализ отзывов</h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-2xl bg-green-50 p-4"><p className="text-2xl font-bold text-green-700">{summary.positive}</p><p className="text-xs text-green-700">Положительные</p></div>
          <div className="rounded-2xl bg-yellow-50 p-4"><p className="text-2xl font-bold text-yellow-700">{summary.neutral}</p><p className="text-xs text-yellow-700">Нейтральные</p></div>
          <div className="rounded-2xl bg-red-50 p-4"><p className="text-2xl font-bold text-red-700">{summary.negative}</p><p className="text-xs text-red-700">Проблемные</p></div>
        </div>
        {summary.highlights.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {summary.highlights.map(word => (
              <span key={word} className="px-3 py-1.5 rounded-full bg-[#F5F5F0] text-xs font-bold text-[#5A5A40]">{word}</span>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white rounded-3xl border border-[#E2E2D1] p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#5A5A40] text-white flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-[#3A3A2F]">ИИ-аналитика отзывов</h2>
            <p className="text-xs text-[#8E8E8E]">{aiAnalysis.source === 'gigachat' ? 'Сформировано GigaChat' : 'Локальный анализ'}</p>
          </div>
        </div>
        <p className="text-sm text-[#3A3A2F] leading-relaxed mb-5">{aiAnalysis.summary}</p>
        <InsightList title="Сильные стороны" items={aiAnalysis.strengths} tone="green" />
        <InsightList title="Риски" items={aiAnalysis.risks} tone="yellow" />
        <InsightList title="Что сделать" items={aiAnalysis.actions} tone="base" />
      </section>

      <section className="bg-white rounded-3xl border border-[#E2E2D1] p-6 shadow-sm">
        <h2 className="font-bold text-[#3A3A2F] mb-4">Последние отзывы</h2>
        <div className="space-y-4">
          {recentReviews.map(review => (
            <div key={review.id} className="border-b border-[#E2E2D1] last:border-0 pb-4 last:pb-0">
              <div className="flex justify-between gap-3 mb-1">
                <p className="font-bold text-sm text-[#3A3A2F]">{review.userName}</p>
                <p className="text-sm font-bold text-[#C4A484]">{review.rating}/5</p>
              </div>
              <p className="text-sm text-[#8E8E8E] leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-[#E2E2D1] p-6 shadow-sm">
        <h2 className="font-bold text-[#3A3A2F] mb-4">Последние бронирования</h2>
        <div className="space-y-3">
          {recentBookings.length === 0 ? (
            <p className="text-sm text-[#8E8E8E]">Бронирований пока нет.</p>
          ) : recentBookings.map(booking => (
            <div key={booking.id} className="flex justify-between gap-3 rounded-2xl bg-[#F9F9F4] p-4">
              <div>
                <p className="font-bold text-sm text-[#3A3A2F]">{booking.contactName}</p>
                <p className="text-xs text-[#8E8E8E]">{booking.resourceName} • {booking.date}</p>
              </div>
              <span className="text-xs font-bold text-[#5A5A40]">{booking.guests} гостей</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-3xl border border-[#E2E2D1] p-5 shadow-sm">
      <Icon className="w-5 h-5 text-[#5A5A40] mb-3" />
      <p className="text-2xl font-serif font-bold text-[#3A3A2F]">{value}</p>
      <p className="text-xs text-[#8E8E8E] font-bold uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}

function InsightList({ title, items, tone }: { title: string; items: string[]; tone: 'green' | 'yellow' | 'base' }) {
  if (!items.length) return null;
  const colors = {
    green: 'bg-green-50 text-green-800',
    yellow: 'bg-yellow-50 text-yellow-800',
    base: 'bg-[#F5F5F0] text-[#5A5A40]',
  };

  return (
    <div className="mb-4 last:mb-0">
      <h3 className="text-xs font-bold uppercase tracking-wider text-[#8E8E8E] mb-2">{title}</h3>
      <div className="space-y-2">
        {items.map(item => (
          <p key={item} className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${colors[tone]}`}>{item}</p>
        ))}
      </div>
    </div>
  );
}
