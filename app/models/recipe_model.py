from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    ingredients = Column(Text)
    steps = Column(Text)
    cooking_time = Column(Integer) # in minutes
    servings = Column(Integer)