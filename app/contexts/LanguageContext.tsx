"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
// แก้ไข Path ให้ชี้ไปที่โฟลเดอร์ locales โดยตรง (เอาคำว่า (public) ออก)
import en from "../locales/en.json";
import th from "../locales/th.json";
import jp from "../locales/jp.json";

const dictionaries: Record<string, any> = { EN: en, TH: th, JP: jp };

interface LanguageContextType {
  currentLang: string;
  setCurrentLang: (lang: string) => void;
  t: (key: string) => string;
  isMounted: boolean; // เพิ่มสถานะการโหลดเพื่อป้องกัน UI กระพริบ
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLang, setCurrentLang] = useState("EN");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); 

    const savedLang = localStorage.getItem("nstct_lang");
    
    // 💡 คีย์เวิร์ดแก้ Error: เช็คว่ามีค่า และ "ค่าที่เซฟไว้ต้องไม่ตรงกับค่าเริ่มต้น (EN)"
    // แบบนี้ React จะไม่ทำการ Render ซ้ำซ้อนถ้าผู้ใช้เพิ่งเข้าเว็บครั้งแรก
    if (savedLang && dictionaries[savedLang] && savedLang !== "EN") {
      setCurrentLang(savedLang);
    }
  }, []); 

  const changeLanguage = (lang: string) => {
    setCurrentLang(lang);
    localStorage.setItem("nstct_lang", lang);
  };

  // ใช้ useCallback เพื่อ Performance ที่ดีขึ้น ไม่ต้องสร้างฟังก์ชันแปลภาษาใหม่ทุกครั้งที่ขยับเมาส์
  const t = useCallback((key: string) => {
    const keys = key.split(".");
    let value = dictionaries[currentLang];
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        return key; 
      }
    }
    return value;
  }, [currentLang]);

  return (
    <LanguageContext.Provider value={{ currentLang, setCurrentLang: changeLanguage, t, isMounted }}>
      <div className={!isMounted ? "opacity-0" : "opacity-100 transition-opacity duration-300"}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}