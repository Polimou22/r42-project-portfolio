const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const hermesRes = await fetch(process.env.HERMES_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HERMES_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "hermes-agent",
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await hermesRes.json();
    const reply = data.choices?.[0]?.message?.content ?? "No response";

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong talking to Hermes" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Backend running on port ${process.env.PORT}`);
});
