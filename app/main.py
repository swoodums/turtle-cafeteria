from fastapi import FastAPI

from app.database import engine
from app.models import recipe_model
from app.schemas import recipe_schema
from app.routes import recipes_routes, step_routes

# Create the FastAPI app
app = FastAPI(
    title = "Turtle Cafeteria",
    summary = "The backend APIs for the Turtle Tray application",
    version = "0.0.1"
)

# Create database tables
recipe_model.Base.metadata.create_all(bind=engine)

@app.get("/")   # Default endpoint
def root():
    return {
        "name": "Turtle Cafeteria API",
        "description": "The backend APIs for the Turtle Tray application, providing endpoints for managing recipes, ingredients, and meal plans.",
        "version": "0.0.1",
        "documentation": "http://127.0.0.1:8000/docs",
        "alternative_documentation:": "http://127.0.0.1:8000/redoc",
        "contact": {
            "name": "Sam Woodbeck",
            "email": "samuel.woodbeck@gmail.com"
        }
    }

app.include_router(recipes_routes.router, prefix="/api/v1")
app.include_router(step_routes.router, prefix="/api/v1")