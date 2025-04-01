import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectMongo  } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectMongo();
    const users = await User.find({});
    return NextResponse.json(users, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectMongo();
    const { name, email, password } = await request.json();

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields (name, email, password) are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = new User({ name, email, password });
    await newUser.save();
    return NextResponse.json(newUser, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    );
  }
}
