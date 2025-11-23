const prisma = require("../config.js");

const createBrand = async (req, res) => {
  try {
    const { name, logoUrl } = req.body;

    if (!name)
      return res.status(400).json({ message: "Brand name is required" });

    const brand = await prisma.brand.create({
      data: { name, logoUrl },
    });

    res.status(201).json({ success: true, brand });
  } catch (error) {
    console.error("Error in creating brand ", error);
    res
      .status(500)
      .json({ message: "Internal Server Error in creating brand" });
  }
};

const getBrands = async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { id: "asc" },
    });

    res.json({ success: true, brands });
  } catch (error) {
    console.error("Error in getting all brands ", error);
    res.status(500).json({
      message: "Internal Server Error in creating getting all brands",
    });
  }
};

const getBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await prisma.brand.findUnique({
      where: { id: Number(id) },
    });

    if (!brand) return res.status(404).json({ message: "Brand not found" });

    res.json({ success: true, brand });
  } catch (error) {
    console.error("Error in getting brand ", error);
    res
      .status(500)
      .json({ message: "Internal Server Error in getting single brand" });
  }
};

const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, logoUrl } = req.body;

    const brand = await prisma.brand.update({
      where: { id: Number(id) },
      data: { name, logoUrl },
    });

    res.json({ success: true, brand });
  } catch (error) {
    console.error("Error in updating brand", error);
    res
      .status(500)
      .json({ message: "Internal Server Error in updating brand" });
  }
};

const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.brand.delete({
      where: { id: Number(id) },
    });

    res.json({ success: true, message: "Brand deleted" });
  } catch (error) {
    console.error("Error in deleting brand", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error in deleting brand",
    });
  }
};

module.exports = {
  createBrand,
  getBrands,
  getBrand,
  updateBrand,
  deleteBrand,
};
