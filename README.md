# CineSync - Watch Movies Together

CineSync is a real-time collaborative movie watching platform that allows users to watch videos together, synchronize playback, and chat in real-time.

## Features

- **Real-time Video Synchronization**: Play, pause, and seek videos in perfect sync with other viewers
- **Live Chat**: Communicate with other viewers while watching
- **Video Library**: Upload and select videos to watch together
- **Room Management**: Create and join private watch rooms with unique codes
- **User Authentication**: Secure user accounts and personalized experience
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- React.js with TypeScript
- Styled Components for styling
- Socket.IO client for real-time communication

### Backend
- Node.js with Express
- MongoDB for database
- Socket.IO for real-time communication
- Cloudinary for video storage and streaming

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Cloudinary account for video storage

### Installation

#### Clone the Repository
```bash
git clone https://github.com/yourusername/cinesync.git
cd cinesync
```

#### Backend Setup (vimo-server)
1. Navigate to the server directory:
```bash
cd vimo-server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the server directory with the following variables (see `.env.example`):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cinesync
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. Start the server:
```bash
npm start
```
For development with auto-reload:
```bash
npm run dev
```

#### Frontend Setup (cinesync-app)
1. Navigate to the client directory:
```bash
cd cinesync-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the client directory:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

4. Start the React application:
```bash
npm start
```

## Using CineSync

1. **Register/Login**: Create an account or log in to an existing account
2. **Create a Room**: Start a new watch room and get a unique room code
3. **Invite Friends**: Share the room code with friends so they can join
4. **Select a Video**: Choose a video from the library to watch
5. **Watch Together**: Enjoy synchronized video playback with chat

## Cloudinary Setup

For video storage and streaming, CineSync uses Cloudinary. Follow these steps to set up your Cloudinary account:

1. Sign up for a free Cloudinary account at [cloudinary.com](https://cloudinary.com/)
2. Get your Cloud Name, API Key, and API Secret from the dashboard
3. Add these credentials to your `.env` file in the server directory
4. For more details, see the [CLOUDINARY_SETUP.md](./vimo-server/CLOUDINARY_SETUP.md) file

## Troubleshooting

### Common Issues

1. **Video Not Playing**
   - Check if the video source URL is valid
   - Ensure Cloudinary credentials are correctly set up
   - Verify that the video format is supported (MP4 recommended)

2. **Socket Connection Issues**
   - Make sure both server and client are running
   - Check that the CORS_ORIGIN in the server's .env matches your frontend URL
   - Verify that the REACT_APP_SOCKET_URL is correctly set

3. **Room Joining Problems**
   - Ensure you're using the correct room code
   - Check if the room still exists (rooms expire after inactivity)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
