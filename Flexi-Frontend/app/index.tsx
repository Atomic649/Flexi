import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { LogBox } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  // State สำหรับเก็บสถานะ login และการโหลดข้อมูล
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // ตรวจสอบสถานะ login จาก AsyncStorage เมื่อเปิดแอพ
  useEffect(() => {
    const initialize = async () => {
      try {
        const isLoggedIn = await AsyncStorage.getItem("isLoggedIn");
        // console.log('isLoggedIn:', isLoggedIn);
        if (isLoggedIn === "true") {
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Failed to check login status:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initialize();
  }, []);

  // รอจนกว่าจะโหลดข้อมูลเสร็จ
  if (!isInitialized) return null;

  LogBox.ignoreAllLogs();

  return (
    <>
      {/* ถ้า login แล้ว redirect ไปหน้า home */}
      {isLoggedIn && <Redirect href="/(tabs)/home" />}

      {/* ถ้ายังไม่ login redirect ไปหน้า landing */}
      {!isLoggedIn && <Redirect href="/landing" />}
    </>
  );
}
