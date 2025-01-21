from typing import Optional
from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    pass

class Recipe(Base):
    __tablename__ = "recipes"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(index=True)
    description: Mapped[str] = mapped_column(Text)
    ingredients: Mapped[str] = mapped_column(Text)
    steps: Mapped[str] = mapped_column(Text)
    cooking_time: Mapped[int] = mapped_column()
    servings: Mapped[int] = mapped_column()