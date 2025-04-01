"use client";

import { useEffect, useState } from "react";

interface User {
  _id: string;
  name: string;
  email: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      setError("Error fetching users");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addUser = async () => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!res.ok) throw new Error("Failed to add user");

      setNewUser({ name: "", email: "", password: "" });
      fetchUsers();
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete user");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>

      {/* Error Message */}
      {error && <p className="text-red-500">{error}</p>}

      {/* User Form */}
      <div className="mb-4 flex flex-col md:flex-row space-x-2">
        <input
          type="text"
          placeholder="Name"
          className="border p-2 w-full md:w-1/3 rounded"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full md:w-1/3 rounded"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full md:w-1/3 rounded"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
        />
        <button
          onClick={addUser}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add User
        </button>
      </div>

      {/* Loading Indicator */}
      {loading && <p className="text-blue-500">Loading users...</p>}

      {/* User List */}
      <ul className="mt-4 space-y-2">
        {users.map((user) => (
          <li
            key={user._id}
            className="flex justify-between bg-gray-100 p-3 rounded shadow"
          >
            <span>
              {user.name} ({user.email})
            </span>
            <button
              onClick={() => deleteUser(user._id)}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
