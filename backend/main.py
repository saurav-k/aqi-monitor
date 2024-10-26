from fastapi import FastAPI
from api import endpoints
from db import Base, engine

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Register API endpoints
app.include_router(endpoints.router)

# Run the app
# uvicorn main:app --reload
