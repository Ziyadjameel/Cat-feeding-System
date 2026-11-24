# Cat-feeding-System
A simple app so I can track when the last time my cats ate :)

## First version

- Log a feeding for each cat with a **Feed now** button.
- See when each cat was last fed and how much time has passed.
- Review feeding history and correct accidental entries.

## Stack

- `mobile/` contains the iOS and Android app built with Expo, React Native, and TypeScript.
- `api/` contains the FastAPI backend, with SQLAlchemy for database access and Alembic for migrations.
- SQLite is the default for local development. PostgreSQL is available when deploying a shared API.

## Run locally

You need Python 3.12, Node.js compatible with Expo SDK 58, and npm.

Start the API from the repository root:

```sh
cd api
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --host 0.0.0.0 --port 8000
```

Open `http://localhost:8000/docs` for the interactive API docs. The default SQLite database is stored at `api/feeding.sqlite3`. To use PostgreSQL, set `DATABASE_URL` to a `postgresql+psycopg://` connection URL before running migrations and starting the API.

In a second terminal, from the repository root:

```sh
cd mobile
npm ci
npm start
```

For a physical phone, create `mobile/.env.local` with `EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_LAN_IP:8000`. Keep the phone and computer on the same network, then scan Expo's QR code with a compatible Expo Go client. The app defaults to `http://10.0.2.2:8000` on the Android emulator and `http://localhost:8000` on the iOS simulator.

The development API has no sign-in. Run it on a trusted local network.

### Verify the mobile project

```sh
cd mobile
npm run lint
npm run typecheck
```
