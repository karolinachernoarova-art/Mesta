import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit2, ImagePlus, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { fetchApi } from '../lib/api';
import { Place } from '../data/mockData';
import { uploadImage } from '../api/uploads';
import { useFeedback } from '../components/FeedbackProvider';

export default function Admin() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { confirm, showToast } = useFeedback();
  const [places, setPlaces] = useState<Place[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [managingPlaceId, setManagingPlaceId] = useState<string | null>(null);
  const [subItems, setSubItems] = useState<any[]>([]);
  const [showSubItemForm, setShowSubItemForm] = useState(false);
  const [subItemForm, setSubItemForm] = useState({ name: '', capacity: 2, price: 0 });
  const [imageUploading, setImageUploading] = useState(false);
  const [savingPlace, setSavingPlace] = useState(false);

  const initialForm = {
    name: '', type: 'отель', city: '', description: '', address: '',
    latitude: '', longitude: '', imageUrl: '', images: '', contactPhone: '', contactEmail: '', website: '', averagePrice: 0,
  };
  const [formData, setFormData] = useState(initialForm);

  const loadPlaces = React.useCallback(async () => {
    if (!isAdmin) return;
    const result = await fetchApi<Place[]>('/places');
    setPlaces(result);
  }, [isAdmin]);

  useEffect(() => {
    loadPlaces().catch(console.error);
  }, [loadPlaces]);

  useEffect(() => {
    if (!managingPlaceId) {
      setSubItems([]);
      return;
    }
    const place = places.find(item => item.id === managingPlaceId);
    if (!place) return;
    fetchApi<any>(`/places/${managingPlaceId}/resources`)
      .then(res => setSubItems(place.type === 'отель' ? (res.rooms || []) : (res.tables || [])))
      .catch(console.error);
  }, [managingPlaceId, places]);

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-[var(--bg-base)] min-h-screen text-[var(--text-main)] flex flex-col items-center justify-center">
        <p className="mb-4 text-xl font-bold">Доступ запрещен</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-[var(--bg-accent)] rounded-xl">Назад</button>
      </div>
    );
  }

  const handleEdit = (place: Place) => {
    setEditingId(place.id);
    setFormData({
      name: place.name,
      type: place.type,
      city: place.city || '',
      description: place.description,
      address: place.address,
      latitude: String(place.latitude),
      longitude: String(place.longitude),
      imageUrl: place.imageUrl || '',
      images: place.images?.join(', ') || '',
      contactPhone: place.contactPhone || '',
      contactEmail: place.contactEmail || '',
      website: place.website || '',
      averagePrice: place.averagePrice || 0,
    });
  };

  const handleDelete = async (id: string, name: string) => {
    const accepted = await confirm({
      title: 'Удалить место?',
      message: `${name} будет удалено вместе с ресурсами, отзывами и бронированиями.`,
      confirmText: 'Удалить',
      tone: 'danger',
    });
    if (!accepted) return;
    await fetchApi(`/places/${id}`, { method: 'DELETE' });
    await loadPlaces();
    showToast({ type: 'success', title: 'Место удалено' });
  };

  const handleAddSubItem = async () => {
    const place = places.find(item => item.id === managingPlaceId);
    if (!place || !subItemForm.name || !subItemForm.capacity) return;
    if (place.type === 'отель' && !subItemForm.price) return;

    await fetchApi(`/places/${managingPlaceId}/resources`, {
      method: 'POST',
      body: JSON.stringify(subItemForm),
    });
    setShowSubItemForm(false);
    setSubItemForm({ name: '', capacity: 2, price: 0 });
    const res = await fetchApi<any>(`/places/${managingPlaceId}/resources`);
    setSubItems(place.type === 'отель' ? res.rooms : res.tables);
  };

  const handleDeleteSubItem = async (itemId: string) => {
    const place = places.find(item => item.id === managingPlaceId);
    if (!place) return;
    const accepted = await confirm({
      title: place.type === 'отель' ? 'Удалить номер?' : 'Удалить столик?',
      message: 'Этот ресурс больше нельзя будет выбрать при бронировании.',
      confirmText: 'Удалить',
      tone: 'danger',
    });
    if (!accepted) return;
    await fetchApi(`/places/${managingPlaceId}/resources/${itemId}`, { method: 'DELETE' });
    const res = await fetchApi<any>(`/places/${managingPlaceId}/resources`);
    setSubItems(place.type === 'отель' ? res.rooms : res.tables);
  };

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    try {
      setImageUploading(true);
      const url = await uploadImage(e.target.files[0]);
      setFormData(prev => ({ ...prev, imageUrl: url }));
      showToast({ type: 'success', title: 'Главное фото загружено' });
    } finally {
      setImageUploading(false);
      e.target.value = '';
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    try {
      setImageUploading(true);
      const urls = await Promise.all(Array.from(e.target.files).map(file => uploadImage(file)));
      const existing = formData.images ? formData.images.split(',').map(item => item.trim()).filter(Boolean) : [];
      setFormData(prev => ({ ...prev, images: [...existing, ...urls].join(',') }));
      showToast({ type: 'success', title: 'Галерея обновлена' });
    } finally {
      setImageUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingPlace(true);
      const placeData = {
        name: formData.name,
        type: formData.type,
        city: formData.city,
        description: formData.description,
        address: formData.address,
        latitude: parseFloat(formData.latitude) || 0,
        longitude: parseFloat(formData.longitude) || 0,
        imageUrl: formData.imageUrl,
        images: formData.images.split(',').map(item => item.trim()).filter(Boolean),
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail.trim().toLowerCase(),
        website: formData.website,
        averagePrice: formData.averagePrice,
      };

      if (editingId) {
        await fetchApi(`/places/${editingId}`, { method: 'PUT', body: JSON.stringify(placeData) });
      } else {
        await fetchApi('/places', { method: 'POST', body: JSON.stringify(placeData) });
      }
      setEditingId(null);
      setFormData(initialForm);
      await loadPlaces();
      showToast({ type: 'success', title: editingId ? 'Место обновлено' : 'Место создано' });
    } catch (error) {
      showToast({ type: 'error', title: 'Не удалось сохранить место', message: error instanceof Error ? error.message : undefined });
    } finally {
      setSavingPlace(false);
    }
  };

  return (
    <div className="pb-24 pt-8 px-6 max-w-2xl mx-auto space-y-6">
      <header className="flex items-center mb-8">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-[var(--bg-surface)] rounded-full flex items-center justify-center border border-[var(--border-main)] shadow-sm mr-4">
          <ChevronLeft className="w-5 h-5 text-[var(--text-main)]" />
        </button>
        <h1 className="text-2xl font-serif font-bold tracking-tight text-[var(--text-main)]">Админ-панель</h1>
      </header>

      <form onSubmit={handleSubmit} className="bg-[var(--bg-surface)] p-6 rounded-3xl border border-[var(--border-main)] shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-main)]">{editingId ? 'Редактировать место' : 'Добавить место'}</h2>
        {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData(initialForm); }} className="text-xs text-red-500 font-bold">Отменить редактирование</button>}

        <div className="grid grid-cols-2 gap-4">
          <Field label="Название"><input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="admin-input" /></Field>
          <Field label="Город"><input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="admin-input" /></Field>
          <Field label="Тип"><select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="admin-input"><option value="отель">Отель</option><option value="ресторан">Ресторан</option></select></Field>
          <Field label="Телефон"><input value={formData.contactPhone} onChange={e => setFormData({ ...formData, contactPhone: e.target.value })} className="admin-input" /></Field>
          <Field label="Email заведения"><input type="email" value={formData.contactEmail} onChange={e => setFormData({ ...formData, contactEmail: e.target.value })} className="admin-input" placeholder="owner@example.com" /></Field>
          <Field label="Средний чек / Цена от"><input type="number" required value={formData.averagePrice} onChange={e => setFormData({ ...formData, averagePrice: parseInt(e.target.value) || 0 })} className="admin-input" /></Field>
          <div className="col-span-2"><Field label="Описание"><textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="admin-input min-h-24" /></Field></div>
          <div className="col-span-2"><Field label="Адрес"><input required value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="admin-input" /></Field></div>
          <Field label="Широта"><input value={formData.latitude} onChange={e => setFormData({ ...formData, latitude: e.target.value })} className="admin-input" /></Field>
          <Field label="Долгота"><input value={formData.longitude} onChange={e => setFormData({ ...formData, longitude: e.target.value })} className="admin-input" /></Field>
          <Field label="Сайт"><input type="url" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} className="admin-input" /></Field>

          <div className="col-span-2">
            <Field label="Главное фото">
              <div className="flex gap-2">
                <input required value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} className="admin-input flex-1" placeholder="https://" />
                <label
                  htmlFor="mainImageUpload"
                  aria-disabled={imageUploading}
                  className={`px-4 bg-[var(--bg-accent)] border border-[var(--border-main)] rounded-2xl inline-flex items-center justify-center cursor-pointer ${imageUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {imageUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
                </label>
                <input id="mainImageUpload" type="file" className="absolute h-px w-px overflow-hidden opacity-0" accept="image/*,.heic,.heif,.avif" disabled={imageUploading} onChange={handleMainImageUpload} />
              </div>
            </Field>
          </div>

          <div className="col-span-2">
            <Field label="Доп. фото">
              <div className="flex gap-2">
                <input value={formData.images} onChange={e => setFormData({ ...formData, images: e.target.value })} className="admin-input flex-1" placeholder="https://..., https://..." />
                <label
                  htmlFor="galleryImageUpload"
                  aria-disabled={imageUploading}
                  className={`px-4 bg-[var(--bg-accent)] border border-[var(--border-main)] rounded-2xl inline-flex items-center justify-center cursor-pointer ${imageUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {imageUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
                </label>
                <input id="galleryImageUpload" type="file" className="absolute h-px w-px overflow-hidden opacity-0" accept="image/*,.heic,.heif,.avif" multiple disabled={imageUploading} onChange={handleGalleryUpload} />
              </div>
            </Field>
          </div>
        </div>

        <button disabled={savingPlace} type="submit" className="w-full bg-[var(--brand-primary)] text-[var(--bg-base)] font-bold py-4 rounded-2xl shadow-lg disabled:opacity-70 inline-flex items-center justify-center gap-2">
          {savingPlace && <Loader2 className="w-5 h-5 animate-spin" />}
          {savingPlace ? 'Сохраняем...' : editingId ? 'Сохранить изменения' : 'Добавить место'}
        </button>
      </form>

      <div className="bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-main)] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--border-main)] bg-[var(--bg-subtle)]">
          <h3 className="font-bold text-[var(--text-main)]">Существующие места</h3>
        </div>
        <div className="divide-y divide-[var(--border-main)] max-h-96 overflow-y-auto">
          {places.map(place => (
            <div key={place.id}>
              <div className="p-4 flex items-center justify-between hover:bg-[var(--bg-subtle)] transition-colors">
                <div>
                  <p className="font-bold text-sm text-[var(--text-main)]">{place.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{place.city} • {place.type}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setManagingPlaceId(managingPlaceId === place.id ? null : place.id)} className="p-2 text-[var(--brand-primary)] hover:bg-[var(--bg-accent)] rounded-lg"><PlusCircle className="w-4 h-4" /></button>
                  <button onClick={() => handleEdit(place)} className="p-2 text-[var(--brand-primary)] hover:bg-[var(--bg-accent)] rounded-lg"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(place.id, place.name)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              {managingPlaceId === place.id && (
                <div className="bg-[var(--bg-accent)] p-4 border-t border-[var(--border-main)]">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">{place.type === 'отель' ? 'Номера' : 'Столики'}</h4>
                    <button onClick={() => setShowSubItemForm(!showSubItemForm)} className="text-xs font-bold text-[var(--brand-primary)]">{showSubItemForm ? 'Отмена' : 'Добавить'}</button>
                  </div>
                  {showSubItemForm && (
                    <div className="mb-4 p-3 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-main)] shadow-sm space-y-3">
                      <input placeholder={place.type === 'отель' ? 'Название номера' : 'Номер столика'} value={subItemForm.name} onChange={e => setSubItemForm({ ...subItemForm, name: e.target.value })} className="admin-input" />
                      <div className="flex gap-2">
                        <input type="number" placeholder="Вместимость" value={subItemForm.capacity} onChange={e => setSubItemForm({ ...subItemForm, capacity: parseInt(e.target.value) || 0 })} className="admin-input flex-1" />
                        {place.type === 'отель' && <input type="number" placeholder="Цена" value={subItemForm.price} onChange={e => setSubItemForm({ ...subItemForm, price: parseInt(e.target.value) || 0 })} className="admin-input flex-1" />}
                      </div>
                      <button type="button" onClick={handleAddSubItem} className="w-full bg-[var(--brand-primary)] text-[var(--bg-base)] text-xs font-bold py-2 rounded-lg">Сохранить</button>
                    </div>
                  )}
                  <div className="space-y-2">
                    {subItems.map(item => (
                      <div key={item.id} className="flex justify-between items-center bg-[var(--bg-surface)] p-2 rounded-xl text-sm shadow-sm border border-[var(--border-main)]">
                        <div><span className="font-bold text-[var(--text-main)]">{item.name || `Столик ${item.number}`}</span> <span className="text-[var(--text-muted)] text-xs ml-2">Вместимость: {item.capacity || item.seats}</span></div>
                        <button onClick={() => handleDeleteSubItem(item.id)} className="text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                    {subItems.length === 0 && <p className="text-xs text-[var(--text-muted)]">Нет элементов</p>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="block">
      <span className="block text-xs font-bold uppercase text-[var(--text-muted)] mb-2">{label}</span>
      {children}
    </div>
  );
}
