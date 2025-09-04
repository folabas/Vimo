import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // TODO: Replace with actual authentication logic
    // This is just a placeholder
    if (email === 'test@example.com' && password === 'password') {
      return NextResponse.json(
        { token: 'dummy-jwt-token' },
        { status: 200 }
      );
    }
    
    return NextResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
