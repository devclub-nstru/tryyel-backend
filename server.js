const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const sendOtp = require("./utils/sendOtp");
const { protect } = require("./middlewares/authMiddleware");
const AuthRouter = require("./routes/authRoutes.js");
const prisma = require("./config.js");
const routes = require("./routes");

const PORT = process.env.PORT || 4006;

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api", routes);

const OTP_EXPIRY = 5 * 60 * 1000;
const otpStore = { 9032411628: "313204" };

app.use("/auth", AuthRouter);

import vtoRoutes from "./routes/vtoRoutes.js";
app.use("/api/vto", vtoRoutes);

app.get("/", (req, res) => {
  res.send("Hello from Express");
});

app.listen(PORT, () => {
  console.log("Server is runing on the port : ", PORT);
});
