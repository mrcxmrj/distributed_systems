from fastapi import FastAPI
from enum import Enum
from pydantic import BaseModel 
from typing import List, Tuple

class Poll(BaseModel):
    question: str
    options_with_votes: List[Tuple[str, int]]

app = FastAPI()

@app.get("/")
async def greeting():
    return {"message": "Hello world"}
