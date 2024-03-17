import { getAccessToken } from "./utils/getAccessToken";
import { redirectToAuthCodeFlow } from "./utils/redirectToAuthCodeFlow";

const clientId = "9bef3c4aa58f4cf781386c814edd0cc3";
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

if (!code) {
  redirectToAuthCodeFlow(clientId);
} else {
  const accessToken = await getAccessToken(clientId, code);
  const profile = await fetchProfile(accessToken);
  console.log(profile)
  await sendAccessToken(accessToken)
  populateUI(profile);
}

async function fetchProfile(token: string): Promise<UserProfile> {
  const result = await fetch("https://api.spotify.com/v1/me", {
    method: "GET", headers: { Authorization: `Bearer ${token}` }
  });

  return await result.json();
}

function populateUI(profile: UserProfile) {
  document.getElementById("displayName")!.innerText = profile.display_name;
  if (profile.images[0]) {
    const profileImage = new Image(200, 200);
    profileImage.src = profile.images[0].url;
    document.getElementById("avatar")!.appendChild(profileImage);
  }
  document.getElementById("id")!.innerText = profile.id;
  document.getElementById("email")!.innerText = profile.email;
  document.getElementById("uri")!.innerText = profile.uri;
  document.getElementById("uri")!.setAttribute("href", profile.external_urls.spotify);
  document.getElementById("url")!.innerText = profile.href;
  document.getElementById("url")!.setAttribute("href", profile.href);
  document.getElementById("imgUrl")!.innerText = profile.images[0]?.url ?? '(no profile image)';
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
