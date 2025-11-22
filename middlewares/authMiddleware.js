// const jwt = require("jsonwebtoken");
// const { PrismaClient } = require("@prisma/client");
// const prisma = new PrismaClient();

// const protect = async (req, res, next) => {
//   let token;

//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     try {
//       token = req.headers.authorization.split(" ")[1];
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       const user = await prisma.user.findUnique({ where: { id: decoded.id } });
//       if (!user) {
//         return res
//           .status(401)
//           .json({ message: "Not authorized, user not found" });
//       }
//       req.user = { id: user.id };
//       next();
//     } catch (error) {
//       console.error(error);
//       return res.status(401).json({ message: "Not authorized, token failed" });
//     }
//   }
//   if (!token) {
//     return res.status(401).json({ message: "Not authorized, no token" });
//   }
// };
// module.exports = { protect };
