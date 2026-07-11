const getFavoritesKey = () => {
  const user = JSON.parse(localStorage.getItem("user"))

  if (!user) return null

  return `favorites_${user.id}`
}

export const getFavorites = () => {
  const key = getFavoritesKey()

  if (!key) return []

  return JSON.parse(localStorage.getItem(key)) || []
}

export const addFavorite = (item) => {
  const key = getFavoritesKey()

  if (!key) return

  const favorites = getFavorites()

  const exists = favorites.find((fav) => fav.id === item.id)

  if (!exists) {
    localStorage.setItem(
      key,
      JSON.stringify([...favorites, item])
    )
  }
}

export const removeFavorite = (id) => {
  const key = getFavoritesKey()

  if (!key) return

  const favorites = getFavorites().filter(
    (item) => item.id !== id
  )

  localStorage.setItem(
    key,
    JSON.stringify(favorites)
  )
}

export const isFavorite = (id) => {
  return getFavorites().some(
    (item) => item.id === id
  )
}