"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [admin, setAdmin] = useState<{ FullName: string; Role: string } | null>(
    null,
  );
  const [isChecking, setIsChecking] = useState(true);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setIsChecking(false);
      return;
    }

    // 🛡️ ปรับปรุง: ดึงข้อมูลผู้ใช้งานผ่าน API ปลอดภัยกว่าการอ่าน Cookie ตรงๆ
    const getAdminData = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();

        if (data.success) {
          setAdmin(data.user);
        } else {
          // ถ้า Token หมดอายุ หรือไม่ถูกต้อง ให้เด้งไปหน้า Login
          router.push("/admin/login");
        }
      } catch (error) {
        console.error("ตรวจสอบสิทธิ์ไม่สำเร็จ:", error);
        router.push("/admin/login");
      } finally {
        setIsChecking(false);
      }
    };

    getAdminData();
  }, [router, isLoginPage]);

  // 🛡️ ปรับปรุง: ส่งคำขอไปให้ Server เคลียร์ httpOnly Cookie
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (res.ok) {
        router.push("/admin/login");
      }
    } catch (error) {
      console.error("Logout Error:", error);
      // เด้งไปหน้าล็อกอินเผื่อไว้ก่อนเพื่อความปลอดภัย
      router.push("/admin/login");
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-medium text-gray-500">
        กำลังตรวจสอบสิทธิ์...
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  const userRole = admin?.Role?.toLowerCase() || "";
  const isAccountRole = userRole === "account";

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-blue-600">NSTCT Admin</h2>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            Main Menu
          </p>

          {!isAccountRole && (
            <>
              <Link
                href="/admin/dashboard"
                className={`block px-4 py-2 rounded-lg transition-colors font-medium ${pathname === "/admin/dashboard" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"}`}
              >
                Dashboard
              </Link>
              <Link
                href="/admin/policies"
                className={`block px-4 py-2 rounded-lg transition-colors font-medium ${pathname === "/admin/policies" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"}`}
              >
                Policies
              </Link>
              <Link
                href="/admin/news"
                className={`block px-4 py-2 rounded-lg transition-colors font-medium ${pathname === "/admin/news" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"}`}
              >
                News
              </Link>
              <Link
                href="/admin/files"
                className={`block px-4 py-2 rounded-lg transition-colors font-medium ${pathname === "/admin/files" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"}`}
              >
                File Manager
              </Link>
              <Link
                href="/admin/jobs"
                className={`block px-4 py-2 rounded-lg transition-colors font-medium ${pathname === "/admin/jobs" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"}`}
              >
                Jobs
              </Link>
              <Link
                href="/admin/activities"
                className={`block px-4 py-2 rounded-lg transition-colors font-medium ${pathname === "/admin/activities" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"}`}
              >
                Activities
              </Link>
            </>
          )}

          <Link
            href="/admin/billing"
            className={`block px-4 py-2 rounded-lg transition-colors font-medium ${pathname === "/admin/billing" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"}`}
          >
            Billing Setup
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <p className="text-sm font-bold text-gray-800">
            {admin?.FullName || "Loading..."}
          </p>
          <p className="text-xs text-gray-500 uppercase">
            {admin?.Role || "User"}
          </p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-gray-500 font-medium">Back-office System</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              ยินดีต้อนรับ,{" "}
              <strong className="text-gray-800">{admin?.FullName}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-1.5 text-sm bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 transition-all border border-red-100"
            >
              SIGN OUT
            </button>
          </div>
        </header>

        <main className="p-8 flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
