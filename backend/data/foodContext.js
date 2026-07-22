import Menu from "../models/Menu.js"

export const getFoodContext = async () => {
  const menus = await Menu.find().populate(
    "restaurant",
    "name"
  )

 const grouped = menus.reduce((acc, item) => {
  if (!item.restaurant) return acc; // Skip invalid menus

  const place = item.restaurant.name;

  if (!acc[place]) {
    acc[place] = [];
  }

  acc[place].push(item);

  return acc;
}, {});

  return `
Available food options today:

${Object.entries(grouped)
  .map(
    ([place, foods]) => `
${place}:
${foods
  .map(
    (food) =>
      `- ${food.dish} (₹${food.price})`
  )
  .join("\n")}`
  )
  .join("\n")}
`
}