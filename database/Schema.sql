CREATE DATABASE media;
USE media;

CREATE TABLE Users (
    userId INT AUTO_INCREMENT PRIMARY KEY,
    userName VARCHAR(50) NOT NULL,
    userPassword VARCHAR(255) NOT NULL,
    emailAddress VARCHAR(100) UNIQUE NOT NULL,
    contactNo VARCHAR(15),
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE Roles (
    roleId INT AUTO_INCREMENT PRIMARY KEY,
    roleName VARCHAR(30) UNIQUE NOT NULL
);

CREATE TABLE UserRoles (
    userRoleId INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    roleId INT NOT NULL,
    FOREIGN KEY (userId) REFERENCES Users(userId),
    FOREIGN KEY (roleId) REFERENCES Roles(roleId),
    UNIQUE KEY unique_user_role (userId, roleId)
);

CREATE TABLE Rooms (
    roomId INT AUTO_INCREMENT PRIMARY KEY,
    roomName VARCHAR(100) NOT NULL,
    description TEXT,
    createdBy INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (createdBy) REFERENCES Users(userId)
);

CREATE TABLE RoomPermissions (
    permissionId INT AUTO_INCREMENT PRIMARY KEY,
    roomId INT NOT NULL,
    userId INT NOT NULL,
    canUpload BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (roomId) REFERENCES Rooms(roomId),
    FOREIGN KEY (userId) REFERENCES Users(userId),
    UNIQUE KEY unique_room_user (roomId, userId)
);

CREATE TABLE Images (
    imageId INT AUTO_INCREMENT PRIMARY KEY,
    fileUrl VARCHAR(500) NOT NULL,
    uploadedBy INT NOT NULL,
    roomId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploadedBy) REFERENCES Users(userId),
    FOREIGN KEY (roomId) REFERENCES Rooms(roomId)
);

CREATE TABLE Videos (
    videoId INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    fileUrl VARCHAR(500) NOT NULL,
    thumbnailUrl VARCHAR(500),
    uploadedBy INT NOT NULL,
    roomId INT NOT NULL,
    durationSeconds INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploadedBy) REFERENCES Users(userId),
    FOREIGN KEY (roomId) REFERENCES Rooms(roomId)
);



