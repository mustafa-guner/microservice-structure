const express = require("express");
const app = express();
const cors = require("cors");
const bp = require("body-parser");
const usersRouter = express.Router();
const morgan = require("morgan");
const sqlite3 = require("sqlite3").verbose();

//Middlewares
app.use(morgan("dev"));
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));
app.use(cors());

usersRouter.get("/test", (req, res) =>
  res.json({
    success: true,
    information: "Test from Users Service",
    user: req.user,
  })
);

usersRouter.get("/", (req, res) => {
  //Establish the database connection
  let db = new sqlite3.Database("../Users.db", (err) => {
    if (err) return console.log(err.message);
    console.log("Connected to sqlite3 successfully");
  });

  return db.all("SELECT * FROM Users", (err, row) => {
    if (err) return console.log(err.message);
    res.status(200).json({ success: true, users: row });
  });
});

app.use((err, req, res, next) => {
  return res.status(500).json({ success: false, error: err });
});

app.listen(7000, () => console.log(`Users Server is up on 7000`));

module.exports = usersRouter;
