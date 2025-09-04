import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

interface TestUser {
  email: string;
  password: string;
  username: string;
  token?: string;
  userId?: string;
}

const testUser: TestUser = {
  email: `testuser_${Date.now()}@example.com`,
  password: 'Test@123',
  username: `testuser_${Date.now()}`,
};

let roomId: string;

async function testEndpoint(description: string, request: () => Promise<any>) {
  console.log(`\nTesting: ${description}`);
  try {
    const response = await request();
    console.log('✅ Success:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error:', error.response?.data || error.message);
    throw error;
  }
}

async function runTests() {
  try {
    // Test 1: User Registration
    console.log('\n===== Starting API Tests =====');
    
    await testEndpoint('User Registration', () =>
      axios.post(`${API_BASE_URL}/api/auth/register`, {
        email: testUser.email,
        password: testUser.password,
        username: testUser.username,
      })
    );

    // Test 2: User Login
    const loginResponse = await testEndpoint('User Login', () =>
      axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: testUser.email,
        password: testUser.password,
      })
    );

    testUser.token = loginResponse.token;
    testUser.userId = loginResponse.user.id;

    // Test 3: Get Current User
    await testEndpoint('Get Current User', () =>
      axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${testUser.token}` },
      })
    );

    // Test 4: Create Room
    const roomResponse = await testEndpoint('Create Room', () =>
      axios.post(
        `${API_BASE_URL}/api/rooms`,
        { name: 'Test Room' },
        { headers: { Authorization: `Bearer ${testUser.token}` } }
      )
    );

    roomId = roomResponse.room.id;

    // Test 5: Get Room Details
    await testEndpoint('Get Room Details', () =>
      axios.get(`${API_BASE_URL}/api/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${testUser.token}` },
      })
    );

    // Test 6: Join Room
    await testEndpoint('Join Room', () =>
      axios.post(
        `${API_BASE_URL}/api/rooms/${roomId}/join`,
        {},
        { headers: { Authorization: `Bearer ${testUser.token}` } }
      )
    );

    // Test 7: Change Video
    await testEndpoint('Change Video', () =>
      axios.put(
        `${API_BASE_URL}/api/rooms/${roomId}/video`,
        { videoId: 'dQw4w9WgXcQ' },
        { headers: { Authorization: `Bearer ${testUser.token}` } }
      )
    );

    // Test 8: Update Playback State
    await testEndpoint('Update Playback State', () =>
      axios.put(
        `${API_BASE_URL}/api/rooms/${roomId}/playback`,
        { isPlaying: true, currentTime: 10 },
        { headers: { Authorization: `Bearer ${testUser.token}` } }
      )
    );

    // Test 9: Leave Room
    await testEndpoint('Leave Room', () =>
      axios.post(
        `${API_BASE_URL}/api/rooms/${roomId}/leave`,
        {},
        { headers: { Authorization: `Bearer ${testUser.token}` } }
      )
    );

    console.log('\n===== All tests completed successfully! =====');
  } catch (error) {
    console.error('\n===== Tests failed =====');
    process.exit(1);
  }
}

// Run the tests
runTests().catch(console.error);
