import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { AuthContext, AuthContextProvider, useAuth } from "../context/authContext";

const MainLayout = () => {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    //check if user authenticated or not
    if (typeof isAuthenticated == "undefined") return;
    if (segments.length === 0) return;
    const inApp = segments[0] == "(app)";
    if (isAuthenticated && !inApp) {
      // Redirect to Home
      router.replace("home");
    } else if (isAuthenticated == false) {
      // Redirect to Sign In
      router.replace("signIn");
    }
  }, [isAuthenticated]);
  return <Slot />;
};

export default function RootLayout() {
  return (
    <AuthContextProvider>
      <MainLayout />
    </AuthContextProvider>
  );
}