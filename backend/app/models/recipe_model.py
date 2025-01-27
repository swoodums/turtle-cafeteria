from typing import List, Optional
from sqlalchemy import Text, ForeignKey, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass

class Recipe(Base):
    """
    Recipe model representing the recipes table.
    Directions are stored in a separate table.
    """
    __tablename__ = "recipes"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(index=True)
    description: Mapped[str] = mapped_column(Text)
    ingredients: Mapped[str] = mapped_column(Text)
    cooking_time: Mapped[int] = mapped_column()
    servings: Mapped[int] = mapped_column()

    # Relationship to directions
    directions: Mapped[List["Direction"]] = relationship(
        "Direction",
        back_populates="recipe",
        cascade="all, delete-orphan"
    )
    #Relationship to recipe_ingredients
    recipe_ingredients: Mapped[List["RecipeIngredient"]] = relationship(
        "RecipeIngredient",
        back_populates="recipe",
        cascade="all, delete-orphan"
    )

class Direction(Base):
    """
    Direction model representing the directions table.
    Many-to-one relationship with Recipe.
    """
    __tablename__ = "directions"

    id: Mapped[int] = mapped_column(primary_key=True)
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.id"))
    direction_number: Mapped[int] = mapped_column()
    instruction: Mapped[str] = mapped_column(Text)

    # Relationship to recipe
    recipe: Mapped["Recipe"] = relationship("Recipe", back_populates="directions")

    # Ensure values for direction_number are unique for a given recipe
    # Add unique constraint for recipe_id & direction_id combination
    __table_args__ = (
        UniqueConstraint('recipe_id', 'direction_number', name='unique_recipe_direction'),
    )

class RecipeIngredient(Base):
    """
    Recipe Ingredients model representing the recipe_ingredients table
    Many-to-one relationship with Recipe
    """
    __tablename__ = "recipe_ingredients"

    id: Mapped[int] = mapped_column(primary_key=True)
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.id"))
    name: Mapped[str] = mapped_column()
    quantity: Mapped[float] = mapped_column()
    unit: Mapped[str] = mapped_column()

    # Relationship to recipe
    recipe: Mapped["Recipe"] = relationship("Recipe", back_populates="recipe_ingredients")