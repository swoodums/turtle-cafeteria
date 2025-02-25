# backend/tests/conftest.py

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import get_db
from app.models.base import Base
from app.models.ingredient_model import IngredientCategory
from app.models.measurement_model import MeasurementUnit, UnitCategory

# Create test database engine
# We create this at module level since it's used by multiple fixtures
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# Create TestingSessionLocal class for database sessions
TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def seed_measurement_units(db_session):
    """Seed the measurement units table with standard units"""
    # Volume units
    volume_units = [
        MeasurementUnit(
            id=3,
            name="Teaspoon",
            abbreviation="tsp",
            category=UnitCategory.VOLUME,
            is_metric=False,
            is_common=True
        ),
        MeasurementUnit(
            id=4,
            name="Tablespoon",
            abbreviation="tbsp",
            category=UnitCategory.VOLUME,
            is_metric=False,
            is_common=True
        ),
        MeasurementUnit(
            id=6,
            name="Cup",
            abbreviation="cup",
            category=UnitCategory.VOLUME,
            is_metric=False,
            is_common=True
        ),
        MeasurementUnit(
            id=1,
            name="Milliliter",
            abbreviation="ml",
            category=UnitCategory.VOLUME,
            is_metric=True,
            is_common=True
        ),
        MeasurementUnit(
            id=2,
            name="Liter",
            abbreviation="L",
            category=UnitCategory.VOLUME,
            is_metric=True,
            is_common=True
        )
    ]

    # Weight units
    weight_units = [
        MeasurementUnit(
            id=11,
            name="Gram",
            abbreviation="g",
            category=UnitCategory.WEIGHT,
            is_metric=True,
            is_common=True
        ),
        MeasurementUnit(
            id=12,
            name="Kilogram",
            abbreviation="kg",
            category=UnitCategory.WEIGHT,
            is_metric=True,
            is_common=True
        ),
        MeasurementUnit(
            id=13,
            name="Ounce",
            abbreviation="oz",
            category=UnitCategory.WEIGHT,
            is_metric=False,
            is_common=True
        ),
        MeasurementUnit(
            id=14,
            name="Pound",
            abbreviation="lb",
            category=UnitCategory.WEIGHT,
            is_metric=False,
            is_common=True
        )
    ]

    # Count units
    count_units = [
        MeasurementUnit(
            id=15,
            name="Piece",
            abbreviation="pc",
            category=UnitCategory.COUNT,
            is_metric=False,
            is_common=True
        ),
        MeasurementUnit(
            id=16,
            name="Dozen",
            abbreviation="doz",
            category=UnitCategory.COUNT,
            is_metric=False,
            is_common=True
        )
    ]

    # Add all units to the session
    all_units = volume_units + weight_units + count_units
    for unit in all_units:
        db_session.add(unit)
    
    try:
        db_session.commit()
    except Exception as e:
        db_session.rollback()
        raise e

@pytest.fixture(scope="session")
def test_engine():
    """
    Provide the test database engine.
    The session scope means this engine is created once for all tests.
    """
    # Return the engine we created at module level
    return engine

@pytest.fixture
def test_db(test_engine):
    """
    Create test database tables before each test,
    and drop them after the test is complete.
    """
    # Create all tables
    Base.metadata.create_all(bind=test_engine)

    # Create a session to seed unit data
    session = TestingSessionLocal()
    try:
        # Seed measurement units
        seed_measurement_units(session)
        yield test_engine
    finally:
        session.close()
        Base.metadata.drop_all(bind=test_engine)

@pytest.fixture
def db_session(test_db):
    """
    Create a fresh database session for each test.
    This ensures test isolation - changes made in one test
    won't affect other tests.
    """
    connection = test_db.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    try:
        yield session
    finally:
        session.close()
        # Only rollback if the transaction is still active
        if transaction.is_active:
            transaction.rollback()
        connection.close()

@pytest.fixture
def client(db_session):
    """
    Create a test client using our test database.
    This client can be used to make test requests to our API.
    """
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def sample_recipe():
    """
    Provide a sample recipe that can be used across different tests.
    """
    return {
        "title": "Pain pudding",
        "description": "It could be a custard, it could be a scone, it definitely hurts",
        "cooking_time": 69,
        "servings": 420
    }

@pytest.fixture
def sample_direction():
    """
    Provide sample direction data
    """
    return {
        "direction_number": 1,
        "instruction": "Mix until sore"
    }

@pytest.fixture
def sample_measurement_unit():
    """
    Provide a sample measurement unit data
    """
    return {
        "id": 4,
        "name": "Tablespoon",
        "abbreviation": "tbsp",
        "category": UnitCategory.VOLUME.value,
        "is_metric": False,
        "is_common": True
    }

@pytest.fixture
def sample_ingredient():
    """
    Provide a sample ingredient
    """
    return {
        "name": "Space Dust",
        "category": IngredientCategory.SPICES.value,
        "description": "Sammo and Wink's special brand"
    }

@pytest.fixture
def sample_recipe_ingredient(created_ingredient, sample_measurement_unit):
    """
    Provide sample recipe ingredient data
    """
    return{
        "name": created_ingredient["name"],
        "ingredient_id": created_ingredient["id"],
        "quantity": 2,
        "unit_id": sample_measurement_unit["id"],
        "unit_name": sample_measurement_unit["name"]
    }

@pytest.fixture
def sample_schedule():
    """
    Provide sample schedule data
    """
    return {
        "start_date": "2025-01-05",
        "end_date": "2025-01-06",
        "notes": "A really cool date"
    }

@pytest.fixture
def created_recipe(client, sample_recipe):
    """
    Create a recipe in the database and return its data.
    This fixture is useful when tests need to work with
    an existing recipe.
    """
    response = client.post("/api/v1/recipe/", json=sample_recipe)
    return response.json()

@pytest.fixture
def created_direction(client, created_recipe, sample_direction):
    """
    Create a direction for a recipe and return its data
    """
    response = client.post(
        f"/api/v1/direction/recipe/{created_recipe['id']}",
        json=sample_direction
    )
    return response.json()

@pytest.fixture
def created_ingredient(client, sample_ingredient, sample_measurement_unit):
    """
    Create an ingredient in the database and return its value
    """
    ingredient_data = {
        **sample_ingredient,
        "preferred_unit_id": sample_measurement_unit["id"]
    }
    response = client.post("/api/v1/ingredients/", json=ingredient_data)
    return response.json()

@pytest.fixture
def created_recipe_ingredient(client, created_recipe, sample_recipe_ingredient):
    """
    Create a recipe ingredient for a recipe and return its data
    """
    response = client.post(
        f"/api/v1/recipe_ingredients/recipe/{created_recipe['id']}",
        json=sample_recipe_ingredient
    )
    return response.json()

@pytest.fixture
def created_schedule(client, created_recipe, sample_schedule):
    """
    Create a schedule for a recipe and return its data
    """
    response = client.post(
        f"/api/v1/schedule/recipe/{created_recipe['id']}",
        json=sample_schedule
    )
    return response.json()
