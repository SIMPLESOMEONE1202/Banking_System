"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post(`${API_URL}/auth/signup`, formData);
      
      const res = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (res?.error) {
        setError("Account created but failed to sign in automatically.");
        setLoading(false);
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create account");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
          <p className="text-gray-400 mt-2">Join the enterprise platform</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 text-sm">
                {typeof error === 'string' ? error : JSON.stringify(error)}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all placeholder:text-zinc-600 text-white"
                  placeholder="Jane"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all placeholder:text-zinc-600 text-white"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all placeholder:text-zinc-600 text-white"
                placeholder="name@company.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all placeholder:text-zinc-600 text-white"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-white hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
