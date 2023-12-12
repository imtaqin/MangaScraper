const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const MangaRouter = require("./app/routes/manga.routes");

const app = express();

app.use(helmet());

var corsOptions = {
  origin: "http://localhost:8081",
};

app.use(cors(corsOptions));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  res.json({ message: "Jalan Broo" });
});

const mangaRouter = new MangaRouter();

app.use('/api', mangaRouter.router);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
