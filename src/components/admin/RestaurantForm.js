import { useEffect, useState, useRef } from "react"
import { loadGoogleMaps } from "../../utils/googleMaps"
import "../../styles/RestaurantForm.css"

export default function RestaurantForm({
  onSubmit,
  initialData = {},
  loading = false,
}) {
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    featuredDish: initialData.featuredDish || "",
    featuredPrice: initialData.featuredPrice || "",
    tags: initialData.tags
      ? initialData.tags.join(", ")
      : "",
    openingTime: initialData.openingTime || "",
    closingTime: initialData.closingTime || "",
    address: initialData.address || "",
    latitude: initialData.latitude || null,
    longitude: initialData.longitude || null,
    googleMapsUrl: initialData.googleMapsUrl || "",
    image: null,
  })

  const [preview, setPreview] = useState(
    initialData.image || ""
  )
  const [mapsError, setMapsError] = useState(null)
  const [isChangingLocation, setIsChangingLocation] = useState(
    !initialData.address && !initialData.latitude
  )

  const autocompleteContainerRef = useRef(null)
  const autocompleteElementRef = useRef(null)

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData((prev) => ({
        ...prev,
        name: initialData.name || prev.name,
        featuredDish: initialData.featuredDish || prev.featuredDish,
        featuredPrice:
          initialData.featuredPrice !== undefined
            ? initialData.featuredPrice
            : prev.featuredPrice,
        tags: initialData.tags
          ? initialData.tags.join(", ")
          : prev.tags,
        openingTime: initialData.openingTime || prev.openingTime,
        closingTime: initialData.closingTime || prev.closingTime,
        address: initialData.address || prev.address,
        latitude: initialData.latitude ?? prev.latitude,
        longitude: initialData.longitude ?? prev.longitude,
        googleMapsUrl: initialData.googleMapsUrl || prev.googleMapsUrl,
      }))
      if (initialData.image) {
        setPreview(initialData.image)
      }
      if (initialData.address || initialData.latitude) {
        setIsChangingLocation(false)
      }
    }
  }, [initialData])

  useEffect(() => {
    let isMounted = true
    let autocompleteElement = null
    const container = autocompleteContainerRef.current

    const initAutocomplete = async () => {
      try {
        await loadGoogleMaps()
        if (!isMounted) return

        const { PlaceAutocompleteElement } =
          await window.google.maps.importLibrary("places")
        if (!isMounted || !autocompleteContainerRef.current) return

        // Clear container to avoid duplicate elements on re-render
        autocompleteContainerRef.current.innerHTML = ""

        autocompleteElement = new PlaceAutocompleteElement()
        autocompleteElementRef.current = autocompleteElement

        const handlePlaceSelect = async (event) => {
          const place = event.place
          if (!place) return

          try {
            await place.fetchFields({
              fields: [
                "displayName",
                "formattedAddress",
                "location",
                "googleMapsURI",
              ],
            })

            const address =
              place.formattedAddress || place.displayName || ""
            const lat = place.location ? place.location.lat() : null
            const lng = place.location ? place.location.lng() : null
            const mapsUrl =
              place.googleMapsURI ||
              (lat && lng
                ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
                : "")

            setFormData((prev) => ({
              ...prev,
              address,
              latitude: lat,
              longitude: lng,
              googleMapsUrl: mapsUrl,
            }))
            setIsChangingLocation(false)
            setMapsError(null)
          } catch (err) {
            console.error("Error fetching place details:", err)
          }
        }

        autocompleteElement.addEventListener(
          "gmp-placeselect",
          handlePlaceSelect
        )
        autocompleteContainerRef.current.appendChild(autocompleteElement)
      } catch (err) {
        if (isMounted) {
          console.error("Error loading Google Maps Places:", err)
          setMapsError(
            err.message || "Failed to load Google Places autocomplete."
          )
        }
      }
    }

    if (isChangingLocation) {
      initAutocomplete()
    }

    return () => {
      isMounted = false
      if (autocompleteElement) {
        autocompleteElement.remove()
      }
      if (container) {
        container.innerHTML = ""
      }
    }
  }, [isChangingLocation])

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (name === "image") {
      const file = files[0]
      if (file) {
        setFormData((prev) => ({
          ...prev,
          image: file,
        }))
        setPreview(URL.createObjectURL(file))
      }
      return
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit(formData)
    }
  }

  return (
    <div className="restaurant-form-card">
      <div className="restaurant-form-header">
        <div>
          <h1>
            🍽️ Restaurant Details
          </h1>
          <p>
            Add or update your restaurant information
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="restaurant-form">
        {/* Basic Information */}
        <div className="form-section">
          <div className="section-heading">
            <span>🏪</span>
            <div>
              <h3>Basic Information</h3>
              <p>Tell users about your restaurant</p>
            </div>
          </div>
          <div className="form-group">
            <label>
              Restaurant Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Please Enter Your Restaurant Name"
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>
                Featured Dish
              </label>
              <input
                type="text"
                name="featuredDish"
                value={formData.featuredDish}
                onChange={handleChange}
                placeholder="e.g. Puneri Unlimited Misal"
                required
              />
            </div>
            <div className="form-group">
              <label>
                Featured Price
              </label>
              <div className="input-with-symbol">
                <span>₹</span>
                <input
                  type="number"
                  min="0"
                  name="featuredPrice"
                  value={formData.featuredPrice}
                  onChange={handleChange}
                  placeholder="120"
                  required
                />
              </div>
            </div>
          </div>
          <div className="form-group">
            <label>
              Tags
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="budget, spicy, veg..."
            />
            <small>
              Separate multiple tags with commas.
            </small>
          </div>
        </div>

        {/* Restaurant Location */}
        <div className="form-section">
          <div className="section-heading">
            <span>📍</span>
            <div>
              <h3>Restaurant Location</h3>
              <p>Search and select your restaurant on Google Places</p>
            </div>
          </div>

          {/* Selected Location Display */}
          {(formData.address || (formData.latitude && formData.longitude)) && (
            <div className="location-selected-card">
              <div className="location-selected-header">
                <div className="location-badge">
                  ✅ Location Selected
                </div>
                <button
                  type="button"
                  className="change-location-btn"
                  onClick={() => setIsChangingLocation(true)}
                >
                  🔄 Change Location
                </button>
              </div>

              <div className="location-details">
                <div className="location-address-row">
                  <span className="location-icon">📌</span>
                  <div className="location-address-text">
                    <strong>Address:</strong>
                    <p>{formData.address || "Address not specified"}</p>
                  </div>
                </div>

                {formData.latitude !== null &&
                  formData.longitude !== null &&
                  formData.latitude !== undefined &&
                  formData.longitude !== undefined && (
                    <div className="location-coords">
                      <span className="coord-pill">
                        🌐 Lat: {Number(formData.latitude).toFixed(5)}
                      </span>
                      <span className="coord-pill">
                        🌐 Lng: {Number(formData.longitude).toFixed(5)}
                      </span>
                    </div>
                  )}
              </div>

              {formData.googleMapsUrl && (
                <div className="location-actions">
                  <a
                    href={formData.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-maps-link"
                  >
                    🗺️ View on Google Maps ↗
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Google Places Autocomplete search container */}
          <div
            className="places-autocomplete-wrapper"
            style={{
              display:
                isChangingLocation ||
                  (!formData.address && !formData.latitude)
                  ? "block"
                  : "none",
            }}
          >
            <label className="places-search-label">
              Search by Restaurant Name, Area, Landmark, or Address
            </label>
            <div
              ref={autocompleteContainerRef}
              className="places-autocomplete-container"
            />
            {mapsError && (
              <div className="places-error-msg">
                ⚠️ {mapsError}
              </div>
            )}
            <small className="places-help-text">
              Start typing to see Google Places suggestions and click to select.
            </small>
          </div>
        </div>

        {/* Restaurant Hours */}
        <div className="form-section">
          <div className="section-heading">
            <span>🕐</span>
            <div>
              <h3>Restaurant Hours</h3>
              <p>Set when your restaurant is open</p>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>
                Opening Time
              </label>
              <input
                type="time"
                name="openingTime"
                value={formData.openingTime}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>
                Closing Time
              </label>
              <input
                type="time"
                name="closingTime"
                value={formData.closingTime}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Restaurant Image */}
        <div className="form-section">
          <div className="section-heading">
            <span>📸</span>
            <div>
              <h3>Restaurant Image</h3>
              <p>Upload a beautiful image of your restaurant</p>
            </div>
          </div>
          <label className="image-upload">
            {preview ? (
              <img src={preview} alt="Restaurant preview" />
            ) : (
              <div className="upload-placeholder">
                <div className="upload-icon">
                  📷
                </div>
                <strong>
                  Choose Restaurant Image
                </strong>
                <span>
                  PNG, JPG or WEBP
                </span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              name="image"
              onChange={handleChange}
            />
          </label>
          {preview && (
            <div className="image-selected">
              ✅ Image selected
            </div>
          )}
        </div>

        <button
          type="submit"
          className="save-restaurant-btn"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="save-spinner"></span>
              Saving Restaurant...
            </>
          ) : (
            <>
              💾 Save Restaurant
            </>
          )}
        </button>
      </form>
    </div>
  )
}
