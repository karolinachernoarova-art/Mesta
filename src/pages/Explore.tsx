import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PlaceType, Place } from "../data/mockData";
import { MapPin, Star, Coffee, Bed, SlidersHorizontal, X } from "lucide-react";
import { cn } from "../lib/utils";
import { fetchApi } from '../lib/api';
import ImageWithFallback from '../components/ImageWithFallback';

export default function Explore() {
  const [filter, setFilter] = useState<PlaceType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"rating-desc" | "alpha">("rating-desc");
  const [selectedCity, setSelectedCity] = useState<string>(() => sessionStorage.getItem('selectedCity') || "all");
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCityModal, setShowCityModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);

  useEffect(() => {
    sessionStorage.setItem('selectedCity', selectedCity);
  }, [selectedCity]);

  useEffect(() => {
    if (!loading) {
      const savedScroll = sessionStorage.getItem('exploreScroll');
      if (savedScroll) {
        window.scrollTo(0, parseInt(savedScroll, 10));
      }

      const handleScroll = () => {
        sessionStorage.setItem('exploreScroll', window.scrollY.toString());
      };
      
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [loading]);

  useEffect(() => {
    fetchApi('/places')
      .then(res => {
        setPlaces(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredPlaces = places.filter(
    (p) => (filter === "all" || p.type === filter) &&
           (selectedCity === "all" || p.city === selectedCity) &&
           ((p.rating || 0) >= minRating) &&
           (maxPrice === 0 || (p.averagePrice || 0) <= maxPrice) &&
           (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  ).sort((a, b) => {
    if (sortBy === "rating-desc") return (b.rating || 0) - (a.rating || 0);
    if (sortBy === "alpha") return a.name.localeCompare(b.name);
    return 0;
  });

  const cities = Array.from(new Set(places.map(p => p.city).filter(Boolean))).sort();

  return (
    <div className="pb-20 pt-6 px-4 max-w-2xl mx-auto space-y-6">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-[#5A5A40]">
            Места
          </h1>
          <p className="text-[#8E8E8E] mt-1 text-sm bg-white inline-flex px-3 py-1 rounded-full border border-[#E2E2D1] items-center gap-1 cursor-pointer" onClick={() => setShowCityModal(true)}>
            <MapPin className="w-3.5 h-3.5" /> {selectedCity === "all" ? "Все города" : selectedCity}
          </p>
        </div>
        <div className="flex gap-2">
           <button className="w-10 h-10 bg-white border border-[#E2E2D1] rounded-full flex items-center justify-center text-[#5A5A40] hover:scale-105 transition-transform" onClick={() => setShowFiltersModal(true)}>
             <SlidersHorizontal className="w-5 h-5" />
           </button>
           <button className="w-10 h-10 bg-[#5A5A40] rounded-full flex items-center justify-center text-white hover:scale-105 transition-transform" onClick={() => setShowCityModal(true)}>
             <MapPin className="w-5 h-5" />
           </button>
        </div>
      </header>

      {showFiltersModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowFiltersModal(false)}>
           <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-xl animate-in zoom-in-95 fade-in duration-200" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-serif font-bold text-[#3A3A2F]">Фильтры</h2>
                <button onClick={() => setShowFiltersModal(false)} className="text-[#8E8E8E] hover:text-[#3A3A2F]"><X className="w-6 h-6"/></button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-[#3A3A2F] mb-3">Минимальный рейтинг: {minRating > 0 ? minRating : 'Любой'}</label>
                  <input type="range" min="0" max="5" step="0.5" value={minRating} onChange={e => setMinRating(parseFloat(e.target.value))} className="w-full h-2 bg-[#ECECE1] rounded-lg appearance-none cursor-pointer accent-[#5A5A40]" />
                  <div className="flex justify-between text-xs text-[#8E8E8E] mt-2">
                    <span>0</span><span>5</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#3A3A2F] mb-3">Максимальная цена: {maxPrice > 0 ? maxPrice : 'Любая'}</label>
                  <input type="range" min="0" max="10000" step="500" value={maxPrice} onChange={e => setMaxPrice(parseInt(e.target.value))} className="w-full h-2 bg-[#ECECE1] rounded-lg appearance-none cursor-pointer accent-[#5A5A40]" />
                  <div className="flex justify-between text-xs text-[#8E8E8E] mt-2">
                    <span>Любая</span><span>10000+</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#ECECE1]">
                  <button onClick={() => {setMinRating(0); setMaxPrice(0); setShowFiltersModal(false);}} className="w-full py-3 text-sm font-bold text-[#8E8E8E] hover:bg-[#F5F5F0] rounded-xl transition-colors">Сбросить фильтры</button>
                </div>
              </div>
           </div>
        </div>
      )}

      {showCityModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowCityModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-serif font-bold text-[#3A3A2F] mb-4">Выберите город</h2>
            <div className="space-y-2">
              <button
                onClick={() => { setSelectedCity("all"); setShowCityModal(false); }}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-2xl font-medium transition-colors",
                  selectedCity === "all" ? "bg-[#5A5A40] text-white" : "bg-[#F5F5F0] text-[#3A3A2F] hover:bg-[#E2E2D1]"
                )}
              >
                Все города
              </button>
              {cities.map(city => (
                <button
                  key={city}
                  onClick={() => { setSelectedCity(city); setShowCityModal(false); }}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-2xl font-medium transition-colors",
                    selectedCity === city ? "bg-[#5A5A40] text-white" : "bg-[#F5F5F0] text-[#3A3A2F] hover:bg-[#E2E2D1]"
                  )}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 mb-6 flex flex-col items-center">
        <div className="flex gap-2 w-full max-w-lg">
          <div className="flex bg-[#ECECE1] rounded-xl px-4 py-3 items-center flex-1">
            <svg className="w-5 h-5 text-[#8E8E8E] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              placeholder="Поиск..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent w-full outline-none text-[#3A3A2F] text-sm"
            />
          </div>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#ECECE1] rounded-xl px-4 py-3 text-sm text-[#3A3A2F] outline-none border-none font-medium max-w-[140px]"
          >
            <option value="rating-desc">По рейтингу</option>
            <option value="alpha">А-Я</option>
          </select>
        </div>
        
        <div className="flex bg-[#ECECE1] p-1 rounded-xl w-full max-w-sm">
          {(["all", "отель", "ресторан"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={cn(
                "flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200",
                filter === type
                  ? "bg-white text-[#3A3A2F] shadow-sm"
                  : "text-[#8E8E8E] hover:text-[#5A5A40]"
              )}
            >
              {type === "all" && "Все"}
              {type === "отель" && "Отели"}
              {type === "ресторан" && "Рестораны"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-10 text-[#8E8E8E]">Загрузка...</div>
        ) : filteredPlaces.map((place) => (
          <Link
            key={place.id}
            to={`/place/${place.id}`}
            className="block group bg-white rounded-2xl shadow-sm border border-[#E2E2D1] overflow-hidden hover:shadow-md transition-all duration-300"
          >
            <div className="aspect-[16/9] w-full overflow-hidden relative bg-[#D9C5B2]">
              <ImageWithFallback
                src={place.imageUrl}
                alt={place.name}
                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold flex items-center shadow-sm text-[#3A3A2F]">
                {place.type === "отель" ? (
                  <Bed className="w-4 h-4 mr-1.5 text-[#8B7E66]" />
                ) : (
                  <Coffee className="w-4 h-4 mr-1.5 text-[#5A5A40]" />
                )}
                <span className="capitalize">{place.type === 'отель' ? 'Отель' : 'Ресторан'}</span>
              </div>
            </div>
            <div className="p-5">
              <div className="flex flex-col items-start">
                <h3 className="font-serif font-bold text-xl text-[#3A3A2F] leading-tight mb-2">
                  {place.name}
                </h3>
                <div className="flex items-center text-[#8E8E8E] text-sm mb-4">
                  <MapPin className="w-3.5 h-3.5 mr-1" />
                  {place.address}
                </div>
                <div className="flex items-center gap-1 text-[#C4A484]">
                  {[...Array(Math.floor(place.rating || 0))].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                  {(place.rating || 0) % 1 !== 0 && <Star className="w-4 h-4 fill-current opacity-50" />}
                  <span className="text-xs text-[#8E8E8E] ml-2 font-medium">({place.reviewCount || 0} отзывов)</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
