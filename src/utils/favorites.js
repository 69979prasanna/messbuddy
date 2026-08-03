const API = process.env.REACT_APP_APIKEY
export const getFavorites = async () => {
  const token = localStorage.getItem("token")
  if (!token) return []
  const res = await fetch(`${API}/favorites`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!res.ok) return []
  return await res.json()
}

export const toggleFavorite = async (restaurantId) => {
  const token = localStorage.getItem("token")
  if (!token) return null
  const res = await fetch(
    `${API}/favorites/toggle/${restaurantId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
  if (!res.ok) return null
  return await res.json()
}