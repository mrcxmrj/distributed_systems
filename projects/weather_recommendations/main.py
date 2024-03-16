from fastapi import FastAPI, Header, responses
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from enum import Enum
from pydantic import BaseModel 
from typing import Annotated, List, Tuple
import requests

class Poll(BaseModel):
    question: str
    options_with_votes: List[Tuple[str, int]]

app = FastAPI()
app.mount(path="/static", app=StaticFiles(directory="static"), name="static")
spotify_access_token = ""

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
def get_auth(access_token: Annotated[str | None, Header()] = None): 
    # spotify_access_token = request.headers["Access-Token"]
    fetch_recommendations(access_token) # TODO: implement asynchronous calls
    return

def fetch_recommendations(access_token):
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    payload = {
        "seed_genres": "heavy-metal"
    }
    response = requests.get("https://api.spotify.com/v1/recommendations", headers=headers, params=payload)
    print(response.text)
