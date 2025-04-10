# Vimo - Watch Movies Together, Perfectly in Sync

Vimo is a web application that allows users to watch movies together in perfect synchronization, regardless of their physical location. The app provides a seamless experience for creating watch rooms, inviting friends, and enjoying movies together.

## Features

- **Create Watch Rooms**: Start a new watching session by selecting a movie and setting your preferences
- **Join Existing Rooms**: Enter a room code to join a friend's watch session
- **Synchronized Playback**: All viewers see the same content at the same time
- **Real-time Chat**: Communicate with other viewers while watching
- **Movie Selection**: Choose from sample movies or upload your own video files
- **Room Options**: Set subtitle preferences and privacy settings

## Ideal User Flow

1. **Home Screen**
   - Choose to create a room or join an existing one

2. **If Creating a Room**
   - Select a movie from samples or upload your own
   - Configure room settings (subtitles, privacy)
   - Start the watch room and share the code with friends

3. **If Joining a Room**
   - Enter the room code
   - Join the synchronized watching experience

4. **Watch Room**
   - Watch the movie in sync with others
   - Chat with other viewers
   - Control playback (play/pause affects everyone)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/Vimo.git
   cd Vimo
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser

## Technologies Used

- React with TypeScript
- React Router for navigation
- Emotion for styling
- Socket.IO for real-time communication

## Building for Production

```
npm run build
```

This builds the app for production to the `build` folder, optimized for the best performance.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Sample videos provided by [Sample Videos](https://sample-videos.com/)
- Icons and design inspiration from various open-source projects
