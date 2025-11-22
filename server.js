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

app.post("/auth/request-otp", async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) return res.status(400).json({ message: "Mobile is required" });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[mobile] = {
      otp,
      expiresAt: Date.now() + OTP_EXPIRY,
    };
    await sendOtp(mobile, otp);
    return res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.log("request OTP error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
});

app.post("/auth/verify-otp", async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    console.log(mobile, otp);
    if (!mobile || !otp)
      return res.status(400).json({ message: "Mobile & OTP required" });
    const record = otpStore[mobile];
    console.log("guvbhj", record);
    if (!record) {
      return res.status(400).json({ message: "OTP not requested" });
    }
    if (Date.now() > record.expiresAt)
      return res.status(400).json({ message: "OTP expired" });

    if (record !== otp) {
      console.log(record[1], otp);
      return res.status(400).json({ message: "Invalid OTP" });
    }
    delete otpStore[mobile];
    let user = await prisma.user.findFirst({
      where: { mobileNumber: Number(mobile) },
    });
    if (!user) {
      user = await prisma.user.create({
        data: { mobileNumber: Number(mobile) },
      });
    }
    const token = jwt.sign(
      { id: user.id, mobileNumber: user.mobileNumber },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    return res.json({
      success: true,
      message: "OTP Verified",
      token,
      user,
    });
  } catch (err) {
    console.log("verify OTP error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
});

app.get("/api/user/profile", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        mobileNumber: true,
        firstName: true,
        lastName: true,
        profilePictureUrl: true,
        age: true,
        topSize: true,
        bottomSize: true,
        gender: true,
      },
    });

    if (!userProfile) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(userProfile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/user/profile", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, age, topSize, bottomSize, gender } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        age,
        topSize,
        bottomSize,
        gender,
      },
    });
    res
      .status(200)
      .json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/", (req, res) => {
  res.send("Hello from Express");
});

app.listen(PORT, () => {
  console.log("Server is runing on the port : ", PORT);
});
