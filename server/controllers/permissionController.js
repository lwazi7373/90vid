const permissionService = require("../services/permissionService");
const { badRequest } = require("../errors/httpErrors");

const permittedUsers = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.userId;
    const users = await permissionService.permittedUsers(roomId, userId);
    return res.status(200).json({ results: users, count: users.length });
  } catch (error) {
    next(error);
  }
};

const permitUser = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const creatorId = req.user.userId;
    const { userId, canUpload, canDelete, canEditRoom } = req.body;

    if (!userId) return next(badRequest("userId is required in the request body"));

    const permission = await permissionService.permitUser(roomId, creatorId, {
      userId,
      canUpload,
      canDelete,
      canEditRoom
    });

    return res.status(201).json(permission);
  } catch (error) {
    next(error);
  }
};

const revokeUser = async (req, res, next) => {
  try {
    const { roomId, userId } = req.params;
    const creatorId = req.user.userId;
    await permissionService.revokeUser(roomId, creatorId, userId);
    return res.status(200).json({ message: "Permissions revoked successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { permittedUsers, permitUser, revokeUser };