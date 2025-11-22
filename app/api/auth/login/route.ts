import { NextRequest, NextResponse } from 'next/server';
import { authenticateTeacher, authenticateAdmin } from '@/lib/data';

export async function POST(request: NextRequest) {
  try {
    const { username, password, role } = await request.json();

    if (!username || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (role === 'teacher') {
      const teacher = authenticateTeacher(username, password);
      if (teacher) {
        return NextResponse.json({ user: teacher });
      }
    } else if (role === 'admin') {
      const admin = authenticateAdmin(username, password);
      if (admin) {
        return NextResponse.json({ user: admin });
      }
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
