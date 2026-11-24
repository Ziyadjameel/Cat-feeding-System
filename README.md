# Cat-feeding-System
A simple app so I can track when the last time my cats ate :)

## First version

- Log a feeding for each cat with a **Feed now** button.
- See when each cat was last fed and how much time has passed.
- Review feeding history and correct accidental entries.

## Planned stack

- `mobile/` will contain the iOS and Android app built with Expo, React Native, and TypeScript.
- `api/` will contain the FastAPI backend, with SQLAlchemy for database access and Alembic for migrations.
- SQLite will support local development. PostgreSQL will support a deployed API that shares feeding records across devices.
