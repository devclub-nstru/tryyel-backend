const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const sendOtp = require("./utils/sendOtp");
const { protect } = require("./middleware/auth.js");
const prisma = require("./config.js");

// Import Routes
const authRoutes = require("./routes/authRoutes.js");
const addressRoutes = require("./routes/addressRoutes.js");
const brandRoutes = require("./routes/brandRoutes.js");
const cartRoutes = require("./routes/cartRoutes.js");
const categoryRoutes = require("./routes/categoryRoutes.js");
const collectionRoutes = require("./routes/collectionRoutes.js");
const orderRoutes = require("./routes/orderRoutes.js");
const productRoutes = require("./routes/productRoutes.js");
const reviewRoutes = require("./routes/reviewRoutes.js");
const subCategoryRoutes = require("./routes/subCategoryRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const wishlistRoutes = require("./routes/wishlistRoutes.js");
// const vtoRoutes = require("./routes/vtoRoutes.js"); // Assuming vtoRoutes is converted to CJS or handled

const PORT = process.env.PORT || 4006;

const app = express();

app.use(express.json());
app.use(cors());

// Mount Routes
app.use("/api/health", (req, res) => {
  res.send("OK");
});
app.use("/api/auth", authRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/subcategories", subCategoryRoutes);
app.use("/api/user", userRoutes);
app.use("/api/wishlist", wishlistRoutes);
// app.use("/api/vto", vtoRoutes);

const OTP_EXPIRY = 5 * 60 * 1000;
const otpStore = { 9032411628: "313204" };

app.get("/", (req, res) => {
  res.send("Hello from Express");
});

app.listen(PORT, () => {
  console.log("Server is runing on the port : ", PORT);
});
