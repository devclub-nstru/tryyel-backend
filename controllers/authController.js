const prisma = require("../config.js");

const checkUser = async (req, res) => {
  const { uid, mobileNumber } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: uid, mobileNumber },
  });

  if (user) {
    return res.status(200).json({ exists: true, user: user });
  }

  const createUser = await prisma.user.create({
    data: {
      id: uid,
      mobileNumber,
    },
  });

  return res.status(200).json({ exists: false, user: createUser });
};

module.exports = {
  checkUser,
};
