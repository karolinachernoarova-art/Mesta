# RestBook

Мобильное web-приложение для поиска и бронирования отелей и ресторанов.

## Архитектура

Проект разделён на frontend и backend, но в production запускается как один web-сервис:

```text
backend/
  config.py          # настройки окружений
  extensions.py      # Flask extensions: db, jwt, migrate
  models.py          # SQLAlchemy models
  security.py        # auth/admin helpers
  routes/            # API blueprints
  services/          # интеграции, например GigaChat
src/
  api/               # typed API client для frontend
  components/
  pages/
app.py               # WSGI entrypoint для Gunicorn
init_db.py           # сидирование демо-данных
```

- `/api/*` обслуживает Flask API.
- `/` и frontend-роуты обслуживаются Flask из папки `dist`.
- В разработке Vite проксирует `/api` на Flask.
- Для изменения схемы БД подключён `Flask-Migrate/Alembic`.

## Локальный запуск

Backend:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python init_db.py
python app.py
```

Frontend:

```bash
npm install
npm run dev
```

Откройте `http://localhost:3000`.

## Миграции базы данных

Первичная инициализация миграций:

```bash
export FLASK_APP=app.py
flask db init
flask db migrate -m "Initial schema"
flask db upgrade
```

После изменения моделей:

```bash
flask db migrate -m "Describe change"
flask db upgrade
```

Для простого демо-запуска `python init_db.py` всё ещё создаёт таблицы и демо-данные.

## Деплой на Ubuntu VPS

### 1. Установить пакеты

```bash
sudo apt update
sudo apt install -y python3-venv python3-pip mysql-server nginx curl
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2. Создать базу

```bash
sudo mysql
```

```sql
CREATE DATABASE restbook CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'restbook'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON restbook.* TO 'restbook'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Подготовить проект

```bash
sudo mkdir -p /var/www/restbook
sudo chown -R $USER:$USER /var/www/restbook
cd /var/www/restbook
```

Скопируйте файлы проекта в `/var/www/restbook`, затем:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
nano .env
```

Минимальный `.env` для VPS:

```bash
MYSQL_URL="mysql+pymysql://restbook:strong_password_here@127.0.0.1/restbook"
JWT_SECRET_KEY="long_random_secret"
GIGACHAT_AUTH_DATA=""
FLASK_ENV="production"
```

Инициализируйте БД:

```bash
python init_db.py
```

### 4. Собрать frontend

```bash
npm install
npm run build
```

### 5. Systemd

```bash
sudo nano /etc/systemd/system/restbook.service
```

```ini
[Unit]
Description=RestBook Web App
After=network.target mysql.service

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/restbook
EnvironmentFile=/var/www/restbook/.env
ExecStart=/var/www/restbook/.venv/bin/gunicorn -w 2 -b 127.0.0.1:5000 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo chown -R www-data:www-data /var/www/restbook
sudo systemctl daemon-reload
sudo systemctl enable --now restbook
sudo systemctl status restbook
```

### 6. Nginx

```bash
sudo nano /etc/nginx/sites-available/restbook
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/restbook /etc/nginx/sites-enabled/restbook
sudo nginx -t
sudo systemctl reload nginx
```

HTTPS:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Проверка

```bash
curl http://127.0.0.1:5000/api/health
curl http://127.0.0.1:5000/api/places
sudo journalctl -u restbook -f
```
