'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginUser(formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      throw new Error('Invalid credentials');
    }

    const data = await res.json();
    if (data.token) {
      const cookieStore = await cookies();
      cookieStore.set('token', data.token, { httpOnly: true, secure: true, path: '/' });
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
  
  redirect('/');
}

export async function registerUser(formData: FormData) {
  const fullName = formData.get('fullName');
  const email = formData.get('email');
  const password = formData.get('password');

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password }),
    });

    if (!res.ok) {
      throw new Error('Registration failed');
    }

    const data = await res.json();
    if (data.token) {
      const cookieStore = await cookies();
      cookieStore.set('token', data.token, { httpOnly: true, secure: true, path: '/' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
  
  redirect('/');
}

export async function bookTrek(departureId: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/bookings`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      // Hardcoded userId and paymentReference per requirements
      body: JSON.stringify({ userId: 1, departureId, paymentReference: 'DUMMY_REF_' + Date.now() }),
    });

    if (!res.ok) {
      throw new Error('Booking failed');
    }
  } catch (error) {
    console.error('Booking error:', error);
    throw error;
  }
  
  redirect('/treks');
}

export async function logoutUser() {
    // 1. Destroy the VIP Pass
    (await cookies()).delete('token');
    
    // 2. Kick them back to the homepage
    redirect('/');
}
