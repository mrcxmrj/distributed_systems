from datetime import datetime
import os
from typing import Annotated
import requests
from fastapi import FastAPI, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI()
app.mount(path="/static", app=StaticFiles(directory="static"), name="static")
spotify_access_token = ""
WEATHER_API_KEY = os.environ.get("WEATHER_API_KEY")

origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def get_auth(latitude: str, longitude: str, access_token: Annotated[str | None, Header()] = None):
    if not access_token: return

    # TODO: implement asynchronous calls
    weather_data = fetch_weather(latitude, longitude)
    feelslike_c, precip_mm = extract_weather(weather_data)

    suntime_data = fetch_suntime(latitude, longitude)
    suntime_hours = extract_suntime(suntime_data)
    
    target_valence, target_energy = calculate_recommendation_parameters(feelslike_c, precip_mm, suntime_hours)
    recommendations_data = fetch_recommendations(access_token, target_valence, target_energy)
    recommendations = extract_recommendations(recommendations_data)
    print(recommendations)
    return

@app.get("/recommendations")
def fetch_recommendations(access_token: str, target_valence: float, target_energy: float):
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    # TODO: implement more parameters (genres, check market, artists, etc.)
    payload = {
        "market": "PL",
        "seed_genres": "heavy-metal",
        "target_valence": target_valence,
        "target_energy": target_energy
    }
    response = requests.get("https://api.spotify.com/v1/recommendations", headers=headers, params=payload)
    return response.json()
def extract_recommendations(data):
    return data

weather_api_url = lambda api_method, latitude, longitude: f"http://api.weatherapi.com/v1/{api_method}?key=e67c5fd1d3fc4375b1e210330241603 &q={latitude},{longitude}&aqi=no"

@app.get("/weather")
def fetch_weather(latitude, longitude):
    response = requests.get(weather_api_url("current.json", latitude, longitude))
    return response.json()
def extract_weather(data):
    feelslike_c = data["current"]["feelslike_c"]
    precip_mm = data["current"]["precip_mm"]
    return feelslike_c, precip_mm

@app.get("/suntime")
def fetch_suntime(latitude, longitude):
    response = requests.get(weather_api_url("astronomy.json", latitude, longitude))
    return response.json()
def extract_suntime(data):
    sunrise_str = data["astronomy"]["astro"]["sunrise"]
    sunset_str = data["astronomy"]["astro"]["sunset"]
    sunrise_time = datetime.strptime(sunrise_str, "%I:%M %p")
    sunset_time = datetime.strptime(sunset_str, "%I:%M %p")
    
    time_difference = sunset_time - sunrise_time
    hours_difference = time_difference.total_seconds() / 3600
    return hours_difference

def calculate_recommendation_parameters(feelslike_c: float, precip_mm: float, suntime_hours: float):
    suntime_standardized = suntime_hours / 16.5 # range 0h-16.5h
    feelslike_standardized = ( feelslike_c + 17.8 ) / 46.2 # range (-17.8C)-(28.4C)
    precip_standardized = precip_mm / 47.10 # range 0mm-47.10mm
    
    suntime_weight = 2
    feelslike_weight = 3
    precip_weight = 4
    # NOTE: suntime-energy is kinda scientifically based, rest is totally arbitrary lol
    valence = ( suntime_weight * suntime_standardized + feelslike_weight * feelslike_standardized + precip_weight * precip_standardized ) / (suntime_weight + feelslike_weight + precip_weight)
    energy = suntime_standardized
    return valence, energy
