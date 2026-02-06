"use client";
import { useEffect } from "react";
import LogRocket from "logrocket";

export default function LogRocketInit() {
  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_LOGROCKET_APP_ID;
    if (appId) {
      LogRocket.init(appId);
    }
  }, []);

  return null;
}
