import time
from urllib.parse import quote

from sqlalchemy import inspect, text
from werkzeug.security import generate_password_hash

from app import app
from backend.extensions import db
from backend.models import Booking, Place, Review, Room, TableObj, User


def commons(filename):
    return f"https://commons.wikimedia.org/wiki/Special:FilePath/{quote(filename)}?width=1200"


HOTEL_IMAGES = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
]

RESTAURANT_IMAGES = [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=1200&q=80",
]


HOTELS = [
    {
        "id": "hotel_moscow_metropol",
        "name": "Метрополь Москва",
        "city": "Москва",
        "address": "Театральный проезд, 2",
        "latitude": 55.7592,
        "longitude": 37.6215,
        "rating": 4.8,
        "review_count": 1864,
        "average_price": 24500,
        "website": "https://metropol-moscow.ru",
        "contact_email": "owner.metropol@mesta.local",
        "image_url": commons("Moscow Hotel Metropol asv2018-08.jpg"),
        "description": "Исторический пятизвездочный отель рядом с Большим театром и Красной площадью. Подходит для деловых поездок, торжественных выходных и гостей, которым важны центр города, архитектура и высокий уровень сервиса.",
    },
    {
        "id": "hotel_spb_astoria",
        "name": "Астория",
        "city": "Санкт-Петербург",
        "address": "Большая Морская ул., 39",
        "latitude": 59.9324,
        "longitude": 30.3087,
        "rating": 4.9,
        "review_count": 1432,
        "average_price": 27500,
        "website": "https://www.roccofortehotels.com/hotels-and-resorts/hotel-astoria/",
        "contact_email": "astoria@mesta.local",
        "image_url": commons("4777-1. Saint Petersburg. Hotel Astoria.jpg"),
        "description": "Классический отель в нескольких минутах от Исаакиевского собора. Подходит для спокойных городских выходных, деловых поездок и размещения гостей, которые хотят остановиться в историческом центре.",
    },
    {
        "id": "hotel_sochi_radisson_collection_paradise",
        "name": "Radisson Collection Paradise Resort & Spa Sochi",
        "city": "Сочи",
        "address": "ул. 65 лет Победы, 50",
        "latitude": 43.4036,
        "longitude": 39.9556,
        "rating": 4.7,
        "review_count": 2280,
        "average_price": 19800,
        "website": "https://www.radissonhotels.com",
        "contact_email": "paradise-sochi@mesta.local",
        "image_url": "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80",
        "description": "Курортный отель у моря в Имеретинской низменности с семейными форматами размещения, spa-зоной и удобным доступом к набережной.",
    },
    {
        "id": "hotel_kazan_mirage",
        "name": "Мираж Казань",
        "city": "Казань",
        "address": "ул. Московская, 5",
        "latitude": 55.7975,
        "longitude": 49.1056,
        "rating": 4.6,
        "review_count": 914,
        "average_price": 11200,
        "website": "https://mirage-hotel.ru",
        "contact_email": "mirage@mesta.local",
        "image_url": commons("Отель Мираж (Казань).jpg"),
        "description": "Городской отель рядом с Казанским кремлем, удобный для туристических маршрутов, командировок и коротких остановок в центре.",
    },
    {
        "id": "hotel_novosibirsk_marriott",
        "name": "Novosibirsk Marriott Hotel",
        "city": "Новосибирск",
        "address": "ул. Орджоникидзе, 31",
        "latitude": 55.0312,
        "longitude": 82.9234,
        "rating": 4.7,
        "review_count": 1106,
        "average_price": 13500,
        "website": "https://www.marriott.com",
        "contact_email": "marriott-nsk@mesta.local",
        "image_url": commons("Marriott, Novosibirsk 1.jpg"),
        "description": "Современный отель в центре Новосибирска рядом с театром оперы и балета. Хорошо подходит для гостей города и деловых мероприятий.",
    },
    {
        "id": "hotel_ekb_hyatt",
        "name": "Hyatt Regency Ekaterinburg",
        "city": "Екатеринбург",
        "address": "ул. Бориса Ельцина, 8",
        "latitude": 56.8448,
        "longitude": 60.5919,
        "rating": 4.8,
        "review_count": 987,
        "average_price": 17100,
        "website": "https://www.hyatt.com",
        "contact_email": "hyatt-ekb@mesta.local",
        "image_url": commons("Гостиница Hyatt Regency Ekaterinburg.jpg"),
        "description": "Пятизвездочный отель в деловом квартале Екатеринбурга с видами на центр города и удобной инфраструктурой для бизнес-поездок.",
    },
    {
        "id": "hotel_vladivostok_lotte",
        "name": "LOTTE Hotel Vladivostok",
        "city": "Владивосток",
        "address": "ул. Семеновская, 29",
        "latitude": 43.1198,
        "longitude": 131.8878,
        "rating": 4.6,
        "review_count": 742,
        "average_price": 12800,
        "website": "https://www.lottehotel.com",
        "contact_email": "lotte-vladivostok@mesta.local",
        "image_url": "https://images.unsplash.com/photo-1576675466969-38eeae4b41f6?auto=format&fit=crop&w=1200&q=80",
        "description": "Отель в центральной части Владивостока, удобный для прогулок к набережной, деловых встреч и транзитных поездок по Дальнему Востоку.",
    },
    {
        "id": "hotel_paris_le_bristol",
        "name": "Le Bristol Paris",
        "city": "Париж",
        "address": "112 Rue du Faubourg Saint-Honore",
        "latitude": 48.8718,
        "longitude": 2.3142,
        "rating": 4.9,
        "review_count": 2140,
        "average_price": 98000,
        "website": "https://www.oetkercollection.com/hotels/le-bristol-paris/",
        "contact_email": "lebristol@mesta.local",
        "image_url": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
        "description": "Легендарный парижский отель класса palace на Rue du Faubourg Saint-Honore. Выбор для путешественников, которым важны приватность, гастрономия и безупречный уровень сервиса.",
    },
    {
        "id": "hotel_dubai_atlantis",
        "name": "Atlantis The Palm",
        "city": "Дубай",
        "address": "Crescent Road, The Palm Jumeirah",
        "latitude": 25.1304,
        "longitude": 55.1171,
        "rating": 4.7,
        "review_count": 19630,
        "average_price": 52000,
        "website": "https://www.atlantis.com",
        "contact_email": "atlantis@mesta.local",
        "image_url": commons("Atlantis, The Palm from Le Royal Méridien Beach Resort and Spa in Dubai 3.jpg"),
        "description": "Крупный курортный комплекс на Palm Jumeirah с семейными и премиальными форматами размещения, пляжной инфраструктурой, ресторанами и развлечениями на территории.",
    },
]

RESTAURANTS = [
    {
        "id": "rest_moscow_white_rabbit",
        "name": "White Rabbit",
        "city": "Москва",
        "address": "Смоленская площадь, 3",
        "latitude": 55.7475,
        "longitude": 37.5822,
        "rating": 4.7,
        "review_count": 3210,
        "average_price": 6500,
        "website": "https://whiterabbitmoscow.ru",
        "contact_email": "owner.white-rabbit@mesta.local",
        "image_url": commons("Интерьер ресторана White Rabbit.jpg"),
        "description": "Панорамный ресторан современной российской кухни с выразительным видом на центр Москвы. Для бронирования доступны места у окна, основная посадка и столы для небольших компаний.",
    },
    {
        "id": "rest_moscow_savva",
        "name": "SAVVA",
        "city": "Москва",
        "address": "Театральный проезд, 2",
        "latitude": 55.7590,
        "longitude": 37.6217,
        "rating": 4.8,
        "review_count": 1348,
        "average_price": 7200,
        "website": "https://savvarest.ru",
        "contact_email": "savva@mesta.local",
        "image_url": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
        "description": "Ресторан авторской кухни в историческом центре Москвы. Подходит для ужинов по особому поводу, деловых встреч и спокойных вечерних бронирований.",
    },
    {
        "id": "rest_spb_cococo",
        "name": "COCOCO Bistro",
        "city": "Санкт-Петербург",
        "address": "Вознесенский проспект, 6",
        "latitude": 59.9347,
        "longitude": 30.3065,
        "rating": 4.6,
        "review_count": 1590,
        "average_price": 4300,
        "website": "https://cococobistro.ru",
        "contact_email": "cococo@mesta.local",
        "image_url": "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80",
        "description": "Петербургский ресторан с акцентом на локальные продукты, сезонное меню и спокойную городскую атмосферу. В зале есть компактные столики, семейные зоны и барная посадка.",
    },
    {
        "id": "rest_kazan_tugan_avylym",
        "name": "Туган Авылым",
        "city": "Казань",
        "address": "ул. Туфана Миннуллина, 14/56",
        "latitude": 55.7827,
        "longitude": 49.1340,
        "rating": 4.6,
        "review_count": 2840,
        "average_price": 2500,
        "website": "https://tugan-avilim.ru",
        "contact_email": "tugan-avylym@mesta.local",
        "image_url": "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?auto=format&fit=crop&w=1200&q=80",
        "description": "Ресторанный комплекс татарской кухни в этническом стиле. Хороший вариант для знакомства с национальными блюдами, семейного обеда и ужина большой компанией.",
    },
    {
        "id": "rest_sochi_barceloneta",
        "name": "Barceloneta",
        "city": "Сочи",
        "address": "ул. Несебрская, 6",
        "latitude": 43.5814,
        "longitude": 39.7206,
        "rating": 4.5,
        "review_count": 1765,
        "average_price": 3200,
        "website": "https://barceloneta-sochi.ru",
        "contact_email": "barceloneta@mesta.local",
        "image_url": "https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=1200&q=80",
        "description": "Средиземноморский ресторан рядом с морским вокзалом. Посадка разделена на зал у окон, центральную линию и столы для больших компаний.",
    },
    {
        "id": "rest_nsk_goodman",
        "name": "GOODMAN Steak House",
        "city": "Новосибирск",
        "address": "Вокзальная магистраль, 16",
        "latitude": 55.0346,
        "longitude": 82.9135,
        "rating": 4.5,
        "review_count": 884,
        "average_price": 3800,
        "website": "https://goodman.ru",
        "contact_email": "owner.nsk-goodman@mesta.local",
        "image_url": "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80",
        "description": "Стейк-хаус в центре Новосибирска с плотной посадкой, диванной зоной и большим столом для компаний. Подходит для деловых ужинов и встреч после работы.",
    },
    {
        "id": "rest_ekb_troyekurov",
        "name": "Троекуровъ",
        "city": "Екатеринбург",
        "address": "ул. Малышева, 137",
        "latitude": 56.8382,
        "longitude": 60.6378,
        "rating": 4.7,
        "review_count": 930,
        "average_price": 4200,
        "website": "https://troekurov.com",
        "contact_email": "troekurov@mesta.local",
        "image_url": "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=1200&q=80",
        "description": "Ресторан русской кухни с камерной атмосферой, отдельными столами для приватного ужина и основной посадкой для небольших компаний.",
    },
    {
        "id": "rest_vladivostok_zuma",
        "name": "Zuma",
        "city": "Владивосток",
        "address": "ул. Фонтанная, 2",
        "latitude": 43.1191,
        "longitude": 131.8856,
        "rating": 4.7,
        "review_count": 2460,
        "average_price": 3600,
        "website": "https://zuma-vl.ru",
        "contact_email": "zuma@mesta.local",
        "image_url": "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?auto=format&fit=crop&w=1200&q=80",
        "description": "Популярный дальневосточный ресторан с морепродуктами и паназиатской кухней. В зале есть столики для пары, семейные места и посадка для больших компаний.",
    },
    {
        "id": "rest_paris_septime",
        "name": "Septime",
        "city": "Париж",
        "address": "80 Rue de Charonne",
        "latitude": 48.8537,
        "longitude": 2.3806,
        "rating": 4.6,
        "review_count": 1320,
        "average_price": 11000,
        "website": "https://www.septime-charonne.fr",
        "contact_email": "septime@mesta.local",
        "image_url": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
        "description": "Современный парижский ресторан с лаконичным интерьером и дегустационным меню. Подходит для вечерних бронирований и знакомства с авторской европейской кухней.",
    },
]


ROOM_TYPES = [
    ("Стандарт", "Уютный номер с рабочим местом, ванной комнатой и базовым набором удобств.", 1.0, 2, ["Wi-Fi", "Кондиционер", "Телевизор", "Рабочее место"]),
    ("Комфорт", "Более просторный номер для пары или гостя в длительной поездке.", 1.28, 2, ["Wi-Fi", "Кондиционер", "Мини-бар", "Халаты", "Сейф"]),
    ("Делюкс", "Номер повышенной категории с зоной отдыха и улучшенным видом.", 1.65, 3, ["Wi-Fi", "Завтрак", "Мини-бар", "Кофемашина", "Вид из окна"]),
    ("Семейный номер", "Практичный вариант для семьи: две спальные зоны и дополнительное место.", 1.9, 4, ["Wi-Fi", "Завтрак", "Детская кроватка", "Две спальные зоны"]),
    ("Люкс", "Просторный номер с гостиной зоной, расширенными удобствами и поздним выездом.", 2.55, 4, ["Wi-Fi", "Завтрак", "Гостиная зона", "Кофемашина", "Поздний выезд"]),
]

TABLE_LAYOUT = [
    ("01", 2, 15, 17, "circle", True),
    ("02", 2, 38, 17, "circle", True),
    ("03", 4, 62, 17, "rect", True),
    ("04", 4, 85, 17, "rect", False),
    ("05", 2, 18, 37, "circle", True),
    ("06", 4, 43, 37, "rect", True),
    ("07", 6, 70, 37, "rect", True),
    ("08", 2, 90, 39, "circle", True),
    ("09", 4, 20, 57, "rect", True),
    ("10", 2, 45, 58, "circle", False),
    ("11", 6, 72, 58, "rect", True),
    ("12", 4, 91, 60, "rect", True),
    ("13", 2, 16, 78, "circle", True),
    ("14", 4, 40, 79, "rect", True),
    ("15", 6, 67, 80, "rect", True),
    ("16", 8, 88, 81, "rect", True),
]

RESTAURANT_TABLE_LAYOUTS = {
    "rest_moscow_white_rabbit": [
        ("01", 2, 16, 22, "circle", True), ("02", 2, 34, 22, "circle", True), ("03", 4, 54, 22, "rect", True), ("04", 4, 73, 22, "rect", False),
        ("05", 2, 20, 43, "circle", True), ("06", 4, 41, 43, "rect", True), ("07", 6, 63, 44, "rect", True), ("08", 2, 83, 45, "circle", True),
        ("09", 4, 24, 65, "rect", True), ("10", 2, 47, 66, "circle", False), ("11", 6, 70, 66, "rect", True),
        ("12", 2, 18, 84, "circle", True), ("13", 4, 39, 84, "rect", True), ("14", 4, 60, 84, "rect", True), ("15", 6, 82, 84, "rect", True),
    ],
    "rest_moscow_savva": [
        ("01", 2, 18, 18, "circle", True), ("02", 4, 42, 18, "rect", True), ("03", 2, 66, 18, "circle", True), ("04", 4, 84, 23, "rect", True),
        ("05", 6, 24, 40, "rect", True), ("06", 4, 52, 41, "rect", False), ("07", 2, 78, 43, "circle", True),
        ("08", 2, 15, 63, "circle", True), ("09", 4, 38, 63, "rect", True), ("10", 6, 66, 64, "rect", True), ("11", 2, 88, 66, "circle", True),
        ("12", 4, 23, 84, "rect", True), ("13", 4, 50, 84, "rect", True), ("14", 8, 78, 84, "rect", True),
    ],
    "rest_spb_cococo": [
        ("01", 2, 14, 16, "circle", True), ("02", 2, 31, 16, "circle", True), ("03", 2, 48, 16, "circle", True), ("04", 2, 65, 16, "circle", True), ("05", 2, 82, 16, "circle", False),
        ("06", 4, 22, 38, "rect", True), ("07", 4, 50, 38, "rect", True), ("08", 4, 78, 38, "rect", True),
        ("09", 2, 18, 60, "circle", True), ("10", 6, 47, 61, "rect", True), ("11", 2, 78, 60, "circle", True),
        ("12", 4, 24, 82, "rect", True), ("13", 4, 54, 82, "rect", False), ("14", 6, 82, 82, "rect", True),
    ],
    "rest_kazan_tugan_avylym": [
        ("01", 6, 20, 20, "rect", True), ("02", 8, 50, 20, "rect", True), ("03", 6, 80, 20, "rect", True),
        ("04", 4, 17, 43, "rect", True), ("05", 4, 39, 43, "rect", True), ("06", 4, 61, 43, "rect", False), ("07", 4, 83, 43, "rect", True),
        ("08", 2, 22, 65, "circle", True), ("09", 6, 50, 66, "rect", True), ("10", 2, 78, 65, "circle", True),
        ("11", 8, 31, 85, "rect", True), ("12", 8, 69, 85, "rect", True),
    ],
    "rest_sochi_barceloneta": [
        ("01", 2, 13, 22, "circle", True), ("02", 4, 34, 22, "rect", True), ("03", 4, 57, 22, "rect", True), ("04", 2, 80, 22, "circle", True),
        ("05", 4, 18, 45, "rect", False), ("06", 6, 47, 45, "rect", True), ("07", 4, 76, 45, "rect", True),
        ("08", 2, 15, 68, "circle", True), ("09", 4, 38, 68, "rect", True), ("10", 4, 61, 68, "rect", True), ("11", 2, 84, 68, "circle", True),
        ("12", 6, 28, 86, "rect", True), ("13", 6, 72, 86, "rect", True),
    ],
    "rest_nsk_goodman": [
        ("01", 4, 18, 18, "rect", True), ("02", 4, 42, 18, "rect", True), ("03", 4, 66, 18, "rect", True), ("04", 6, 86, 20, "rect", True),
        ("05", 2, 17, 40, "circle", True), ("06", 4, 42, 41, "rect", False), ("07", 8, 72, 42, "rect", True),
        ("08", 4, 20, 64, "rect", True), ("09", 4, 46, 64, "rect", True), ("10", 6, 74, 64, "rect", True),
        ("11", 2, 16, 85, "circle", True), ("12", 4, 39, 85, "rect", True), ("13", 4, 62, 85, "rect", True), ("14", 6, 85, 85, "rect", True),
    ],
    "rest_ekb_troyekurov": [
        ("01", 2, 18, 20, "circle", True), ("02", 2, 42, 20, "circle", True), ("03", 4, 68, 20, "rect", True),
        ("04", 6, 25, 44, "rect", True), ("05", 4, 54, 44, "rect", True), ("06", 2, 82, 44, "circle", False),
        ("07", 4, 20, 66, "rect", True), ("08", 6, 50, 67, "rect", True), ("09", 4, 80, 66, "rect", True),
        ("10", 2, 18, 86, "circle", True), ("11", 4, 45, 86, "rect", True), ("12", 6, 76, 86, "rect", True),
    ],
    "rest_vladivostok_zuma": [
        ("01", 2, 14, 18, "circle", True), ("02", 2, 30, 18, "circle", True), ("03", 4, 52, 18, "rect", True), ("04", 4, 76, 18, "rect", True),
        ("05", 2, 18, 40, "circle", False), ("06", 4, 43, 40, "rect", True), ("07", 6, 70, 41, "rect", True),
        ("08", 2, 14, 63, "circle", True), ("09", 4, 36, 63, "rect", True), ("10", 4, 59, 63, "rect", True), ("11", 2, 84, 63, "circle", True),
        ("12", 6, 24, 84, "rect", True), ("13", 4, 52, 84, "rect", True), ("14", 8, 82, 84, "rect", True),
    ],
    "rest_paris_septime": [
        ("01", 2, 17, 18, "circle", True), ("02", 2, 38, 18, "circle", True), ("03", 2, 59, 18, "circle", True), ("04", 2, 80, 18, "circle", True),
        ("05", 4, 24, 42, "rect", True), ("06", 4, 50, 42, "rect", True), ("07", 4, 76, 42, "rect", False),
        ("08", 2, 18, 66, "circle", True), ("09", 2, 38, 66, "circle", True), ("10", 4, 62, 66, "rect", True), ("11", 2, 84, 66, "circle", True),
        ("12", 4, 30, 86, "rect", True), ("13", 4, 70, 86, "rect", True),
    ],
}

REVIEW_AUTHORS = [
    "Анна Смирнова",
    "Илья Кузнецов",
    "Мария Волкова",
    "Дмитрий Орлов",
    "Екатерина Новикова",
    "Алексей Морозов",
]

HOTEL_REVIEWS = [
    (5, "Очень удобное расположение, быстрое заселение и внимательный персонал. Номер чистый, постель отличная, после дороги получилось нормально отдохнуть."),
    (5, "Понравились завтраки и спокойная атмосфера. В номере было тихо, все необходимое под рукой, до основных мест города легко добраться пешком."),
    (4, "Хороший вариант для поездки на выходные. Номер аккуратный, сервис ровный, но хотелось бы чуть больше места для хранения вещей."),
    (5, "Бронировали семейный номер, все прошло без накладок. Персонал помог с ранним заездом, за это отдельное спасибо."),
    (4, "Отель оставил приятное впечатление: чисто, красиво, удобная кровать. Цена высокая, но уровень в целом соответствует."),
]

RESTAURANT_REVIEWS = [
    (5, "Отличный ужин: блюда подали вовремя, официант хорошо ориентировался в меню, столик оказался именно в той зоне, которую выбирали."),
    (5, "Очень приятная атмосфера и красивая подача. Бронирование прошло быстро, посадка без ожидания, вечер получился спокойным."),
    (4, "Кухня понравилась, особенно горячие блюда. В зале было оживленно, но персонал справлялся и регулярно подходил к столику."),
    (5, "Хорошее место для встречи с друзьями. Удобно, что заранее видно расположение столов и можно выбрать подходящий вариант."),
    (4, "Вкусно и аккуратно по сервису. Немного шумно в час пик, зато посадка удобная и интерьер располагает к долгому ужину."),
]


def place_from_data(data, place_type):
    images = HOTEL_IMAGES if place_type == "отель" else RESTAURANT_IMAGES
    gallery = [data["image_url"], *[image for image in images if image != data["image_url"]]][:4]
    return Place(
        id=data["id"],
        name=data["name"],
        type=place_type,
        description=data["description"],
        address=data["address"],
        city=data["city"],
        latitude=data["latitude"],
        longitude=data["longitude"],
        image_url=data["image_url"],
        images=gallery,
        contact_phone="Уточняется на сайте",
        contact_email=data.get("contact_email"),
        website=data["website"],
        rating=data["rating"],
        review_count=data["review_count"],
        average_price=data["average_price"],
    )


def make_rooms(hotel):
    rooms = []
    base_price = hotel["average_price"]
    for index, (name, description, multiplier, capacity, amenities) in enumerate(ROOM_TYPES, start=1):
        rooms.append(
            Room(
                id=f"{hotel['id']}_room_{index}",
                place_id=hotel["id"],
                name=name,
                description=description,
                price=round(base_price * multiplier / 100) * 100,
                capacity=capacity,
                amenities=amenities,
                image_url=HOTEL_IMAGES[index % len(HOTEL_IMAGES)],
            )
        )
    return rooms


def make_tables(restaurant):
    layout = RESTAURANT_TABLE_LAYOUTS.get(restaurant["id"], TABLE_LAYOUT)
    return [
        TableObj(
            id=f"{restaurant['id']}_table_{number}",
            place_id=restaurant["id"],
            number=number,
            seats=seats,
            x=x,
            y=y,
            shape=shape,
            is_available=is_available,
        )
        for number, seats, x, y, shape, is_available in layout
    ]


def make_reviews(place, place_type):
    templates = HOTEL_REVIEWS if place_type == "отель" else RESTAURANT_REVIEWS
    created_at = time.time() - 86400 * 12
    reviews = []

    for index, (rating, comment) in enumerate(templates, start=1):
        reviews.append(
            Review(
                place_id=place["id"],
                user_id=None,
                user_name=REVIEW_AUTHORS[(index - 1) % len(REVIEW_AUTHORS)],
                rating=rating,
                comment=comment,
                images=[],
                created_at=created_at + index * 86400,
            )
        )

    place["rating"] = round(sum(r.rating for r in reviews) / len(reviews), 1)
    place["review_count"] = len(reviews)
    return reviews


def ensure_schema_columns():
    place_columns = {column["name"] for column in inspect(db.engine).get_columns("place")}
    if "contact_email" not in place_columns:
        db.session.execute(text("ALTER TABLE place ADD COLUMN contact_email VARCHAR(120) NULL"))
    db.session.commit()


def ensure_owner_demo_accounts():
    samples = [
        "owner.white-rabbit@mesta.local",
        "owner.metropol@mesta.local",
        "owner.nsk-goodman@mesta.local",
    ]
    password_hash = generate_password_hash("owner123")
    for email in samples:
        user = User.query.filter_by(email=email).first()
        if user:
            user.password_hash = password_hash
            continue
        db.session.add(
            User(
                email=email,
                password_hash=password_hash,
            )
        )


def seed_database():
    with app.app_context():
        db.create_all()
        ensure_schema_columns()

        print("Clearing demo content...")
        Booking.query.delete()
        Review.query.delete()
        Room.query.delete()
        TableObj.query.delete()
        Place.query.delete()

        print("Seeding places, rooms and restaurant halls...")
        places = [place_from_data(item, "отель") for item in HOTELS]
        places += [place_from_data(item, "ресторан") for item in RESTAURANTS]
        db.session.add_all(places)
        db.session.flush()

        for hotel in HOTELS:
            db.session.add_all(make_rooms(hotel))

        for restaurant in RESTAURANTS:
            db.session.add_all(make_tables(restaurant))

        for hotel in HOTELS:
            reviews = make_reviews(hotel, "отель")
            place = db.session.get(Place, hotel["id"])
            place.rating = hotel["rating"]
            place.review_count = hotel["review_count"]
            db.session.add_all(reviews)

        for restaurant in RESTAURANTS:
            reviews = make_reviews(restaurant, "ресторан")
            place = db.session.get(Place, restaurant["id"])
            place.rating = restaurant["rating"]
            place.review_count = restaurant["review_count"]
            db.session.add_all(reviews)

        ensure_owner_demo_accounts()

        db.session.commit()
        print(f"Seeded {len(HOTELS)} hotels, {len(RESTAURANTS)} restaurants, {len(HOTELS) * len(ROOM_TYPES)} rooms, {len(RESTAURANTS) * len(TABLE_LAYOUT)} tables and {(len(HOTELS) + len(RESTAURANTS)) * 5} reviews.")


if __name__ == "__main__":
    seed_database()
