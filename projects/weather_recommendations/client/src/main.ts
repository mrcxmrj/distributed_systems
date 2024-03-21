import { getAccessToken } from "./utils/getAccessToken";
import { redirectToAuthCodeFlow } from "./utils/redirectToAuthCodeFlow";
import { UserProfile } from "./interfaces"

const clientId = "9bef3c4aa58f4cf781386c814edd0cc3";
const params = new URLSearchParams(window.location.search);
const code = params.get("code");
let accessToken = sessionStorage.getItem("access-token")

onLoad()
async function onLoad() {
  getLocation()

  document.getElementById("login")!.addEventListener("click", () => redirectToAuthCodeFlow(clientId))
  if (code) {
    accessToken = await getAccessToken(clientId, code);
    sessionStorage.setItem("access-token", accessToken)
  }
  if (accessToken) {
    const profile = await fetchProfile(accessToken);
    console.log(profile)

    const submitBtn = document.getElementById("submit") as HTMLInputElement
    submitBtn!.addEventListener("click", handleSubmit)
    submitBtn.disabled = false
    populateProfileView(profile);
  }
}

async function handleSubmit(event: MouseEvent) {
  event.preventDefault()
  const recommendationsSection = document.getElementById("recommendations")
  recommendationsSection!.innerHTML = `<article aria-busy="true"></article>`

  const form = document.getElementById("input") as HTMLFormElement
  const formData = new FormData(form)
  const latitude = formData.get("latitude")?.slice(0, -1) as string
  const longitude = formData.get("longitude")?.slice(0, -1) as string
  const genres: string[] = (formData.get("genres") as string).split(",").map(entry => entry.trim())
  console.log(latitude, longitude, genres)

  const template = await getRecommendations(accessToken!, latitude, longitude, genres)
  recommendationsSection!.innerHTML = template
}

async function fetchProfile(token: string): Promise<UserProfile> {
  const result = await fetch("https://api.spotify.com/v1/me", {
    method: "GET", headers: { Authorization: `Bearer ${token}` }
  });

  return await result.json();
}

function populateProfileView(profile: UserProfile) {
  const profileInfo = `<span style="color: gray"> Logged in as </span> <span>${profile.display_name}</span>`
  const profileImage = profile.images[0] ? `<img src="${profile.images[0].url}" style="border-radius: 50%; margin-left: 10px" width="50" height="50"/>` : ""
  document.getElementById("profile")!.innerHTML = `<h2>${profileInfo}${profileImage}</h2>`
}

async function getRecommendations(accessToken: string, latitude: string, longitude: string, genres: string[]) {
  const params = {
    latitude: latitude,
    longitude: longitude,
    genres: genres.join(",")
  }
  // NOTE: this could be achieved using geocoding api from OpenWeather

  const serverUrl = new URL("http://127.0.0.1:8000/api/weather_recommendations") // NOTE: this should be removed after changing to server site generation
  console.log(serverUrl)
  serverUrl.search = new URLSearchParams(params).toString()
  const response = await fetch(serverUrl, { headers: { "Access-Token": accessToken } })
  return await response.text()
}

function getLocation() {
  const latitudeBox = document.getElementById("latitude") as HTMLInputElement
  const longitudeBox = document.getElementById("longitude") as HTMLInputElement
  navigator.geolocation.getCurrentPosition(position => {
    latitudeBox.value = position.coords.latitude + "°"
    longitudeBox.value = position.coords.longitude + "°"
  });
}
