import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

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
          content:
            "You are MessBuddy AI. You help college students decide what food to eat."
        },
        { role: "user", content: message }
      ],
      max_tokens: 200
    });

    res.json({
      reply: completion.choices[0].message.content
    });
  } catch (err) {
    console.error("GROQ ERROR:", err);
    res.json({ reply: "AI error" });
  }
});

app.listen(5000, () =>
  console.log("🤖 MessBuddy AI (Groq) running on http://localhost:5000")
);
