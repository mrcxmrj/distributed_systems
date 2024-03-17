import { getAccessToken } from "./utils/getAccessToken";
import { redirectToAuthCodeFlow } from "./utils/redirectToAuthCodeFlow";

const clientId = "9bef3c4aa58f4cf781386c814edd0cc3";
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

getLocation()

document.getElementById("login")!.addEventListener("click", () => redirectToAuthCodeFlow(clientId))

if (code) {
  const accessToken = await getAccessToken(clientId, code);
  const profile = await fetchProfile(accessToken);
  console.log(profile)

  const submitBtn = document.getElementById("submit") as HTMLInputElement
  submitBtn!.addEventListener("click", () => sendAccessToken(accessToken))
  submitBtn.disabled = false
  populateUI(profile);
}

async function fetchProfile(token: string): Promise<UserProfile> {
  const result = await fetch("https://api.spotify.com/v1/me", {
    method: "GET", headers: { Authorization: `Bearer ${token}` }
  });

  return await result.json();
}

function populateUI(profile: UserProfile) {
  const profileInfo = `<span style="color: gray"> Logged in as </span> <span>${profile.display_name}</span>`
  const profileImage = profile.images[0] ? `<img src="${profile.images[0].url}" style="border-radius: 50%; margin-left: 10px" width="50" height="50"/>` : ""
  document.getElementById("profile")!.innerHTML = `<h2>${profileInfo}${profileImage}</h2>`
}

async function sendAccessToken(accessToken: string) {
  const params = {
    latitude: "50.0647",
    longitude: "19.9450"
  }
  // NOTE: this could be achieved using geocoding api from OpenWeather
  // TODO: getting location from user

  const serverUrl = new URL("http://localhost:8000") // NOTE: this should be removed after changing to server site generation
  serverUrl.search = new URLSearchParams(params).toString()
  fetch(serverUrl, { headers: { "Access-Token": accessToken } })
}

function getLocation() {
  const latitudeBox = document.getElementById("latitude") as HTMLInputElement
  const longitudeBox = document.getElementById("longitude") as HTMLInputElement
  navigator.geolocation.getCurrentPosition(position => {
    latitudeBox.value = position.coords.latitude + "°"
    longitudeBox.value = position.coords.longitude + "°"
  });
}
