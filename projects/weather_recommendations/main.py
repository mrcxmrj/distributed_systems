from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from enum import Enum
from pydantic import BaseModel 
from typing import List, Tuple

class Poll(BaseModel):
    question: str
    options_with_votes: List[Tuple[str, int]]

app = FastAPI()
app.mount(path="/static", app=StaticFiles(directory="static"), name="static")
