const express = require("express");
const app = express();
const cors = require("cors");
const bp = require("body-parser");
const profileRouter = express.Router();
const morgan = require("morgan");

//Middlewares
app.use(morgan("dev"));
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));
app.use(cors());

profileRouter.get("/test", (req, res) =>
  res.json({
    success: true,
    information: "Test from Profile Service",
    user: req.user,
  })
);

app.use((err, req, res, next) => {
  return res.status(500).json({ success: false, error: err });
});

app.listen(6000, () => console.log(`Profile Server is up on 6000`));

module.exports = profileRouter;
