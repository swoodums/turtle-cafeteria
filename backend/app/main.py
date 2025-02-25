from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine
from app.models import recipe_model, schedule_model
from app.routes import recipes_routes, direction_routes, recipe_ingredients_routes, schedule_routes, ingredient_routes, measurement_routes

# Create the FastAPI app
app = FastAPI(
    title = "Turtle Cafeteria",
    summary = "The backend APIs for the Turtle Tray application",
    version = "0.0.1"
)

# Add CORSMiddleware to the application
origins = [
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
recipe_model.Base.metadata.create_all(bind=engine)
schedule_model.Base.metadata.create_all(bind=engine)

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
app.include_router(direction_routes.router, prefix="/api/v1")
app.include_router(recipe_ingredients_routes.router, prefix="/api/v1")
app.include_router(schedule_routes.router, prefix="/api/v1")
app.include_router(ingredient_routes.router, prefix="/api/v1")
app.include_router(measurement_routes.router, prefix="/api/v1")