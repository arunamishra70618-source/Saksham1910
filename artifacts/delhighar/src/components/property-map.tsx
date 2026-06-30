import { useEffect, useRef, useState } from "react";
import { Navigation, MapPin, ExternalLink } from "lucide-react";

interface PropertyMapProps {
  lat: string | null;
  lng: string | null;
  name: string;
  area: string;
}

export function PropertyMap({ lat, lng, name, area }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  const pgLat = lat ? parseFloat(lat) : null;
  const pgLng = lng ? parseFloat(lng) : null;

  useEffect(() => {
    if (!pgLat || !pgLng) return;

    let map: any = null;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (!mapRef.current || mapInstanceRef.current) return;

      map = L.map(mapRef.current, { zoomControl: true, attributionControl: false }).setView(
        [pgLat, pgLng],
        15
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      const pgIcon = L.divIcon({
        html: `<div style="background:#7C3AED;width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(124,58,237,0.4);display:flex;align-items:center;justify-content:center">
                 <span style="transform:rotate(45deg);display:block;width:10px;height:10px;background:white;border-radius:50%"></span>
               </div>`,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -36],
      });

      L.marker([pgLat, pgLng], { icon: pgIcon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:sans-serif;padding:4px">
            <strong style="color:#1A2340">${name}</strong><br/>
            <span style="color:#666;font-size:12px">${area}</span>
           </div>`
        )
        .openPopup();

      mapInstanceRef.current = map;
      setMapLoaded(true);

      navigator.geolocation?.getCurrentPosition(
        (pos) => {
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          setUserLocation({ lat: userLat, lng: userLng });

          const userIcon = L.divIcon({
            html: `<div style="background:#1A2340;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
            className: "",
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });

          L.marker([userLat, userLng], { icon: userIcon })
            .addTo(map)
            .bindPopup("<strong>You are here</strong>");

          const bounds = L.latLngBounds(
            [pgLat, pgLng],
            [userLat, userLng]
          );
          map.fitBounds(bounds, { padding: [40, 40] });
        },
        () => {
          setLocationError(true);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [pgLat, pgLng, name, area]);

  const openInGoogleMaps = () => {
    if (!pgLat || !pgLng) return;
    const dest = `${pgLat},${pgLng}`;
    const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : "";
    const url = origin
      ? `https://www.google.com/maps/dir/${origin}/${dest}`
      : `https://www.google.com/maps?q=${dest}`;
    window.open(url, "_blank");
  };

  if (!pgLat || !pgLng) {
    return (
      <div className="h-48 bg-muted/50 rounded-2xl flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <MapPin size={28} className="opacity-40" />
        <p className="text-sm">Location not available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-sm flex items-center gap-1.5">
          <MapPin size={14} className="text-primary" />
          Location
        </h3>
        {!locationError && !userLocation && mapLoaded && (
          <span className="text-[10px] text-muted-foreground animate-pulse">Detecting your location...</span>
        )}
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-border" style={{ height: 220 }}>
        <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
        {!mapLoaded && (
          <div className="absolute inset-0 bg-muted flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={openInGoogleMaps}
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-2.5 px-4 rounded-xl text-sm transition active:scale-95"
        >
          <Navigation size={14} />
          Get Directions
        </button>
        <button
          onClick={() => {
            const url = `https://www.google.com/maps?q=${pgLat},${pgLng}`;
            window.open(url, "_blank");
          }}
          className="px-3 py-2.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground transition active:scale-95"
          title="Open in Google Maps"
        >
          <ExternalLink size={16} />
        </button>
      </div>

      {userLocation && (
        <p className="text-[11px] text-muted-foreground text-center">
          📍 Showing route from your current location
        </p>
      )}
    </div>
  );
}
