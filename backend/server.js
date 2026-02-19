import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import { foodContext } from "./data/foodContext.js"

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

app.post("/api/ai", async (req, res) => {
  try {
    const { message } = req.body;

   const completion = await groq.chat.completions.create({
  model: "llama-3.1-8b-instant",
  messages: [
    {
      role: "system",
      content: `
You are MessBuddy AI, a food assistant for college students.

Use ONLY the food options listed below to answer.
Be practical, short, and helpful.

${foodContext}
`
    },
    {
      role: "user",
      content: message
    }
  ],
  max_tokens: 250
})

    res.json({
      reply: completion.choices[0].message.content
    });
  } catch (err) {
    console.error("GROQ ERROR:", err);
    res.json({ reply: "AI error" });
  }
});

app.listen(5000, () =>
  console.log(`🤖 MessBuddy AI (Groq) running on http://localhost:${process.env.PORT}`)
);
