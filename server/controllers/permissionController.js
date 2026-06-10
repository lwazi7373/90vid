const permissionService = require("../services/permissionService");
const { badRequest } = require("../errors/httpErrors");

/**
 * Controller to fetch the user's with permissions for a perticular room
 * @returns the users and the count 
 */
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

/**
 * Controller to grant permissions to a user for a particular room
 * Can only grant permissions, if the user granting is the creator of the room
 * @returns permission information
 */
const permitUser = async (req, res, next) => {
  try {
    const roomId = parseInt(req.params.roomId);
    const creatorId = req.user.userId;
    const { userId, canUpload, canDelete, canEditRoom } = req.body;

    if (!userId) return next(badRequest("userId is required in the request body"));

    const permission = await permissionService.permitUser(roomId, creatorId, {
      userId: parseInt(userId),
      canUpload: parseInt(canUpload),
      canDelete: parseInt(canDelete),
      canEditRoom: parseInt(canEditRoom),
    });

    return res.status(201).json(permission);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to revoke a user's permissions to a room
 * Can only be done by the creator
 * @returns success message
 */
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