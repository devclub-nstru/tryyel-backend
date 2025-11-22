// const prisma = require("../config.js");

// const login = async (req, res) => {
//   const { mobile, uid } = req.user;

//   const user = await prisma.user.findUnique({
//     where: { mobileNumber: mobile },
//   });
//   if (!user) {
//     const newUser = await prisma.user.create({
//       data: {
//         id: uid,
//         mobileNumber: mobile,
//       },
//     });
//     if (newUser) {
//       return res.status(401).json({ existingUser: false });
//     }
//   }
//   return res.json({ existingUser: true, message: "Login Successful" });
// };

// module.exports = { login };

const register = async (req, res) => {
  res.send("Register OK");
};

const login = async (req, res) => {
  res.send("Login OK");
};

module.exports = {
  register,
  login,
};
