from typing import List
from sqlalchemy import Text, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass

class Recipe(Base):
    """
    Recipe model representing the recipes table.
    Steps are stored in a separate table.
    """
    __tablename__ = "recipes"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(index=True)
    description: Mapped[str] = mapped_column(Text)
    ingredients: Mapped[str] = mapped_column(Text)
    cooking_time: Mapped[int] = mapped_column()
    servings: Mapped[int] = mapped_column()

    # Relationsip to steps
    steps: Mapped[List["Step"]] = relationship(
        "Step",
        back_populates="recipe",
        cascade="all, delete-orphan"
    )

class Step(Base):
    """
    Step model representing the steps table.
    Many-to-one relationship with Recipe.
    """
    __tablename__ = "steps"

    id: Mapped[int] = mapped_column(primary_key=True)
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.id"))
    step_number: Mapped[int] = mapped_column()
    instruction: Mapped[str] = mapped_column(Text)

    # Relationship to recipe
    recipe: Mapped["Recipe"] = relationship("Recipe", back_populates="steps")