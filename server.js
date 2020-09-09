require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const morganSetting = process.env.NODE_ENV === "production" ? "tiny" : "common";
const helmet = require("helmet");
const cors = require("cors");
let MOVIES = require("./moviedex.json");

const app = express();

app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());

app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get("Authorization");

  if (!authToken || authToken.split(" ")[1] !== apiToken) {
    return res.status(401).json({ error: "Unauthorized request" });
  }
  next();
});

function handleGetMovies(req, res) {
  let response = MOVIES;
  const { genre = "", country = "", avg_vote } = req.query;

  if (req.query.genre) {
    response = response.filter((movie) =>
      movie.genre.toLowerCase().includes(req.query.genre.toLowerCase())
    );
  }
  if (req.query.country) {
    response = response.filter((movie) =>
      movie.country.toLowerCase().includes(req.query.country.toLowerCase())
    );
  }
  if (req.query.avg_vote) {
    response = response.filter((movie) =>
      movie.avg_vote > avg_vote ? movie : null
    );
  }

  res.json(response);
}

app.get("/movies", handleGetMovies);

app.use((error, req, res, next) => {
  let response;
  if (process.env.NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    response = { error };
  }
  res.status(500).json(response);
});

const PORT = process.env.PORT;

app.listen(PORT);
