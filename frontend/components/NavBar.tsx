"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <nav className="bg-gray-900/80 border-b border-gray-800 text-gray-100 py-4 px-6 flex justify-between items-center backdrop-blur-md">
      <h1
        onClick={() => router.push("/")}
        className="text-xl font-bold text-blue-400 cursor-pointer hover:text-blue-300 transition"
      >
        ☁️ AetherHost Cloud
      </h1>
      <div className="flex gap-5 items-center text-sm">
        {!isLoggedIn ? (
          <>
            <button
              onClick={() => router.push("/login")}
              className="hover:text-blue-400 transition"
            >
              Login
            </button>
            <button
              onClick={() => router.push("/signup")}
              className="hover:text-blue-400 transition"
            >
              Signup
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => router.push("/dashboard")}
              className="hover:text-blue-400 transition"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="hover:text-red-400 transition"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
