const prisma = require("../config.js");

const createAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      firstName,
      lastName,
      address,
      locality,
      phone,
      city,
      state,
      pincode,
      country = "India",
      isDefault = false,
    } = req.body;
    if (!firstName || !lastName || !address || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message:
          "First name, last name, address, city, state, and pincode are required",
      });
    }
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    const newAddress = await prisma.address.create({
      data: {
        userId,
        firstName,
        lastName,
        address,
        locality,
        phone,
        city,
        state,
        pincode,
        country,
        isDefault,
      },
    });
    if (!newAddress) {
      return res
        .status(400)
        .json({ success: false, message: "Unable to create new address" });
    }
    return res.status(200).json({
      success: false,
      message: "New address added successfully",
      data: newAddress,
    });
  } catch (error) {
    console.log("Error in creating while adding new address ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while adding new address",
    });
  }
};

const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const allAddresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: "desc" },
    });
    if (!allAddresses) {
      return res
        .status(400)
        .json({ success: false, message: "Unable to get user addresses" });
    }
    return res.status(200).json({
      success: true,
      message: "Addresses fetched successfully",
      data: allAddresses,
    });
  } catch (error) {
    console.log("Error while getting addresses ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while getting addresses",
    });
  }
};

const updateAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const {
      firstName,
      lastName,
      address,
      locality,
      phone,
      city,
      state,
      pincode,
      country,
      isDefault,
    } = req.body;

    const existingAddress = await prisma.address.findUnique({ where: { id } });
    if (!existingAddress || existingAddress.userId != userId) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id },
      data: {
        firstName,
        lastName,
        address,
        locality,
        phone,
        city,
        state,
        pincode,
        country,
        isDefault,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: updatedAddress,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const existingAddress = await prisma.address.findUnique({ where: { id } });
    if (!existingAddress || existingAddress.userId !== userId) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }
    const wasDefault = existingAddress.isDefault;
    await prisma.address.delete({ where: { id } });
    if (wasDefault) {
      const anotherDefaultAddress = await prisma.address.findFirst({
        where: { userId },
        orderBy: { id: "asc" },
      });
      if (!anotherDefaultAddress) {
        return res
          .status(400)
          .json({ success: false, message: "No other default address" });
      }
      await prisma.address.update({
        where: { id: anotherDefaultAddress.id },
        data: { isDefault: true },
      });
    }
    return res
      .status(200)
      .json({ success: true, message: "Address deleted succesfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const address = await prisma.address.findUnique({ where: { id } });
    if (!address || address.userId !== userId) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
    await prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });
    return res
      .status(200)
      .json({ success: true, message: "Address set as default successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createAddress,
  getUserAddresses,
  updateAddresses,
  deleteAddress,
  setDefaultAddress,
};
