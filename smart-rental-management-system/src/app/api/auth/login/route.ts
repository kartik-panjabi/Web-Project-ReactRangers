import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { sign } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();
        console.log('Login attempt for email:', email);

        // Connect to MongoDB
        await connectToDatabase();

        // Find user by email
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
        }
        
        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Compare password directly
        console.log('Attempting password comparison');
        console.log('Input password:', password);
        console.log('Stored hash:', user.password);
        
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Direct bcrypt comparison result:', isMatch);
        
        if (!isMatch) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Create JWT token
        const token = sign(
            { 
                userId: user._id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        // Return user data and token
        return NextResponse.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
  