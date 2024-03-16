from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from enum import Enum
from pydantic import BaseModel 
from typing import List, Tuple

class Poll(BaseModel):
    question: str
    options_with_votes: List[Tuple[str, int]]

app = FastAPI()
app.mount(path="/static", app=StaticFiles(directory="static"), name="static")

origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def get_auth(request: Request): 
    print(request.headers)
    return
