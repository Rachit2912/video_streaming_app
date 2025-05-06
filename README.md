# 📺 Video Streaming Backend

A backend system for a video streaming platform built using **Node.js**, **Express**, **MongoDB**, and **FFmpeg**.  
This project enables efficient video upload, storage, and real-time streaming with support for user authentication, media processing, and secure delivery.

## 🚀 Features

- 🔐 **User Authentication** – Secure user sign-up and login with token-based authentication
- 📤 **Video Uploads** – Supports video uploads and metadata storage
- 🌀 **Real-Time Streaming** – Streams video using chunked data transfer and optimized buffer control
- 🎞️ **FFmpeg Integration** – Handles video compression, format conversion, and thumbnail generation
- 📂 **MongoDB Storage** – Stores user and video data with indexing for fast retrieval
- 🔒 **Access Control** – Ensures secure access and playback for authorized users only

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **Video Processing:** FFmpeg  
- **Authentication:** JWT (JSON Web Tokens)  
- **Storage:** Local file system (can be adapted for cloud storage)

## 📁 Project Structure

```
video_streaming_app/
├── controllers/        # Request handlers
├── routes/             # API routes
├── models/             # Mongoose schemas
├── middleware/         # Authentication and streaming logic
├── utils/              # FFmpeg helpers and stream utilities
├── public/             # Static files (if any)
├── uploads/            # Stored video files
├── app.js              # Entry point
└── .env                # Environment configuration
```

## 📦 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Rachit2912/video_streaming_app.git
cd video_streaming_app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 4. Start the server
```bash
npm start
```

## 📹 Sample Workflow

1. Register or login a user  
2. Upload a video file via API  
3. Stream the video by accessing the playback route with authentication

## 📌 Future Improvements

- Add support for cloud storage (AWS S3 or GCP)
- Implement video resolution selection (adaptive bitrate)
- Build a frontend with video player integration

