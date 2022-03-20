const express = require("express");
const app = express();
const cors = require("cors");
const bp = require("body-parser");
const authRouter = express.Router();
const sqlite3 = require("sqlite3").verbose();
const jwt = require("jsonwebtoken");
const morgan = require("morgan");

//Middlewares
app.use(morgan("dev"));
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));
app.use(cors());

authRouter.get("/test", (req, res) =>
  res.json({ success: true, information: "Test from Auth Service" })
);

authRouter.post("/register", async (req, res, next) => {
  try {
    //Establish the database connection
    let db = new sqlite3.Database("../Users.db", (err) => {
      if (err) return console.log(err.message);
      console.log("Connected to sqlite3 successfully");
    });

    //Get data from the request body
    const { username, password } = req.body;
    const statement = `SELECT username FROM Users WHERE username = ? `;
    db.get(statement, [username], (err, row) => {
      if (err) return console.log(err.message);

      return row && row.username === username
        ? next(`${username} (username) is already in use.`)
        : db.run(
            `INSERT INTO Users (username,password) VALUES(?,?)`,
            [`${username}`, `${password}`],
            function (err) {
              if (err) {
                console.log(err.message);
                next(err.message);
              }

              return res
                .status(201)
                .json({ success: true, user: `${username}` });
            }
          );
    });
    db.close(console.log);
  } catch (err) {
    return res.status(500).json(err.message);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    //Establish the database connection
    let db = new sqlite3.Database("../Users.db", (err) => {
      if (err) return console.log(err.message);
      console.log("Connected to sqlite3 successfully");
    });
    const { username, password } = req.body;
    const statement = `SELECT * FROM Users WHERE username = ? AND password = ?`;
    db.get(statement, [username, password], (err, row) => {
      if (err) return console.log(err.message);

      //Sign the jwt token here.
      const payload = { id: this.lastID, username: username };
      const access_token = jwt.sign(payload, "this is secret");
      return row && row.username === username && row.password === password
        ? res
            .status(200)
            .json({ success: true, user: username, token: access_token })
        : next("Check your credentials.");
    });
    db.close(console.log);
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

const validateToken = (req, res, next) => {
  const authorization = req.headers["authorization"];
  console.log("Auth Server Validate Function is working.");

  if (!authorization)
    return res
      .status(401)
      .json({ success: false, message: "You are not authorized" });
  const token = authorization.split(" ")[1];

  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "You are not authorized!" });

  //validate token
  return jwt.verify(token, "this is secret", (err, decoded) => {
    if (err) {
      console.log(err.message);
      return next(err.message);
    }
    console.log(decoded);
    req.user = decoded;
    next();
  });
};

app.use("/auth-api/v1/auth", authRouter);

app.use((err, req, res, next) => {
  return res.status(500).json({ success: false, error: err });
});

app.listen(4000, () => console.log(`Auth Server is up on 4000`));

module.exports = { authRouter, validateToken };
