import { menuData } from "../../src/data/menuData.js";
const groupMenu = menuData.reduce((acc, item) => {
    if(!acc[item.place]) acc[item.place] = []
    acc[item.place].push(item)
    return acc
}, {})

export const foodContext = `
Available food options today:

${Object.entries(groupMenu).map(([place, foods]) => `${place}:${foods.map(food => `- ${food.dish} (₹${food.price}, rating ${food.rating})`).join("\n")}`).join("\n")}`;
