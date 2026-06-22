import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { setSession } from '@/lib/session';
import type { ApiResponse, SessionUser } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `SELECT id, name, role, location, password_hash
       FROM users
       WHERE LOWER(username) = LOWER($1)
         AND is_active = true
       LIMIT 1`,
      [username.trim()]
    );

    const user = result.rows[0];

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Support both bcrypt hashes and plain-text passwords (legacy seed)
    let valid = false;
    if (user.password_hash.startsWith('$2')) {
      valid = await bcrypt.compare(password, user.password_hash);
    } else {
      valid = password === user.password_hash;
    }

    if (!valid) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const session: SessionUser = {
      id:       user.id,
      name:     user.name,
      role:     user.role,
      location: user.location ?? '',
    };

    // setSession writes to cookie — must be done before response is sent
    await setSession(session);

    const dest =
      user.role === 'admin'
        ? '/admin'
        : user.role === 'delivery_person'
        ? '/delivery'
        : '/client';

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { role: user.role, redirect: dest },
    });
  } catch (err) {
    console.error('[login]', err);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
