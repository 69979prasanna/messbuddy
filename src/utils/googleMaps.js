import { setOptions, importLibrary } from "@googlemaps/js-api-loader"

const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_KEY

let optionsSet = false

export const loadGoogleMaps = async () => {
  if (
    window.google &&
    window.google.maps &&
    typeof window.google.maps.importLibrary === "function"
  ) {
    return window.google
  }

  if (!API_KEY) {
    throw new Error(
      "Google Maps API key is missing. Check REACT_APP_GOOGLE_MAPS_KEY in your .env file."
    )
  }

  if (!optionsSet) {
    setOptions({
      key: API_KEY,
      v: "weekly",
    })
    optionsSet = true
  }

  await importLibrary("places")
  return window.google
}
