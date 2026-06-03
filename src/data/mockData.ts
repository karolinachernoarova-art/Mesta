export type PlaceType = 'отель' | 'ресторан';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  images?: string[];
}

export interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  amenities: string[];
  imageUrl: string;
}

export interface Table {
  id: string;
  number: string;
  seats: number;
  x: number;
  y: number;
  shape: 'circle' | 'rect';
  isAvailable: boolean;
}

export interface Place {
  id: string;
  name: string;
  type: PlaceType;
  description: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  images?: string[];
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  rating: number;
  averagePrice?: number;
  reviews: Review[];
  
  // Specific to Hotel
  rooms?: Room[];
  
  // Specific to Restaurant
  tables?: Table[];
}

export const mockPlaces: Place[] = [
  {
    id: "h1",
    name: "Grand Plaza Hotel",
    type: "отель",
    description: "Роскошный отель в центре города с панорамными видами и превосходным сервисом.",
    city: "Москва",
    address: "ул. Центральная, 1",
    latitude: 55.7558,
    longitude: 37.6173,
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1000",
    rating: 4.8,
    averagePrice: 8500,
    reviews: [
      { id: "r1", userId: "u1", userName: "Алексей И.", rating: 5, comment: "Отличный отель, номера чистые, персонал вежливый. Обязательно вернусь!", date: "2024-04-15" },
      { id: "r2", userId: "u2", userName: "Мария В.", rating: 4, comment: "Хорошее расположение, но завтраки могли бы быть разнообразнее.", date: "2024-04-12" }
    ],
    rooms: [
      { id: "rm1", name: "Стандарт", description: "Уютный номер для одного или двух человек. Все необходимое.", price: 5000, capacity: 2, amenities: ["Wi-Fi", "TV", "Кондиционер", "Душ"], imageUrl: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=800" },
      { id: "rm2", name: "Делюкс", description: "Просторный номер с большой кроватью и видом на город.", price: 8500, capacity: 2, amenities: ["Wi-Fi", "Smart TV", "Кондиционер", "Ванна", "Мини-бар"], imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800" },
      { id: "rm3", name: "Семейный Люкс", description: "Двухкомнатный люкс для комфортного отдыха с детьми.", price: 12000, capacity: 4, amenities: ["Wi-Fi", "Smart TV x2", "Кондиционер x2", "Ванна", "Кухня"], imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800" }
    ]
  },
  {
    id: "r1",
    name: "Panorama Restaurant",
    type: "ресторан",
    description: "Ресторан итальянской кухни с лучшими винами и шикарным видом.",
    city: "Москва",
    address: "ул. Ресторанная, 10",
    latitude: 55.7530,
    longitude: 37.6200,
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1000",
    rating: 4.6,
    averagePrice: 3000,
    reviews: [
      { id: "r3", userId: "u3", userName: "Иван С.", rating: 5, comment: "Лучшая паста в городе!", date: "2024-05-01" },
      { id: "r4", userId: "u4", userName: "Елена П.", rating: 4, comment: "Отлично поужинали, но столик пришлось ждать 10 минут, хотя бронировали.", date: "2024-04-28" }
    ],
    tables: [
      { id: "t1", number: "1", seats: 2, x: 25, y: 20, shape: "circle", isAvailable: true },
      { id: "t2", number: "2", seats: 2, x: 45, y: 20, shape: "circle", isAvailable: false },
      { id: "t3", number: "3", seats: 4, x: 80, y: 20, shape: "rect", isAvailable: true },
      { id: "t4", number: "4", seats: 4, x: 25, y: 40, shape: "rect", isAvailable: true },
      { id: "t5", number: "5", seats: 6, x: 75, y: 40, shape: "rect", isAvailable: true },
      { id: "t6", number: "6", seats: 2, x: 25, y: 60, shape: "circle", isAvailable: true },
      { id: "t7", number: "7", seats: 4, x: 50, y: 60, shape: "rect", isAvailable: true },
      { id: "t8", number: "8", seats: 2, x: 80, y: 60, shape: "circle", isAvailable: false },
      { id: "t9", number: "VIP 1", seats: 8, x: 25, y: 80, shape: "circle", isAvailable: true },
      { id: "t10", number: "VIP 2", seats: 8, x: 75, y: 80, shape: "circle", isAvailable: true }
    ]
  },
  {
    id: "h2",
    name: "Boutique Hotel 1888",
    type: "отель",
    description: "Историческое здание, дизайнерские номера и индивидуальный подход к каждому гостю.",
    city: "Санкт-Петербург",
    address: "пр. Исторический, 42",
    latitude: 59.9343,
    longitude: 30.3351,
    imageUrl: "https://images.unsplash.com/photo-1542314831-c6a4d1409f5e?auto=format&fit=crop&q=80&w=1000",
    rating: 4.9,
    averagePrice: 15000,
    reviews: [
      { id: "r5", userId: "u5", userName: "Оксана Р.", rating: 5, comment: "Как в музее! Потрясающая атмосфера.", date: "2024-05-02" }
    ],
    rooms: [
      { id: "rm4", name: "Романтик", description: "Номер для молодоженов.", price: 9000, capacity: 2, amenities: ["Шампанское при заезде", "Джакузи", "Завтрак в номер"], imageUrl: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80&w=800" }
    ]
  },
  {
    id: "r2",
    name: "Sushi Master",
    type: "ресторан",
    description: "Аутентичная японская кухня, свежие морепродукты и уютная атмосфера.",
    city: "Казань",
    address: "ул. Азиатская, 8",
    latitude: 55.7963,
    longitude: 49.1088,
    imageUrl: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&q=80&w=1000",
    rating: 4.7,
    averagePrice: 2000,
    reviews: [
      { id: "r6", userId: "u6", userName: "Дмитрий", rating: 5, comment: "Суши невероятные, рыба свежайшая.", date: "2024-05-04" }
    ],
    tables: [
      { id: "ts1", number: "1", seats: 2, x: 20, y: 30, shape: "rect", isAvailable: true },
      { id: "ts2", number: "2", seats: 4, x: 50, y: 30, shape: "rect", isAvailable: true },
      { id: "ts3", number: "3", seats: 4, x: 80, y: 30, shape: "rect", isAvailable: false },
      { id: "ts4", number: "4", seats: 2, x: 20, y: 60, shape: "rect", isAvailable: true },
      { id: "ts5", number: "5", seats: 4, x: 50, y: 60, shape: "rect", isAvailable: true },
      { id: "ts6", number: "6", seats: 6, x: 80, y: 60, shape: "rect", isAvailable: true }
    ]
  },
  {
    id: "h3",
    name: "Eco Lodge Resort",
    type: "отель",
    description: "Отдых на природе с максимальным комфортом. Лес, озеро, чистый воздух.",
    city: "Сочи",
    address: "ш. Загородное, 101",
    latitude: 43.6028,
    longitude: 39.7342,
    imageUrl: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=1000",
    rating: 4.5,
    averagePrice: 20000,
    reviews: [
      { id: "r7", userId: "u7", userName: "Анна", rating: 4, comment: "Тихо и спокойно, идеальное место для перезагрузки.", date: "2024-05-05" },
      { id: "r8", userId: "u8", userName: "Виктор", rating: 5, comment: "Превосходная рыбалка!", date: "2024-05-06" }
    ],
    rooms: [
      { id: "rm5", name: "Домик у озера", description: "Уединенный домик для пары.", price: 15000, capacity: 2, amenities: ["Камин", "Терасса", "Мангал"], imageUrl: "https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=800" },
      { id: "rm6", name: "Семейное шале", description: "Большой дом для компании.", price: 25000, capacity: 6, amenities: ["Камин", "Кухня", "Сауна"], imageUrl: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=800" }
    ]
  },
  {
    id: "r3",
    name: "Meat & Fire Steaks",
    type: "ресторан",
    description: "Стейкхаус с открытым огнем и лучшим мясом в городе.",
    city: "Екатеринбург",
    address: "ул. Мясницкая, 45",
    latitude: 56.8389,
    longitude: 60.6057,
    imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=1000",
    rating: 4.8,
    averagePrice: 4500,
    reviews: [
      { id: "r9", userId: "u9", userName: "Григорий", rating: 5, comment: "Стейк рибай просто тает во рту.", date: "2024-05-06" }
    ],
    tables: [
      { id: "tf1", number: "1", seats: 2, x: 15, y: 40, shape: "rect", isAvailable: true },
      { id: "tf2", number: "2", seats: 4, x: 40, y: 40, shape: "rect", isAvailable: true },
      { id: "tf3", number: "3", seats: 6, x: 65, y: 40, shape: "rect", isAvailable: true },
      { id: "tf4", number: "4", seats: 2, x: 15, y: 70, shape: "rect", isAvailable: true },
      { id: "tf5", number: "5", seats: 4, x: 40, y: 70, shape: "rect", isAvailable: true },
      { id: "tf6", number: "6", seats: 6, x: 65, y: 70, shape: "rect", isAvailable: false },
      { id: "tf7", number: "7", seats: 4, x: 90, y: 55, shape: "circle", isAvailable: true }
    ]
  },
  {
    id: "h4",
    name: "Altai Resort & Spa",
    type: "отель",
    description: "Курортный спа-отель в самом сердце живописного Алтая. Целебный воздух и природные источники.",
    city: "Горно-Алтайск",
    address: "Тракт Чуйский, 33",
    latitude: 51.9583,
    longitude: 85.9603,
    imageUrl: "https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&q=80&w=1000",
    rating: 4.9,
    averagePrice: 12000,
    reviews: [
      { id: "r10", userId: "u10", userName: "Сергей", rating: 5, comment: "Идеальное место для единения с природой.", date: "2024-05-10" }
    ],
    rooms: [
      { id: "rm7", name: "Шале Лесное", description: "Уютное шале с видом на сосновый лес.", price: 18000, capacity: 4, amenities: ["Спа", "Камин", "Завтрак", "Баня"], imageUrl: "https://images.unsplash.com/photo-1518733057094-95b53143d2a7?auto=format&fit=crop&q=80&w=800" },
      { id: "rm8", name: "Стандарт", description: "Комфортный номер в главном корпусе.", price: 8000, capacity: 2, amenities: ["Спа", "Завтрак", "Wi-Fi"], imageUrl: "https://images.unsplash.com/photo-1574643034988-ae315ae62cc2?auto=format&fit=crop&q=80&w=800" }
    ]
  },
  {
    id: "r4",
    name: "Байкальская Сказка",
    type: "ресторан",
    description: "Ресторан традиционной сибирской кухни с потрясающим видом на озеро Байкал.",
    city: "Листвянка",
    address: "ул. Горького, 15",
    latitude: 51.8504,
    longitude: 104.8722,
    imageUrl: "https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&q=80&w=1000",
    rating: 4.8,
    averagePrice: 2500,
    reviews: [
      { id: "r11", userId: "u11", userName: "Алина", rating: 5, comment: "Омуль просто великолепен!", date: "2024-05-08" }
    ],
    tables: [
      { id: "tb1", number: "1", seats: 2, x: 20, y: 30, shape: "rect", isAvailable: true },
      { id: "tb2", number: "2", seats: 4, x: 50, y: 30, shape: "rect", isAvailable: true },
      { id: "tb3", number: "3", seats: 6, x: 80, y: 30, shape: "rect", isAvailable: false },
      { id: "tb4", number: "4", seats: 2, x: 20, y: 60, shape: "rect", isAvailable: true },
      { id: "tb5", number: "5", seats: 4, x: 50, y: 60, shape: "rect", isAvailable: true },
      { id: "tb6", number: "6", seats: 6, x: 80, y: 60, shape: "rect", isAvailable: true }
    ]
  },
  {
    id: "h5",
    name: "Древний Новгород",
    type: "отель",
    description: "Бутик-отель рядом с кремлем. Атмосфера русской старины с современным комфортом.",
    city: "Великий Новгород",
    address: "ул. Софийская, 5",
    latitude: 58.5213,
    longitude: 31.2710,
    imageUrl: "https://images.unsplash.com/photo-1620067645091-aebb1de9e4fa?auto=format&fit=crop&q=80&w=1000",
    rating: 4.6,
    averagePrice: 8500,
    reviews: [
      { id: "r12", userId: "u12", userName: "Павел", rating: 4, comment: "Очень красивый интерьер, приветливый персонал.", date: "2024-05-01" }
    ],
    rooms: [
      { id: "rm9", name: "Боярский номер", description: "Просторный номер с изразцовой печью.", price: 11000, capacity: 2, amenities: ["Завтрак", "Wi-Fi", "Кофемашина"], imageUrl: "https://images.unsplash.com/photo-1598928636135-d146006ff4be?auto=format&fit=crop&q=80&w=800" }
    ]
  },
  {
    id: "r5",
    name: "Владивосток Репаблик",
    type: "ресторан",
    description: "Паназиатская кухня и свежие морепродукты прямо из океана. Модный лофт-интерьер.",
    city: "Владивосток",
    address: "пр. Океанский, 22",
    latitude: 43.1155,
    longitude: 131.8855,
    imageUrl: "https://images.unsplash.com/photo-1583515431682-14eb581e28bb?auto=format&fit=crop&q=80&w=1000",
    rating: 4.7,
    averagePrice: 3500,
    reviews: [
      { id: "r13", userId: "u13", userName: "Олег", rating: 5, comment: "Краб выше всяких похвал.", date: "2024-05-09" }
    ],
    tables: [
      { id: "tv1", number: "1", seats: 2, x: 20, y: 30, shape: "circle", isAvailable: true },
      { id: "tv2", number: "2", seats: 2, x: 40, y: 30, shape: "circle", isAvailable: false },
      { id: "tv3", number: "3", seats: 4, x: 70, y: 30, shape: "rect", isAvailable: true },
      { id: "tv4", number: "4", seats: 4, x: 30, y: 60, shape: "rect", isAvailable: true },
      { id: "tv5", number: "5", seats: 6, x: 70, y: 60, shape: "rect", isAvailable: true }
    ]
  },
  {
    id: "r6",
    name: "Сибирская Тройка",
    type: "ресторан",
    description: "Настоящая сибирская кухня: пельмени, строганина, таежные десерты.",
    city: "Новосибирск",
    address: "Красный проспект, 25",
    latitude: 55.0282,
    longitude: 82.9234,
    imageUrl: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=1000",
    rating: 4.9,
    averagePrice: 1800,
    reviews: [
      { id: "r14", userId: "u14", userName: "Анна", rating: 5, comment: "Лучшие пельмени в городе!", date: "2024-05-09" }
    ],
    tables: [
      { id: "nst1", number: "1", seats: 2, x: 20, y: 30, shape: "rect", isAvailable: true },
      { id: "nst2", number: "2", seats: 4, x: 50, y: 30, shape: "rect", isAvailable: true },
      { id: "nst3", number: "3", seats: 6, x: 80, y: 30, shape: "rect", isAvailable: false },
      { id: "nst4", number: "4", seats: 2, x: 20, y: 60, shape: "rect", isAvailable: true },
      { id: "nst5", number: "5", seats: 4, x: 50, y: 60, shape: "rect", isAvailable: true }
    ]
  },
  {
    id: "h6",
    name: "Nsk Riverside",
    type: "отель",
    description: "Современный отель на берегу Оби с панорамными видами и отличным сервисом.",
    city: "Новосибирск",
    address: "Обская ул., 10",
    latitude: 55.0118,
    longitude: 82.9357,
    imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c61fe60f?auto=format&fit=crop&q=80&w=1000",
    rating: 4.8,
    averagePrice: 9000,
    reviews: [
      { id: "r15", userId: "u15", userName: "Виктор", rating: 5, comment: "Отличный вид на реку.", date: "2024-05-10" }
    ],
    rooms: [
      { id: "nrm1", name: "Стандарт", description: "Комфортный номер.", price: 6500, capacity: 2, amenities: ["Завтрак", "Wi-Fi"], imageUrl: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800" },
      { id: "nrm2", name: "Люкс", description: "Прекрасный вид.", price: 12000, capacity: 4, amenities: ["Мини-бар", "Завтрак", "Wi-Fi"], imageUrl: "https://images.unsplash.com/photo-1590490359683-658d3d23f972?auto=format&fit=crop&q=80&w=800" }
    ]
  },
  {
    id: "r7",
    name: "La Dolce Vita",
    type: "ресторан",
    description: "Настоящая итальянская пиццерия и траттория с домашней пастой.",
    city: "Санкт-Петербург",
    address: "ул. Итальянская, 12",
    latitude: 59.9360,
    longitude: 30.3340,
    imageUrl: "https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?auto=format&fit=crop&q=80&w=1000",
    rating: 4.8,
    averagePrice: 2000,
    reviews: [
      { id: "r16", userId: "u16", userName: "Марина", rating: 5, comment: "Пицца Маргарита невероятная. Прям как в Неаполе!", date: "2024-05-11" }
    ],
    tables: [
      { id: "ldv1", number: "1", seats: 2, x: 30, y: 30, shape: "circle", isAvailable: true },
      { id: "ldv2", number: "2", seats: 4, x: 50, y: 30, shape: "circle", isAvailable: false },
      { id: "ldv3", number: "3", seats: 4, x: 70, y: 30, shape: "rect", isAvailable: true }
    ]
  },
  {
    id: "h7",
    name: "Sky Lofts & Stay",
    type: "отель",
    description: "Апарт-отель в лофт-стиле. Панорамные окна, вид на бизнес центр и отличная инфраструктура.",
    city: "Москва",
    address: "Пресненская наб., 8",
    latitude: 55.7483,
    longitude: 37.5385,
    imageUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=1000",
    rating: 4.7,
    averagePrice: 12500,
    reviews: [
      { id: "r17", userId: "u17", userName: "Дмитрий", rating: 5, comment: "Вид из номера-углового просто космос", date: "2024-05-10" }
    ],
    rooms: [
      { id: "sl1", name: "Лофт с видом", description: "Стильный лофт для двоих.", price: 12500, capacity: 2, amenities: ["Smart TV", "Вино", "Завтрак"], imageUrl: "https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?auto=format&fit=crop&q=80&w=800" }
    ]
  },
  {
    id: "r8",
    name: "Кавказский Аул",
    type: "ресторан",
    description: "Традиционная кавказская кухня, хачапури из печи и огромный выбор вин.",
    city: "Сочи",
    address: "ул. Курортный проспект, 101",
    latitude: 43.5658,
    longitude: 39.7570,
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=1000",
    rating: 4.6,
    averagePrice: 4000,
    reviews: [
      { id: "r18", userId: "u18", userName: "Александр", rating: 4, comment: "Мясо вкусное, но вечером очень шумно из-за живой музыки.", date: "2024-05-12" }
    ],
    tables: [
      { id: "ka1", number: "1", seats: 6, x: 40, y: 50, shape: "rect", isAvailable: true },
      { id: "ka2", number: "2", seats: 8, x: 60, y: 50, shape: "rect", isAvailable: true }
    ]
  }
];
