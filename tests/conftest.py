import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from typing import Generator, Dict, Any

from app.main import app
from app.database import get_db
from app.models.recipe_model import Recipe, Base

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
    try:
        yield test_engine
    finally:
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
    This ensures consistency in test data.
    """
    return {
        "title": "Test Recipe",
        "description": "A test recipe description",
        "ingredients": "ingredient 1, ingredient 2",
        "steps": "1. Step one 2. Step two",
        "cooking_time": 30,
        "servings": 4
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