import { useState, useEffect, useMemo } from "react";
import { YMaps, Map, Placemark, ZoomControl, GeolocationControl } from "@pbe/react-yandex-maps";
import { Link } from "react-router-dom";
import { Place } from '../data/mockData';
import { MapPin } from "lucide-react";
import { cn } from "../lib/utils";
import { fetchApi } from '../lib/api';

import ImageWithFallback from '../components/ImageWithFallback';

export default function MapSearch() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>(() => sessionStorage.getItem('selectedCity') || "all");
  const [showCityModal, setShowCityModal] = useState(false);

  useEffect(() => {
    sessionStorage.setItem('selectedCity', selectedCity);
  }, [selectedCity]);

  useEffect(() => {
    fetchApi('/places')
      .then(setPlaces)
      .catch(console.error);
  }, []);

  const filteredPlaces = places.filter(p => 
    (selectedCity === "all" || p.city === selectedCity) &&
    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const cities = Array.from(new Set(places.map(p => p.city).filter(Boolean))).sort();

  // Calculate dynamic center if places exist
  const mapCenter = useMemo(() => {
    if (filteredPlaces.length > 0) {
      return [filteredPlaces[0].latitude, filteredPlaces[0].longitude];
    }
    return [55.7558, 37.6173]; // Moscow default
  }, [filteredPlaces, selectedCity]);

  return (
    <div className="h-[100dvh] w-full relative pb-safe">
      <YMaps>
        <Map
          state={{ center: mapCenter, zoom: selectedCity === "all" ? 5 : 10 }}
          className="w-full h-full z-0"
        >
          <ZoomControl options={{ position: { right: 10, top: 180 } }} />
          <GeolocationControl options={{ position: { right: 10, bottom: 40 } }} />
          {filteredPlaces.map((place) => (
            <Placemark
              key={place.id}
              geometry={[place.latitude, place.longitude]}
              options={{
                preset: place.type === 'отель' ? 'islands#blueHotelIcon' : 'islands#redFoodIcon',
              }}
              onClick={() => setSelectedPlace(place)}
            />
          ))}
        </Map>
      </YMaps>
      
      {/* Search overlay */}
      <div className="absolute top-8 left-6 right-6 z-10 flex flex-col gap-4">
        <div className="bg-white rounded-full shadow-lg px-6 py-4 flex-1 flex items-center border border-[#E2E2D1] pointer-events-auto">
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} type="text" placeholder="Поиск мест..." className="w-full bg-transparent outline-none text-base font-medium text-[#3A3A2F] placeholder:text-[#8E8E8E]" />
            <div className="w-8 h-8 rounded-full bg-[#ECECE1] flex items-center justify-center text-[#5A5A40]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
        </div>
        
        <div className="flex gap-2">
            <button 
               onClick={() => setShowCityModal(true)}
               className="bg-white px-4 py-2 rounded-full border border-[#E2E2D1] shadow-lg flex items-center gap-2 text-sm font-medium text-[#3A3A2F] pointer-events-auto hover:bg-[#F9F9F4] transition-colors"
            >
               <MapPin className="w-4 h-4 text-[#5A5A40]" />
               {selectedCity === "all" ? "Все города" : selectedCity}
            </button>
        </div>
      </div>

      {showCityModal && (
        <div className="absolute inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 pointer-events-auto" onClick={() => setShowCityModal(false)}>
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

      {/* Selected place popup overlay */}
      {selectedPlace && (
        <div className="absolute bottom-[90px] left-6 right-6 z-10 animate-in slide-in-from-bottom-10 pointer-events-auto">
          <Link to={`/place/${selectedPlace.id}`} className="block bg-white rounded-3xl p-4 shadow-xl border border-[#E2E2D1] no-underline relative">
            <button 
              className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center z-20"
              onClick={(e) => { e.preventDefault(); setSelectedPlace(null); }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <div className="flex gap-4">
              <ImageWithFallback
                src={selectedPlace.imageUrl}
                alt={selectedPlace.name}
                className="w-24 h-24 object-cover rounded-2xl shrink-0"
              />
              <div className="flex flex-col justify-center">
                <h3 className="font-serif font-bold text-lg text-[#3A3A2F] leading-tight mb-1">
                  {selectedPlace.name}
                </h3>
                <p className="text-xs font-bold uppercase tracking-widest text-[#8E8E8E] mb-2">{selectedPlace.type === 'отель' ? 'Отель' : 'Ресторан'}</p>
                <div className="flex items-center text-sm font-bold text-[#5A5A40]">
                  <svg className="w-4 h-4 mr-1 text-[#DBAE59]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  {selectedPlace.rating}
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
