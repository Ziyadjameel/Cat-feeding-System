from time import time_ns
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Query, Response
from pydantic import BaseModel, ConfigDict, StringConstraints
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from database import Cat, Feeding, engine

app = FastAPI(title="Cat Feeding System")


def session():
    with Session(engine) as db:
        yield db


Database = Annotated[Session, Depends(session)]


class CatInput(BaseModel):
    name: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=60)]


class CatSummary(BaseModel):
    id: int
    name: str
    last_fed_at: int | None = None


class FeedingEntry(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    fed_at: int


def require_cat(db: Session, cat_id: int) -> None:
    if db.get(Cat, cat_id) is None:
        raise HTTPException(404, "Cat not found.")


@app.get("/cats")
def list_cats(db: Database) -> list[CatSummary]:
    last_fed = select(func.max(Feeding.fed_at)).where(Feeding.cat_id == Cat.id)
    rows = db.execute(select(Cat, last_fed.scalar_subquery()).order_by(Cat.id))
    return [
        CatSummary(id=cat.id, name=cat.name, last_fed_at=last_fed_at)
        for cat, last_fed_at in rows
    ]


@app.post("/cats", status_code=201)
def add_cat(body: CatInput, db: Database) -> CatSummary:
    cat = Cat(name=body.name)
    db.add(cat)
    db.flush()
    result = CatSummary(id=cat.id, name=cat.name)
    db.commit()
    return result


@app.get("/cats/{cat_id}/feedings")
def list_feedings(
    cat_id: int,
    db: Database,
    before: Annotated[int | None, Query(gt=0)] = None,
) -> list[FeedingEntry]:
    require_cat(db, cat_id)
    query = select(Feeding).where(Feeding.cat_id == cat_id)
    if before is not None:
        query = query.where(Feeding.id < before)
    entries = db.scalars(query.order_by(Feeding.id.desc()).limit(30))
    return [FeedingEntry.model_validate(entry) for entry in entries]


@app.post("/cats/{cat_id}/feedings", status_code=201)
def feed_cat(cat_id: int, db: Database) -> FeedingEntry:
    require_cat(db, cat_id)
    entry = Feeding(cat_id=cat_id, fed_at=time_ns() // 1_000_000)
    db.add(entry)
    db.flush()
    result = FeedingEntry.model_validate(entry)
    db.commit()
    return result


@app.delete("/cats/{cat_id}/feedings/{feeding_id}", status_code=204)
def remove_feeding(cat_id: int, feeding_id: int, db: Database) -> Response:
    entry = db.get(Feeding, feeding_id)
    if entry is None or entry.cat_id != cat_id:
        raise HTTPException(404, "Feeding not found.")
    db.delete(entry)
    db.commit()
    return Response(status_code=204)
