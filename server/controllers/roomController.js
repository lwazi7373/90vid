const roomService = require("../services/roomService");

const getRooms = async (req, res, next) => {
  try {
    const rooms = await roomService.getRooms();
    return res.status(200).json({ results: rooms, count: rooms.length });
  } catch (error) {
    next(error);
  }
};

const getRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params; 
    const room = await roomService.getRoom(roomId);
    return res.status(200).json(room);
  } catch (error) {
    next(error);
  }
};

const getMyRooms = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const rooms = await roomService.getMyRooms(userId);
    return res.status(200).json({ results: rooms, count: rooms.length });
  } catch (error) {
    next(error);
  }
};

const getPermittedRooms = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const rooms = await roomService.getPermittedRooms(userId);
    return res.status(200).json({ results: rooms, count: rooms.length });
  } catch (error) {
    next(error);
  }
};

const createRoom = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { roomName, description } = req.body;
    const room = await roomService.createRoom(userId, { roomName, description });
    return res.status(201).json(room);
  } catch (error) {
    next(error);
  }
};

const updateRoom = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { roomId } = req.params;
    const { roomName, description } = req.body;
    const room = await roomService.updateRoom(roomId, userId, { roomName, description });
    return res.status(200).json(room);
  } catch (error) {
    next(error);
  }
};

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