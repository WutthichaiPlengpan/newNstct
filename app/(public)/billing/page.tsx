"use client";

import { useState, useMemo, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";

interface Invoice {
  id: number;
  invNo: string;
  date: string;
  amount: number;
  grandTotal: number;
  type: number; // 1 = ปกติ, -1 = Credit Note
  whtPercent: number;
  status: string; // 'Y' = Success, 'N' = Pending
}

interface Schedule {
  SchMonth: string;
  StartDate: string;
  EndDate: string;
}

export default function BillingPage() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear(); 

  // ================= State การล็อกอิน =================
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ user: "", pass: "" });
  const [supplierName, setSupplierName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // ================= State ข้อมูลบิล =================
  const [isBillingPeriod, setIsBillingPeriod] = useState(false); 
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // ================= State ระบบ Pagination =================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // แสดงหน้าละ 10 รายการ

  // 1. ดึงตารางรอบวางบิลจาก Database
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch(`/api/billing/schedule?year=${currentYear}`);
        const data = await res.json();
        if (data.success) {
          setSchedules(data.data);
          setIsBillingPeriod(data.isOpenNow); 
        }
      } catch (err) {
        console.error("Failed to load schedules", err);
      }
    };
    fetchSchedule();
  }, [currentYear]);

  // 2. ฟังก์ชันล็อกอิน
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/billing/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplierCode: loginForm.user, taxId: loginForm.pass }),
      });

      const data = await res.json();

      if (data.success) {
        setSupplierName(`[${loginForm.user}] ${data.supplierName}`);
        setInvoices(data.invoices);
        setIsLoggedIn(true);
        setCurrentPage(1); // รีเซ็ตกลับไปหน้าแรกเมื่อล็อกอินสำเร็จ
      } else {
        setErrorMessage("รหัสผู้ใช้งานหรือ Tax ID (4 ตัวท้าย) ไม่ถูกต้อง");
      }
    } catch (err) {
      setErrorMessage("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsLoading(false);
    }
  };

  // ================= คำนวณข้อมูลสำหรับ Pagination =================
  const totalPages = Math.ceil(invoices.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = invoices.slice(indexOfFirstItem, indexOfLastItem);

  // ฟังก์ชันคำนวณตัวเลขหน้าที่จะโชว์ (สไลด์ทีละ 5)
  const getPageNumbers = () => {
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // ปรับ startPage กรณีที่อยู่ท้ายๆ แล้วจำนวนหน้าไม่ถึง 5
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  // ================= ฟังก์ชันตาราง =================
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    // เลือกเฉพาะบิล "ในหน้านี้" ที่สถานะยังไม่ Success
    const selectableIds = currentInvoices.filter(inv => inv.status !== 'Y').map((inv) => inv.id);
    
    if (e.target.checked) {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...selectableIds])));
    } else {
      setSelectedIds((prev) => prev.filter((id) => !selectableIds.includes(id)));
    }
  };

  const handleSelectRow = (id: number) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  };

  const handleWhtChange = (id: number, newPercent: number) => {
    setInvoices((prev) => prev.map((inv) => inv.id === id ? { ...inv, whtPercent: newPercent } : inv));
  };

  // ตรวจสอบว่า Checkbox "เลือกทั้งหมด" ควรติ๊กอยู่ไหม
  const selectableCurrentInvoices = currentInvoices.filter(inv => inv.status !== 'Y');
  const isAllCurrentPageSelected = selectableCurrentInvoices.length > 0 && selectableCurrentInvoices.every(inv => selectedIds.includes(inv.id));

  // ================= ระบบคำนวณ Real-time =================
  // คำนวณเฉพาะรายการที่ถูกเลือก (ทุกหน้า)
  const totals = useMemo(() => {
    let sumAmount = 0, sumGrand = 0, sumWht = 0, sumNetPay = 0;
    invoices.forEach((inv) => {
      if (selectedIds.includes(inv.id)) {
        const actualAmount = inv.amount * inv.type;
        const actualGrand = inv.grandTotal * inv.type;
        const whtAmount = (inv.amount * inv.whtPercent) / 100 * inv.type;
        const netPayment = actualGrand - whtAmount;

        sumAmount += actualAmount;
        sumGrand += actualGrand;
        sumWht += whtAmount;
        sumNetPay += netPayment;
      }
    });
    return { sumAmount, sumGrand, sumWht, sumNetPay };
  }, [invoices, selectedIds]);

  // 3. ฟังก์ชัน Submit ยืนยันการวางบิล
  const handleSubmitBilling = async (action: 'confirm' | 'cancel') => {
    if (selectedIds.length === 0) {
      alert("ท่านยังไม่ได้เลือกรายการบิล");
      return;
    }
    
    if (!confirm(`คุณต้องการ ${action === 'confirm' ? 'ยืนยัน' : 'ยกเลิก'} การวางบิลจำนวน ${selectedIds.length} รายการ ใช่หรือไม่?`)) return;

    try {
      const selectedInvoices = invoices.filter(inv => selectedIds.includes(inv.id));
      const res = await fetch("/api/billing/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierCode: loginForm.user,
          action: action,
          invoices: selectedInvoices
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        alert("ทำรายการสำเร็จเรียบร้อยแล้ว");
        window.location.reload(); 
      } else {
        alert("เกิดข้อผิดพลาด: " + data.message);
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการส่งข้อมูล");
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-20">
      <div className="bg-blue-900 text-white py-16 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-md">{t("billing.title")}</h1>
          <p className="text-blue-200 text-lg font-light">{t("billing.subtitle")}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {!isLoggedIn ? (
          <div className="max-w-md mx-auto bg-white p-8 md:p-10 rounded-2xl shadow-lg border border-gray-100 mt-10 animate-in zoom-in-95 duration-300">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-blue-900">{t("billing.login_box_title")}</h2>
            </div>
            
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center border border-red-100">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t("billing.user_code")}</label>
                <input 
                  type="text" 
                  value={loginForm.user} 
                  onChange={(e) => setLoginForm({...loginForm, user: e.target.value})}
                  required 
                  disabled={isLoading}
                  placeholder="e.g. V-00123"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t("billing.tax_id")} (4 ตัวท้าย)</label>
                <input 
                  type="password" 
                  value={loginForm.pass} 
                  onChange={(e) => setLoginForm({...loginForm, pass: e.target.value})}
                  required 
                  disabled={isLoading}
                  placeholder="****"
                  maxLength={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all tracking-widest text-center" 
                />
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md mt-4 text-lg disabled:bg-gray-400">
                {isLoading ? "กำลังตรวจสอบ..." : t("billing.btn_login")}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center">
              <h2 className="text-xl font-bold text-blue-900">
                {t("billing.supplier_info")} <span className="text-blue-600 font-medium ml-2">{supplierName}</span>
              </h2>
            </div>

            {/* ตารางข้อมูลบิล */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-center w-12">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-blue-600 rounded cursor-pointer" 
                          onChange={handleSelectAll} 
                          checked={isAllCurrentPageSelected} 
                          disabled={selectableCurrentInvoices.length === 0}
                        />
                      </th>
                      <th className="px-4 py-3 text-center">{t("billing.tb_no")}</th>
                      <th className="px-4 py-3">{t("billing.tb_inv_no")}</th>
                      <th className="px-4 py-3 text-center">{t("billing.tb_inv_date")}</th>
                      <th className="px-4 py-3 text-right">{t("billing.tb_amount")}</th>
                      <th className="px-4 py-3 text-right">{t("billing.tb_grand")}</th>
                      <th className="px-4 py-3 text-center">{t("billing.tb_tax_percent")}</th>
                      <th className="px-4 py-3 text-right">{t("billing.tb_withholding")}</th>
                      <th className="px-4 py-3 text-right">{t("billing.tb_payment")}</th>
                      <th className="px-4 py-3 text-center">{t("billing.tb_status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentInvoices.length > 0 ? currentInvoices.map((inv, index) => {
                      const isChecked = selectedIds.includes(inv.id);
                      const whtAmount = (inv.amount * inv.whtPercent) / 100;
                      const netPayment = inv.grandTotal - whtAmount;
                      const isSuccess = inv.status === 'Y';
                      
                      return (
                        <tr key={inv.id} className={`border-b border-gray-50 transition-colors ${isChecked ? 'bg-blue-50/50' : 'hover:bg-gray-50'} ${isSuccess ? 'opacity-70' : ''}`}>
                          <td className="px-4 py-3 text-center">
                            <input 
                              type="checkbox" 
                              className={`w-4 h-4 text-blue-600 rounded ${isSuccess ? 'cursor-not-allowed grayscale' : 'cursor-pointer'}`}
                              checked={isChecked} 
                              onChange={() => handleSelectRow(inv.id)} 
                              disabled={isSuccess} // Disable ถ้า Success แล้ว
                            />
                          </td>
                          <td className="px-4 py-3 text-center text-gray-500">{indexOfFirstItem + index + 1}</td>
                          <td className="px-4 py-3 font-medium text-blue-900">{inv.type === -1 && <span className="text-red-500 font-bold mr-1">(-)</span>}{inv.invNo}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{inv.date}</td>
                          <td className="px-4 py-3 text-right text-gray-700">{(inv.amount * inv.type).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                          <td className="px-4 py-3 text-right text-gray-700">{(inv.grandTotal * inv.type).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                          <td className="px-4 py-3 text-center">
                            <select 
                              value={inv.whtPercent} 
                              onChange={(e) => handleWhtChange(inv.id, Number(e.target.value))} 
                              disabled={!isChecked || isSuccess} 
                              className={`border border-gray-300 rounded px-2 py-1 text-sm outline-none ${(!isChecked || isSuccess) && 'opacity-50 bg-gray-100'}`}
                            >
                              {[0, 1, 1.5, 2, 3, 5].map(val => <option key={val} value={val}>{val}</option>)}
                            </select>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-700">{(whtAmount * inv.type).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                          <td className="px-4 py-3 text-right font-bold text-gray-900">{(netPayment * inv.type).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                              {isSuccess ? 'Success' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      );
                    }) : (
                        <tr><td colSpan={10} className="text-center py-8 text-gray-500">ไม่พบข้อมูลการวางบิล</td></tr>
                    )}
                  </tbody>
                  <tfoot className="bg-blue-900 text-white font-bold text-base">
                    <tr>
                      <td colSpan={4} className="px-4 py-4 text-right uppercase tracking-wider">{t("billing.total_net")} <span className="text-xs font-normal ml-2 text-blue-300">(เฉพาะรายการที่เลือก)</span></td>
                      <td className="px-4 py-4 text-right text-blue-200">{totals.sumAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                      <td className="px-4 py-4 text-right text-blue-200">{totals.sumGrand.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                      <td className="px-4 py-4"></td>
                      <td className="px-4 py-4 text-right text-red-300">{totals.sumWht.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                      <td className="px-4 py-4 text-right text-green-300 text-lg">{totals.sumNetPay.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                      <td className="px-4 py-4"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        แสดง <span className="font-medium">{indexOfFirstItem + 1}</span> ถึง <span className="font-medium">{Math.min(indexOfLastItem, invoices.length)}</span> จาก <span className="font-medium">{invoices.length}</span> รายการ
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        {/* ปุ่มย้อนกลับ */}
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        
                        {/* เลขหน้า (สไลด์ทีละ 5) */}
                        {getPageNumbers().map(number => (
                          <button
                            key={number}
                            onClick={() => setCurrentPage(number)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === number
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {number}
                          </button>
                        ))}

                        {/* ปุ่มถัดไป */}
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ส่วนปุ่ม Confirm / Cancel */}
            {isBillingPeriod ? (
              <div className="flex flex-col sm:flex-row justify-center gap-4 py-4">
                <button onClick={() => handleSubmitBilling('confirm')} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md text-lg">
                  {t("billing.btn_confirm")} ({selectedIds.length} รายการ)
                </button>
                <button onClick={() => handleSubmitBilling('cancel')} className="px-8 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 shadow-md text-lg">
                  {t("billing.btn_cancel")}
                </button>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-center">
                <p className="text-red-600 text-xl font-bold">ขออภัย ยังไม่ถึงช่วงเวลาเปิดระบบวางบิล</p>
              </div>
            )}

            {/* ตารางรอบวางบิลจาก Database */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-3xl mx-auto mt-10">
              <div className="bg-blue-50 py-3 border-b border-blue-100">
                <h3 className="text-lg font-bold text-blue-900 text-center">วันที่เปิดระบบวางบิล ปี {currentYear + 543}</h3>
              </div>
              <table className="w-full text-sm text-gray-700">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-center w-1/3">เดือน</th>
                    <th className="px-6 py-3 text-center">ช่วงเวลาเปิด-ปิด</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.length > 0 ? schedules.map((sch, idx) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-3 text-center font-medium">{sch.SchMonth}</td>
                      <td className="px-6 py-3 text-center">
                        {new Date(sch.StartDate).toLocaleDateString('th-TH')} - {new Date(sch.EndDate).toLocaleDateString('th-TH')}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={2} className="text-center py-4 text-gray-500">กำลังโหลดข้อมูลรอบวางบิล...</td></tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}