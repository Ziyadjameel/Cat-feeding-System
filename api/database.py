from os import environ

from sqlalchemy import BigInteger, ForeignKey, Index, String, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

engine = create_engine(environ.get("DATABASE_URL", "sqlite:///./feeding.sqlite3"))


class Base(DeclarativeBase):
    pass


class Cat(Base):
    __tablename__ = "cats"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(60))


class Feeding(Base):
    __tablename__ = "feedings"
    __table_args__ = (
        Index("ix_feedings_cat_time", "cat_id", "fed_at", "id"),
        {"sqlite_autoincrement": True},
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    cat_id: Mapped[int] = mapped_column(ForeignKey("cats.id"))
    # Milliseconds since the Unix epoch, independent of the database timezone.
    fed_at: Mapped[int] = mapped_column(BigInteger)
