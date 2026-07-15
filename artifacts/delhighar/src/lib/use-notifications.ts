import { useState, useEffect, useCallback } from "react";

export type NotifStatus = "default" | "granted" | "denied" | "unsupported";

export function useNotifications() {
  const [status, setStatus] = useState<NotifStatus>("default");

  useEffect(() => {
    if (!("Notification" in window)) {
      setStatus("unsupported");
    } else {
      setStatus(Notification.permission as NotifStatus);
    }
  }, []);

  const request = useCallback(async (): Promise<NotifStatus> => {
    if (!("Notification" in window)) return "unsupported";
    if (Notification.permission === "granted") return "granted";
    const result = await Notification.requestPermission();
    setStatus(result as NotifStatus);
    return result as NotifStatus;
  }, []);

  const notify = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (Notification.permission !== "granted") return;
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "SHOW_NOTIFICATION",
          title,
          options: {
            icon: "/favicon.svg",
            badge: "/favicon.svg",
            ...options,
          },
        });
      } else {
        new Notification(title, {
          icon: "/favicon.svg",
          ...options,
        });
      }
    },
    []
  );

  return { status, request, notify };
}
