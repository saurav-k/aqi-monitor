from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import endpoints
from db import Base, engine

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Register API endpoints
app.include_router(endpoints.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify allowed origins here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Run the app
# uvicorn main:app --reload
