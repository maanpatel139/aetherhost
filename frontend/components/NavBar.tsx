"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Cloud } from "lucide-react";

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
    <nav className="bg-gray-900/90 border-b border-gray-800 text-gray-100 py-4 px-8 flex justify-between items-center backdrop-blur-md sticky top-0 z-50">
      {/* Logo */}
      <div
        onClick={() => router.push("/")}
        className="flex items-center gap-2 cursor-pointer"
      >
        <Cloud className="text-blue-400 w-5 h-5" />
        <h1 className="text-lg md:text-xl font-bold text-blue-400 hover:text-blue-300 transition">
          AetherHost Cloud
        </h1>
      </div>

      {/* Nav Links */}
      <div className="hidden md:flex gap-8 items-center text-sm">
        <button
          onClick={() => router.push("/services")}
          className="hover:text-blue-400 transition"
        >
          Services
        </button>
        <button
          onClick={() => router.push("/pricing")}
          className="hover:text-blue-400 transition"
        >
          Pricing
        </button>
        <button
          onClick={() => router.push("/about")}
          className="hover:text-blue-400 transition"
        >
          About
        </button>

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
              className="bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg text-white transition"
            >
              Get Started
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
