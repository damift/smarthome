# Smarthome (React + Laravel + MySQL + Docker)

Dit project draait met **Docker Compose** en bestaat uit:
- **Backend**: Laravel (PHP-FPM) + Nginx
- **Frontend**: React (Vite)
- **Database**: MySQL 8
- **phpMyAdmin**: web UI voor MySQL

---

## Vereisten
- **Docker Desktop** (Windows/Mac/Linux)
- **Git**
- (Optioneel) **VS Code**

> Alles runnen we in Docker. Je hoeft dus geen PHP/Composer/Node lokaal te installeren.

---

## Projectstructuur
```
smarthome/
  Backend/          # Laravel
  Frontend/         # React (Vite)
  Docker/           # Dockerfiles + Nginx config
  docker-compose.yml
```

---

## Snel starten (1e keer)

### 1) Repo clonen
```bash
git clone <REPO_URL>
cd smarthome
```

### 2) Containers builden + starten
```bash
docker compose build
docker compose up -d
```

### 3) Laravel .env instellen
In `Backend/`:
- Kopieer `.env.example` naar `.env` (als die er nog niet is)

**Belangrijk (DB settings in Backend/.env):**
```env
DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=smarthome_simple
DB_USERNAME=app
DB_PASSWORD=app

SESSION_DRIVER=file
```

### 4) Laravel key + migrations
```bash
docker compose exec backend php artisan key:generate
docker compose exec backend php artisan migrate
docker compose exec backend php artisan optimize:clear
```

### 5) (Windows/Docker) permissies fixen voor storage (als je 500 errors krijgt)
```bash
docker compose exec backend sh -lc "mkdir -p storage/framework/{cache,sessions,views} bootstrap/cache"
docker compose exec backend sh -lc "chmod -R 775 storage bootstrap/cache"
docker compose exec backend php artisan optimize:clear
```

---

## Frontend (React) starten

De frontend container start automatisch. Open:
- **React**: http://localhost:5173
- **Laravel**: http://localhost:8080

> Als de Frontend map nog leeg is of je krijgt errors, (her)start:
```bash
docker compose restart frontend
```

---

## Handige URLs
- Laravel (Nginx): **http://localhost:8080**
- Laravel API (voorbeeld): **http://localhost:8080/api/health**
- React (Vite): **http://localhost:5173**
- phpMyAdmin: **http://localhost:8081**
- MySQL (host machine): `127.0.0.1:3307`

### phpMyAdmin login
- Server/Host: `db` (als gevraagd)
- Username: `root`  Password: `root`
- of Username: `app` Password: `app`

---

## Dagelijks starten/stoppen
Start:
```bash
docker compose up -d
```

Stop:
```bash
docker compose down
```

Logs bekijken:
```bash
docker compose logs -f
```

---

## Veel voorkomende problemen

### 1) Laravel 500 “Permission denied” (storage/framework/views)
Fix:
```bash
docker compose exec backend sh -lc "chmod -R 775 storage bootstrap/cache"
docker compose exec backend php artisan optimize:clear
```

### 2) “Table 'sessions' doesn't exist”
Gebruik file sessions (aanrader):
- Zet in `Backend/.env`: `SESSION_DRIVER=file`
- Daarna:
```bash
docker compose exec backend php artisan optimize:clear
```

(Als je per se DB sessions wil)
```bash
docker compose exec backend php artisan session:table
docker compose exec backend php artisan migrate
```

### 3) Poort bezet (8080/5173/8081/3307)
Pas poorten aan in `docker-compose.yml` en run:
```bash
docker compose down
docker compose up -d --build
```

---

## Development afspraken (simpel)
- Backend code: `Backend/`
- Frontend code: `Frontend/`
- Gebruik `docker compose exec backend ...` voor artisan/ composer commands
- Gebruik `docker compose exec frontend ...` alleen als nodig (meestal draait hij al)

---

## Commands cheatsheet
Laravel artisan:
```bash
docker compose exec backend php artisan <command>
```

Composer:
```bash
docker compose exec backend composer <command>
```

NPM in frontend:
```bash
docker compose exec frontend sh -lc "npm <command>"
```

---

## Done ✅
Als alles goed is, zie je:
- Laravel op **http://localhost:8080**
- React op **http://localhost:5173**
- phpMyAdmin op **http://localhost:8081**
