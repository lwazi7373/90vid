const roomService = require("../services/roomService");
const { badRequest } = require("../errors/httpErrors");

/**
 * Controller to get all the rooms in the system
 * @returns the rooms and the count
 */
const getRooms = async (req, res, next) => {
  try {
    const rooms = await roomService.getRooms();
    return res.status(200).json({ results: rooms, count: rooms.length });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to get a specific room
 * @returns the room
 */
const getRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params; 
    const room = await roomService.getRoom(roomId);
    return res.status(200).json(room);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to return all the rooms the logged in user has created
 * @returns the rooms and the count
 */
const getMyRooms = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const rooms = await roomService.getMyRooms(userId);
    return res.status(200).json({ results: rooms, count: rooms.length });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to get all the rooms the user has been granted permission for 
 * @returns the rooms and the count
 */
const getPermittedRooms = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const rooms = await roomService.getPermittedRooms(userId);
    return res.status(200).json({ results: rooms, count: rooms.length });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to allow a user to create a room
 * Image must be provided, to use as a thumbnail for the "room card" display
 * @returns created room
 */
const createRoom = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { roomName, description } = req.body;

    //Image that will act as the thumbnail for the room being created
    if (!req.file) return next(badRequest("No image file was provided"));

    const room = await roomService.createRoom(userId, roomName, description, req.file);
    return res.status(201).json(room);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to update a specfic room (must ber creator or have permission)
 * Image, does not need to provided, the option to is available
 * @returns updated room
 */
const updateRoom = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { roomId } = req.params;
    const { roomName, description } = req.body;

    // req.file will be undefined if no image was sent — which is fine, service handles it
    const room = await roomService.updateRoom(roomId, userId, { roomName, description, file: req.file });
    return res.status(200).json(room);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to delete room (if creator)
 * @returns success message
 */
const deleteRoom = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { roomId } = req.params;
    await roomService.deleteRoom(roomId, userId);
    return res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getRooms, getRoom, getMyRooms ,getPermittedRooms ,createRoom, updateRoom, deleteRoom };