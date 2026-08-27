const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_KEY

let googleMapsPromise = null

export const loadGoogleMaps = () => {
  // Already loaded
  if (
    window.google &&
    window.google.maps &&
    window.google.maps.importLibrary
  ) {
    return Promise.resolve(window.google)
  }

  // Already loading
  if (googleMapsPromise) {
    return googleMapsPromise
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    if (!API_KEY) {
      reject(
        new Error(
          "Google Maps API key is missing. Check REACT_APP_GOOGLE_MAPS_KEY."
        )
      )
      return
    }

    // Google Maps bootstrap loader
    const callbackName = "__messBuddyGoogleMapsLoaded"

    window[callbackName] = () => {
      if (
        window.google &&
        window.google.maps &&
        window.google.maps.importLibrary
      ) {
        resolve(window.google)
      } else {
        reject(
          new Error(
            "Google Maps loaded but importLibrary is unavailable."
          )
        )
      }

      delete window[callbackName]
    }

    const script = document.createElement("script")

    script.src =
      `https://maps.googleapis.com/maps/api/js` +
      `?key=${API_KEY}` +
      `&loading=async` +
      `&callback=${callbackName}` +
      `&v=weekly`

    script.async = true
    script.defer = true

    script.onload = () => {
      // The callback should normally handle this.
      // We don't resolve here because Google may
      // still be initializing.
    }

    script.onerror = () => {
      reject(
        new Error("Google Maps JavaScript API failed to load.")
      )

      googleMapsPromise = null
    }

    document.head.appendChild(script)
  })

  return googleMapsPromise
}