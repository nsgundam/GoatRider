"use client";
import React from "react";
export function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`px-4 py-2 rounded-md text-[#A52424] bg-white hover:bg-[#FBAF20] ${className}`}
      {...props}
    >
      {children}
    </button>
    
  );
}
