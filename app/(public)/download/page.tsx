"use client";

import { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { Turnstile } from "@marsidev/react-turnstile";
import Swal from "sweetalert2";

export default function DownloadPage() {
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<"download" | "upload">("download");

  // State ฝั่งดาวน์โหลด
  const [searchCode, setSearchCode] = useState("");
  // 💡 ใส่ property 'url' ด้วย เพื่อให้ปุ่มดาวน์โหลดมีปลายทาง
  const [foundFiles, setFoundFiles] = useState<
    { name: string; size: string; url: string }[] | null
  >(null);
  const [isSearching, setIsSearching] = useState(false);

  // State ฝั่งอัปโหลด
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });

  // 💡 เปลี่ยนจากเก็บแค่ไฟล์เดียว (file) มาเป็นเก็บหลายไฟล์แบบ Array (files)
  const [uploadData, setUploadData] = useState({
    topic: "",
    files: [] as File[],
  });
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const [loginTurnstileToken, setLoginTurnstileToken] = useState("");
  const [uploadTurnstileToken, setUploadTurnstileToken] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCode.length < 8) {
      Swal.fire("แจ้งเตือน", "รหัสต้องมีความยาว 8-12 ตัวอักษร", "warning");
      return;
    }

    setIsSearching(true);
    try {
      // 💡 ดึงข้อมูลไฟล์จริงจาก API ที่เราเพิ่งสร้าง
      const res = await fetch("/api/download/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: searchCode }),
      });
      const data = await res.json();

      if (data.success) {
        if (data.files.length > 0) {
          setFoundFiles(data.files);
        } else {
          setFoundFiles(null);
          Swal.fire(
            "ไม่พบไฟล์",
            "ไม่พบไฟล์ที่ตรงกับรหัสนี้ หรือไฟล์อาจถูกลบไปแล้ว",
            "info",
          );
        }
      } else {
        Swal.fire(
          "ข้อผิดพลาด",
          data.message || "ไม่สามารถค้นหาไฟล์ได้",
          "error",
        );
      }
    } catch (error) {
      Swal.fire("ข้อผิดพลาด", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้", "error");
    } finally {
      setIsSearching(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!loginTurnstileToken) {
      Swal.fire("ยืนยันตัวตน", "กรุณายืนยันตัวตนว่าคุณไม่ใช่บอท", "warning");
      return;
    }

    try {
      const res = await fetch("/api/download/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginForm.username,
          password: loginForm.password,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setIsLoggedIn(true);
      } else {
        Swal.fire(
          "เข้าสู่ระบบล้มเหลว",
          data.message || "รหัสผ่านไม่ถูกต้อง",
          "error",
        );
      }
    } catch (error) {
      Swal.fire("ข้อผิดพลาด", "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้", "error");
    }
  };

  // 💡 ฟังก์ชันใหม่สำหรับจัดการการเลือกไฟล์ (หลายไฟล์) และเช็คขนาด 10MB
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    // คำนวณขนาดไฟล์รวมทั้งหมด
    const totalSize = selectedFiles.reduce((acc, file) => acc + file.size, 0);
    const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

    if (totalSize > MAX_SIZE) {
      Swal.fire(
        "ขนาดไฟล์เกิน 10MB",
        "โปรดเลือกไฟล์ให้น้อยลง หรือบีบอัดไฟล์ก่อนอัปโหลด",
        "warning",
      );
      e.target.value = ""; // เคลียร์ช่อง input
      setUploadData({ ...uploadData, files: [] });
      return;
    }

    setUploadData({ ...uploadData, files: selectedFiles });
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!uploadTurnstileToken) {
      Swal.fire("ยืนยันตัวตน", "กรุณายืนยันตัวตนว่าคุณไม่ใช่บอท", "warning");
      return;
    }

    // เช็คว่ามีอย่างน้อย 1 ไฟล์
    if (!uploadData.topic || uploadData.files.length === 0) {
      Swal.fire(
        "ข้อมูลไม่ครบ",
        "กรุณาเลือกหมวดหมู่และไฟล์อย่างน้อย 1 ไฟล์",
        "warning",
      );
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("topic", uploadData.topic);

    // 💡 นำทุกไฟล์ที่เลือกใส่เข้าไปใน FormData
    uploadData.files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const res = await fetch("/api/download/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setGeneratedCode(data.code);
        Swal.fire(
          "อัปโหลดสำเร็จ!",
          "ไฟล์ทั้งหมดของคุณถูกเข้ารหัสและพร้อมแชร์แล้ว",
          "success",
        );
      } else {
        Swal.fire("อัปโหลดล้มเหลว", data.message || "ไฟล์ไม่ถูกต้อง", "error");
      }
    } catch (error) {
      Swal.fire("ข้อผิดพลาด", "ไม่สามารถอัปโหลดไฟล์ได้", "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-20">
      <div className="bg-blue-900 text-white py-16 md:py-24 px-4 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        ></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-md">
            {t("download.title")}
          </h1>
          <p className="text-blue-200 text-lg md:text-xl max-w-2xl mx-auto font-light">
            {t("download.subtitle")}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex bg-white rounded-t-2xl shadow-sm border-b border-gray-100 overflow-hidden">
          <button
            onClick={() => setActiveTab("download")}
            className={`flex-1 py-4 font-bold text-center transition-colors ${activeTab === "download" ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600" : "text-gray-500 hover:bg-gray-50"}`}
          >
            {t("download.tab_download")}
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex-1 py-4 font-bold text-center transition-colors ${activeTab === "upload" ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600" : "text-gray-500 hover:bg-gray-50"}`}
          >
            {t("download.tab_upload")}
          </button>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-b-2xl shadow-sm border border-gray-100">
          {/* ================= 1. หน้าดาวน์โหลด ================= */}
          {activeTab === "download" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <form
                onSubmit={handleSearch}
                className="max-w-xl mx-auto space-y-4"
              >
                <label className="block text-gray-700 font-medium text-center text-lg mb-2">
                  {t("download.enter_code")}
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                    placeholder="e.g. X9F2K8M1"
                    maxLength={12}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center sm:text-left text-lg tracking-widest font-mono uppercase"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap disabled:bg-gray-400"
                  >
                    {isSearching ? "กำลังค้นหา..." : t("download.btn_search")}
                  </button>
                </div>
              </form>

              {foundFiles && (
                <div className="mt-10 border-t border-gray-100 pt-8">
                  <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center">
                    <svg
                      className="w-6 h-6 mr-2 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {t("download.file_list_title")}
                  </h3>
                  <div className="space-y-3">
                    {foundFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center mb-3 sm:mb-0">
                          <svg
                            className="w-8 h-8 text-red-500 mr-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <div>
                            <p className="font-medium text-gray-800">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">{file.size}</p>
                          </div>
                        </div>

                        <a
                          href={file.url}
                          download={file.name}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto px-4 py-2 text-sm bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-md transition-colors flex items-center justify-center cursor-pointer"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                          ดาวน์โหลด
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= 2. หน้าอัปโหลด ================= */}
          {activeTab === "upload" && (
            <div className="animate-in fade-in duration-300">
              {!isLoggedIn ? (
                <form
                  onSubmit={handleLogin}
                  className="max-w-md mx-auto bg-gray-50 p-8 rounded-xl border border-gray-200"
                >
                  {/* ... (แบบฟอร์มล็อกอินเหมือนเดิม ไม่เปลี่ยนแปลง) ... */}
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {t("download.login_title")}
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("download.username")}
                      </label>
                      <input
                        type="text"
                        value={loginForm.username}
                        onChange={(e) =>
                          setLoginForm({
                            ...loginForm,
                            username: e.target.value,
                          })
                        }
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("download.password")}
                      </label>
                      <input
                        type="password"
                        value={loginForm.password}
                        onChange={(e) =>
                          setLoginForm({
                            ...loginForm,
                            password: e.target.value,
                          })
                        }
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex justify-center bg-white py-3 rounded-lg border border-gray-200 mt-2">
                      <Turnstile
                        siteKey={
                          process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""
                        }
                        onSuccess={(token) => setLoginTurnstileToken(token)}
                        onError={() => setLoginTurnstileToken("")}
                        onExpire={() => setLoginTurnstileToken("")}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-blue-900 text-white font-bold rounded-lg hover:bg-blue-800 transition-colors shadow-sm mt-4"
                    >
                      {t("download.btn_login")}
                    </button>
                  </div>
                </form>
              ) : !generatedCode ? (
                <form
                  onSubmit={handleUpload}
                  className="max-w-2xl mx-auto space-y-6"
                >
                  <h3 className="text-2xl font-bold text-blue-900 border-b pb-3">
                    {t("download.upload_title")}
                  </h3>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {t("download.select_topic")}
                    </label>
                    <select
                      value={uploadData.topic}
                      onChange={(e) =>
                        setUploadData({ ...uploadData, topic: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 outline-none"
                    >
                      <option value="" disabled>
                        --- {t("download.select_topic")} ---
                      </option>
                      <option value="general">{t("download.topic_1")}</option>
                      <option value="engineering">
                        {t("download.topic_2")}
                      </option>
                      <option value="billing">{t("download.topic_3")}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {t("download.upload_disc")}{" "}
                      <span className="text-blue-600 font-normal">
                        ({t("download.upload_disc2")})
                      </span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:bg-blue-50 hover:border-blue-400 transition-colors cursor-pointer relative">
                      {/* 💡 เพิ่มคำสั่ง multiple ให้สามารถเลือกได้หลายไฟล์ */}
                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        required
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                      />

                      <svg
                        className="mx-auto h-12 w-12 text-gray-400 mb-3"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      {/* 💡 แก้ไขให้แสดงชื่อไฟล์ทั้งหมดที่ถูกเลือก */}
                      <div className="text-gray-600 font-medium line-clamp-2 px-4">
                        {uploadData.files.length > 0
                          ? uploadData.files.map((f) => f.name).join(", ")
                          : t("download.select_file")}
                      </div>
                      {uploadData.files.length > 0 && (
                        <p className="text-blue-600 font-bold mt-2">
                          {t("download.file_selected")} {uploadData.files.length} {t("download.files")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-center bg-gray-50 py-4 rounded-xl border border-gray-100">
                    <Turnstile
                      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
                      onSuccess={(token) => setUploadTurnstileToken(token)}
                      onError={() => setUploadTurnstileToken("")}
                      onExpire={() => setUploadTurnstileToken("")}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUploading}
                    className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md text-lg disabled:bg-gray-400"
                  >
                    {isUploading ? "กำลังอัปโหลด..." : t("download.btn_upload")}
                  </button>
                </form>
              ) : (
                <div className="max-w-md mx-auto text-center space-y-6 py-8">
                  <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <svg
                      className="w-10 h-10"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {t("download.upload_success")}
                  </h3>
                  <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl">
                    <p className="text-amber-800 font-medium mb-3">
                      {t("download.your_code")}
                    </p>
                    <p className="text-4xl font-mono font-bold text-amber-600 tracking-widest bg-white py-3 rounded-lg border border-amber-200 shadow-inner">
                      {generatedCode}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setGeneratedCode(null);
                      setUploadData({ topic: "", files: [] });
                      setUploadTurnstileToken("");
                    }}
                    className="text-blue-600 font-medium hover:underline"
                  >
                    อัปโหลดไฟล์ชุดใหม่
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
