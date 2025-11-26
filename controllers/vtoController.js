const prisma = require("../config.js");

const getVtoProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isVto: true,
      },
    });

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getVtoProducts };
