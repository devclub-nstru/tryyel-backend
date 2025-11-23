const prisma = require("../config.js");
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        mobileNumber: true,
        firstName: true,
        lastName: true,
        profilePictureUrl: true,
        age: true,
        gender: true,
        topSize: true,
        bottomSize: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error in getting profile ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error in getting profile",
    });
  }
};
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      firstName,
      lastName,
      age,
      gender,
      topSize,
      bottomSize,
      profilePictureUrl,
    } = req.body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(age && { age: Number(age) }),
        ...(gender && { gender }),
        ...(topSize && { topSize }),
        ...(bottomSize && { bottomSize }),
        ...(profilePictureUrl && { profilePictureUrl }),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error in updating profile ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error in updating profile",
    });
  }
};

const updateProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file || !req.file.path) {
      return res.status(400).json({
        success: false,
        message: "Image upload failed",
      });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        profilePictureUrl: req.file.path,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Profile picture updated",
      data: updated,
    });
  } catch (error) {
    console.error("Error in updating profile picture ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error in updating profile picture",
    });
  }
};
const deleteProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.user.delete({
      where: { id: userId },
    });

    return res.status(200).json({
      success: true,
      message: "User account deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleting profile ", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error in deleting profile",
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateProfilePicture,
  deleteProfile,
};
