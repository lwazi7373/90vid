const searchService = require("../services/searchService");
const {notFound} = require("../errors/httpErrors");

/**
 * Finds the room the user is searching for 
 * Returns all rooms whose name contains the search term.
 * Multiple results are expected and normal — room names are not unique.
 * @param {*} req
 * @param {*} res
 * @returns the room(s)
 */
const searchRoom = async (req, res) => {
    const { roomName } = req.query;
    if (!roomName || roomName.trim() === "") throw notFound("Query param 'roomName' is required.");
    
    const rooms = await searchService.searchRooms(roomName.trim());
    res.status(200).json({ results: rooms, count: rooms.length });
}

/**
 * Finds an active user, the currently logged in user is searching for
 * Partial match — typing "jo" can return "john", "joe", "joanna".
 * Only returns active users.
 * @param {*} req
 * @param {*} res
 * @returns the user(s)
 */
const searchUser = async (req, res) => {
    const { userName } = req.query;
    if (!userName || userName.trim() === "") throw notFound("Query param 'userName' is required.");

    const users = await searchService.searchUsers(userName.trim());
    res.status(200).json({ results: users, count: users.length });
}

module.exports = {searchRoom, searchUser};