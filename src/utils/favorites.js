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
export const toggleMenuFavorite = async (menuId) => {
  const token = localStorage.getItem("token")

  if (!token) return null

  const res = await fetch(
    `${API}/favorites/menu/toggle/${menuId}`,
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
export const getMenuFavorites = async () => {
  const token = localStorage.getItem("token")

  if (!token) return []

  const res = await fetch(
    `${API}/favorites/menu`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!res.ok) return []

  return await res.json()
}
export const checkMenuFavorite = async (menuId) => {
  const token = localStorage.getItem("token")

  if (!token) {
    return false
  }

  const res = await fetch(
    `${API}/favorites/menu/check/${menuId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!res.ok) return false

  const data = await res.json()

  return data.favorite
}