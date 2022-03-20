const express = require("express");
const app = express();
const cors = require("cors");
const bp = require("body-parser");
const router = express.Router();
const morgan = require("morgan");

//SERVICES
const authService = require("../auth-server/index");
const profileService = require("../profile-server/index");
const usersService = require("../users-server/index");

//Middlewares
app.use(morgan("dev"));
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));
app.use(cors());

router.get("/test", (req, res) =>
  res.json({ success: true, information: "Test from Base Service" })
);
//API GATEWAY
app.use("/api/v1/", router);
app.use("/api/v1/auth", authService.authRouter);
app.use("/api/v1/users", usersService);
app.use("/api/v1/profile", authService.validateToken, profileService);

app.use((err, req, res, next) => {
  return res.status(500).json({ success: false, error: err });
});

app.listen(5000, () => console.log(`Base Server is up on 5000`));
