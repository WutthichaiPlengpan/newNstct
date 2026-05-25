"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { Turnstile } from "@marsidev/react-turnstile";
import Swal from "sweetalert2";


interface Job {
  JobID: number;
  Title: string;
  Department: string;
  Location: string;
  Requirements: string;
}

export default function JobPage() {
  const { t } = useLanguage();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedJob, setSelectedJob] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("/api/admin/jobs");
        const data = await res.json();
        if (data.success) setJobs(data.data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const openApplyForm = (jobTitle: string) => {
    setSelectedJob(jobTitle);
    setIsModalOpen(true);
    setFile(null);
    setTurnstileToken("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        Swal.fire(
          "แจ้งเตือน",
          t("job.error_file_size") || "ไฟล์ต้องมีขนาดไม่เกิน 5MB",
          "warning",
        );
        e.target.value = "";
        setFile(null);
      } else {
        setFile(selectedFile);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!turnstileToken) {
      Swal.fire(
        "แจ้งเตือน",
        t("job.error_bot") || "กรุณายืนยันตัวตน",
        "warning",
      );
      return;
    }
    if (!file) {
      Swal.fire("แจ้งเตือน", "กรุณาอัปโหลดเรซูเม่", "warning");
      return;
    }

    setIsSubmitting(true);

    try {
      // 💡 1. แพ็คข้อมูลทั้งหมดจากฟอร์ม
      const formData = new FormData(e.currentTarget);
      
      // 💡 2. ยืนยันการแนบไฟล์และตำแหน่งงาน (เผื่อกรณีฟอร์มมีปัญหา จะได้มีข้อมูลส่งไปแน่นอน)
      formData.set("resume", file);
      if (!formData.get("position")) {
        formData.append("position", selectedJob);
      }

      // 💡 3. ส่งข้อมูลไปที่ API Backend เพื่อส่งอีเมล
      const res = await fetch("/api/apply-job", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setIsModalOpen(false); // ปิดหน้าต่าง
        Swal.fire(
          "สำเร็จ!",
          t("job.success_msg") || "ส่งใบสมัครเรียบร้อยแล้ว",
          "success",
        );
      } else {
        Swal.fire("ข้อผิดพลาด", data.message || "ไม่สามารถส่งใบสมัครได้", "error");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("การเชื่อมต่อล้มเหลว", "ไม่สามารถติดต่อเซิร์ฟเวอร์ได้", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <div className="bg-blue-900 text-white py-16 md:py-24 px-4 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        ></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 drop-shadow-md uppercase">
            {t("job.title") || "JOIN OUR TEAM"}
          </h1>
          <p className="text-blue-100 text-lg md:text-xl max-w-3xl mx-auto font-light leading-relaxed">
            {t("job.welfare_intro")}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-16">
        {/* ================= สวัสดิการ (Welfare & Benefits) ================= */}
        <section className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">
              {t("job.welfare_title") || "สวัสดิการที่จะได้รับ"}
            </h2>
            <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((num) => (
              <div
                key={num}
                className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-300 transition-colors group"
              >
                <div className="w-10 h-10 shrink-0 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <svg
                    className="w-5 h-5"
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
                </div>
                <span className="text-gray-700 font-medium text-sm md:text-base">
                  {t(`job.wel_${num}`)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ================= ตำแหน่งงานที่เปิดรับ (Open Positions) ================= */}
        <section>
          <h2 className="text-3xl font-bold text-blue-900 mb-8 border-l-4 border-blue-600 pl-4">
            {t("job.open_positions") || "ตำแหน่งงานที่เปิดรับ"}
          </h2>

          <div className="space-y-6">
            {isLoading ? (
              <div className="text-center py-12 text-gray-500 font-medium">
                กำลังโหลดตำแหน่งงาน...
              </div>
            ) : jobs.length > 0 ? (
              jobs.map((job) => (
                <div
                  key={job.JobID}
                  className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col md:flex-row md:justify-between md:items-center gap-6"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                        {job.Department}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full flex items-center">
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {job.Location}
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
                      {job.Title}
                    </h3>

                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      {t("job.req_qualifications") || "คุณสมบัติผู้สมัคร"}
                    </p>
                    <ul className="space-y-1.5">
                      {/* 💡 ตัดแยกบรรทัด (\n) ที่บันทึกมาจาก Admin ให้กลายเป็น List */}
                      {job.Requirements.split("\n").map(
                        (req, idx) =>
                          req.trim() !== "" && (
                            <li
                              key={idx}
                              className="flex items-start text-gray-600 text-sm"
                            >
                              <span className="text-blue-500 mr-2 mt-0.5">
                                ✔
                              </span>
                              <span>{req}</span>
                            </li>
                          ),
                      )}
                    </ul>
                  </div>
                  <div className="shrink-0 mt-4 md:mt-0">
                    <button
                      onClick={() => openApplyForm(job.Title)}
                      className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 hover:-translate-y-1 transition-all duration-300 shadow-md"
                    >
                      {t("job.btn_apply") || "สมัครงานตำแหน่งนี้"}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 text-gray-500">
                ขณะนี้ยังไม่มีตำแหน่งงานที่เปิดรับสมัคร
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ================= แบบฟอร์มสมัครงาน (Modal) ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-2xl font-bold text-blue-900">
                {t("job.form_title") || "แบบฟอร์มสมัครงาน"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-red-500 bg-white p-2 rounded-full shadow-sm transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {t("job.form_position") || "ตำแหน่งที่ต้องการสมัคร"}
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={selectedJob}
                    readOnly
                    className="w-full px-4 py-3 bg-blue-50 border border-blue-100 text-blue-800 font-bold rounded-lg outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      {t("job.form_name") || "ชื่อ-สกุล"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullname"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      {t("job.form_phone") || "เบอร์โทรศัพท์"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {t("job.form_email") || "อีเมล"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {t("job.form_resume")}{" "}
                    <span className="text-red-500">*</span>{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative bg-gray-50/50">
                    <input
                      type="file"
                      name="resume"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx"
                      required
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <svg
                      className="mx-auto h-8 w-8 text-gray-400 mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="text-gray-700 font-medium">
                      {file
                        ? file.name
                        : t("job.file_select") ||
                          "คลิกหรือลากไฟล์มาวางเพื่ออัปโหลด"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t("job.file_limit") ||
                        "รองรับไฟล์ .pdf, .doc, .docx ขนาดไม่เกิน 5MB"}
                    </p>
                  </div>
                </div>

                <div className="flex justify-center bg-gray-50 py-4 rounded-xl border border-gray-100">
                  <Turnstile
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
                    onSuccess={(token) => setTurnstileToken(token)}
                    onError={() => setTurnstileToken("")}
                    onExpire={() => setTurnstileToken("")}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-green-600 text-white font-bold text-lg rounded-xl hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-300 disabled:bg-gray-400"
                >
                  {isSubmitting
                    ? "กำลังส่งข้อมูล..."
                    : t("job.btn_submit") || "ส่งใบสมัคร"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
