from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Configure SQLite database
SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'sql_app.db')}"  # Creates a string that has information about the db we are connecting to
engine = create_engine(     # creates the engine object, which is used to connect from our app to the db
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}   # allows multiple threads to use connection.  SQLAlchemy handles connection pooling and ensures thread safety.
)
SessionLocal = sessionmaker(
    autocommit=False,   # changes won't be automatically saved to the database.  Need to explicitly call session.commit() to save changes.
    autoflush=False,    # won't automatically sync Python objects with the db before every query.
    bind=engine # tells the sessio nmaker which database engine to use.
    )

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close