export const getFavorites = () => {
  return JSON.parse(localStorage.getItem("favorites")) || [];
};

export const addFavorite = (item) => {
  const favorites = getFavorites();
  const exists = favorites.find((fav) => fav.id === item.id);

  if (!exists) {
    localStorage.setItem("favorites", JSON.stringify([...favorites, item]));
  }
};

export const removeFavorite = (id) => {
  const favorites = getFavorites().filter((item) => item.id !== id);
  localStorage.setItem("favorites", JSON.stringify(favorites));
};

export const isFavorite = (id) => {
  return getFavorites().some((item) => item.id === id);
};