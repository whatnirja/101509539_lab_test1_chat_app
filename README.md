# Chat Application

A full-stack real-time chat application built with Socket.io, Express, MongoDB, and vanilla JavaScript. This application supports user authentication, room-based messaging, private messaging, and real-time typing indicators.

## Features

- **User Authentication**
  - Secure signup and login system
  - Session management using localStorage
  - Password protection

- **Room-Based Chat**
  - Join predefined chat rooms (DevOps, Cloud Computing, COVID-19, Sports, NodeJS, News)
  - Real-time group messaging
  - See active members in current room
  - Leave and switch rooms

- **Private Messaging**
  - Direct 1-to-1 messaging between users
  - Select recipient from room members
  - Toggle between room and private chat modes

- **Real-Time Features**
  - Live message updates using Socket.io
  - Typing indicators for private chats
  - Join/leave notifications
  - Instant message delivery

- **Data Persistence**
  - MongoDB integration for storing users and messages
  - Message history retrieval
  - User profile management


## Database Schemas

### User Schema
```javascript
{
  "_id": ObjectId,
  "username": String (unique, required),
  "firstname": String (required),
  "lastname": String (required),
  "password": String (required),
  "createdon": Date
}
```

### Group Message Schema
```javascript
{
  "_id": ObjectId,
  "from_user": String (required),
  "room": String (required),
  "message": String (required),
  "date_sent": Date
}
```

### Private Message Schema
```javascript
{
  "_id": ObjectId,
  "from_user": String (required),
  "to_user": String (required),
  "message": String (required),
  "date_sent": Date
}
```

##  Application Screenshots

### 1. Signup Page
<img width="836" height="475" alt="Screenshot 2026-02-11 at 5 18 45 PM" src="https://github.com/user-attachments/assets/c079afe4-26af-41bb-b74e-d713b502c482" />

### 2. Login Page
<img width="814" height="486" alt="Screenshot 2026-02-11 at 5 19 04 PM" src="https://github.com/user-attachments/assets/4fd65d24-9d89-494c-909b-76f523035d5f" />

### 3. Room Selection
<img width="810" height="450" alt="Screenshot 2026-02-11 at 5 19 09 PM" src="https://github.com/user-attachments/assets/03f71db0-0d6d-4550-84ed-686339c7fc6f" />

<img width="817" height="434" alt="Screenshot 2026-02-11 at 5 19 14 PM" src="https://github.com/user-attachments/assets/f9279819-c3cc-4261-adcc-54642ff0b725" />


### 4. Group Chat
<img width="800" height="463" alt="Screenshot 2026-02-11 at 5 19 19 PM" src="https://github.com/user-attachments/assets/7c87da07-51c8-435d-aa8d-675758ceb856" />


### 5. Private Chat
<img width="800" height="471" alt="Screenshot 2026-02-11 at 5 19 25 PM" src="https://github.com/user-attachments/assets/97faf10c-5033-4e2b-aaf1-2258f2ea0ed8" />

### 6. Active Chat Session
<img width="800" height="464" alt="Screenshot 2026-02-11 at 5 19 44 PM" src="https://github.com/user-attachments/assets/8d2cd6ee-541d-4501-b5e3-749eb375dbdd" />

