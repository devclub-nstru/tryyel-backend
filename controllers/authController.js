const prisma = require("../config.js");
const jwt = require("jsonwebtoken");

const checkUser = async (req, res) => {
  try {
    const { uid, mobileNumber } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: uid },
    });

    if (user) {
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
      });
      // Set HTTP-only cookie for JWT
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      // Set regular cookie for userId (client needs this)
      res.cookie("userId", user.id, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({ exists: true, user: user, token });
    }

    const createUser = await prisma.user.create({
      data: {
        id: uid,
        mobileNumber,
      },
    });

    const newToken = jwt.sign({ id: createUser.id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    // Set HTTP-only cookie for JWT
    res.cookie("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // Set regular cookie for userId
    res.cookie("userId", createUser.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res
      .status(200)
      .json({ exists: false, user: createUser, token: newToken });
  } catch (error) {
    console.error("Error in checkUser:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error in checkUser",
    });
  }
};

const logout = async (req, res) => {
  try {
    // Clear cookies
    res.clearCookie("token");
    res.clearCookie("userId");
    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error in logout",
    });
  }
};

module.exports = {
  checkUser,
  logout,
};
