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
        Swal.fire(
          "ข้อผิดพลาด",
          data.message || "ไม่สามารถส่งใบสมัครได้",
          "error",
        );
      }
    } catch (error) {
      console.error(error);
      Swal.fire(
        "การเชื่อมต่อล้มเหลว",
        "ไม่สามารถติดต่อเซิร์ฟเวอร์ได้",
        "error",
      );
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
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
              {t("job.welfare_title") || "สวัสดิการที่จะได้รับ"}
            </h2>
            <div className="w-24 h-1.5 bg-blue-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                id: 1,
                icon: "M21 12V7.5a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 7.5v9A2.25 2.25 0 005.25 18h13.5A2.25 2.25 0 0021 15.75v-1.5m-9-3h.008v.008H12v-.008zM19.5 12h1.5",
              }, // 1. ค่าครองชีพ (กระเป๋าตังค์)
              {
                id: 2,
                icon: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
              }, // 2. เบี้ยขยัน (ดาว/รางวัล)
              {
                id: 3,
                icon: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25",
              }, // 3. ค่าเช่าบ้าน (บ้าน)
              {
                id: 4,
                icon: "M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z",
              }, // 4. อาหารฟรี (ร้านอาหาร)
              { id: 5, icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" }, // 5. ค่าอาหารล่วงเวลา (นาฬิกา/OT)
              {
                id: 6,
                icon: "M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z",
              }, // 6. ค่าอาหารกะ (พระจันทร์)
              {
                id: 7,
                icon: "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99",
              }, // 7. ค่ากะ (ลูกศรสลับกะ)
              {
                id: 8,
                icon: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12",
              }, // 8. รถรับส่ง (รถบัส/รถตู้)
              {
                id: 9,
                icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
              }, // 9. ยูนิฟอร์ม (บุคคล/พนักงาน)
              {
                id: 10,
                icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
              }, // 10. ประกันชีวิต (หัวใจ)
              {
                id: 11,
                icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
              }, // 11. ประกันสังคม (โล่ป้องกัน)
              {
                id: 12,
                icon: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
              }, // 12. กองทุนสำรองเลี้ยงชีพ (เงินออม/การเงิน)
              {
                id: 13,
                icon: "M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5",
              }, // 13. ท่องเที่ยวประจำปี (เครื่องบินกระดาษ)
            ].map((item) => (
              <div
                key={item.id}
                className="flex items-center space-x-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transform hover:-translate-y-1 transition-all duration-300 group cursor-default"
              >
                <div className="w-12 h-12 shrink-0 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-6 transition-all duration-300">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d={item.icon}
                    />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium text-sm md:text-base group-hover:text-blue-900 transition-colors">
                  {t(`job.wel_${item.id}`)}
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
