// src/app/api/auth/signup/route.ts
import { connectMongo } from '@/lib/mongodb';  // Or the relative import path
import User, { IUser } from '@/models/User';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('Starting signup process...');
    await connectMongo();  // Connect to MongoDB

    const { name, email, password, role, profilePicture, phone } = await request.json();
    console.log('Received signup data:', { name, email, role, hasPassword: !!password });

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    // Create new user with plain password (model will hash it)
    const newUser = new User({
      name,
      email,
      password, // Plain password - will be hashed by model
      role,
      profilePicture,
      phone,
    });

    console.log('Saving user to database...');
    await newUser.save();  // Save the user to MongoDB
    console.log('User saved successfully');
    
    // Verify the stored hash
    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');

    if (user) {
        console.log('User details:', {
            id: user._id,
            email: user.email,
            role: user.role,
            hasPassword: !!user.password,
            passwordLength: user.password?.length,
            storedHash: user.password
        });

        // Verify password match
        const isMatch = await user.comparePassword(password);
        console.log('Password match:', isMatch);
    }

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}