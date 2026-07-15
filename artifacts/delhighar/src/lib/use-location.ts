import { useState, useCallback } from "react";

export interface Coords {
  lat: number;
  lng: number;
}

export type LocationStatus = "idle" | "loading" | "granted" | "denied" | "unavailable";

function haversineKm(a: Coords, b: Coords): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function useUserLocation() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [status, setStatus] = useState<LocationStatus>("idle");

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("unavailable");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus("granted");
      },
      () => setStatus("denied"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  const getDistance = useCallback(
    (lat: string | number | null, lng: string | number | null): number | null => {
      if (!coords || lat == null || lng == null) return null;
      const la = typeof lat === "string" ? parseFloat(lat) : lat;
      const lo = typeof lng === "string" ? parseFloat(lng) : lng;
      if (isNaN(la) || isNaN(lo)) return null;
      return haversineKm(coords, { lat: la, lng: lo });
    },
    [coords]
  );

  return { coords, status, request, getDistance };
}
