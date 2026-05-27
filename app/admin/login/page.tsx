"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Turnstile } from "@marsidev/react-turnstile";


export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    // ปิด Turnstile ไว้ชั่วคราว หรือเปิดใช้งานตามที่คุณต้องการ
    if (!turnstileToken) {
      setErrorMessage("กรุณายืนยันตัวตน");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success) {
        // 💡 บังคับเซ็ต Cookie ฝั่งหน้าจอ (Client) โดยตรง เพื่อให้ชัวร์ 100% ว่าไม่มีการเข้ารหัสซ้อน
        document.cookie = `nstct_admin_token=${encodeURIComponent(JSON.stringify(data.user))}; path=/; max-age=86400`;

        // ย้ายไปหน้า Dashboard
        router.push("/admin/dashboard");
      } else {
        setErrorMessage(data.message || "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch (err) {
      setErrorMessage("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-white p-8 text-center border-b border-gray-100">
          <h1 className="text-3xl font-bold text-blue-600 tracking-tight">
            NSTCT
          </h1>
          <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest">
            Back-office Provider
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Admin Username"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>
            {errorMessage && (
              <p className="text-red-500 text-sm text-center font-medium">
                {errorMessage}
              </p>
            )}

            <div className="flex justify-center">
              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
                onSuccess={setTurnstileToken}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md disabled:bg-gray-400"
            >
              {isLoading ? "กำลังตรวจสอบ..." : "LOGIN TO SYSTEM"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
