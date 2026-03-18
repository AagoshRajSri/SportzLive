import express from "express";
import { matchRouter } from "./routes/matches.js";
const app = express();
const PORT = 8000;

// Built-in JSON body parser middleware
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Hello from Sportz!" });
});

app.use('/matches', matchRouter)

app.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`Server listening on ${url}`);
});
