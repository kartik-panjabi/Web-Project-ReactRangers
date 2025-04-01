import React from "react";

export default function Loading() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
      <h1 className="text-blue-500 text-2xl font-bold ml-3">🔄 Loading...</h1>
    </div>
  );
}
