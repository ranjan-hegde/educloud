import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { QrCode } from "lucide-react";

// Renders a GENUINE, camera-scannable QR code (generated via the `qrcode`
// library) for the given payload. The payload should be a stable per-subject
// identity string, so the same QR image represents the same subject across
// every attendance session — only the underlying session data changes.
export default function QRDisplay({ payload, sessionId, active }) {
  const [dataUrl, setDataUrl] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!payload) return;
    let cancelled = false;
    QRCode.toDataURL(payload, { width: 280, margin: 1, color: { dark: "#0d1b34", light: "#ffffff" } })
      .then((url) => { if (!cancelled) { setDataUrl(url); setError(false); } })
      .catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [payload]);

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className={`relative rounded-2xl border-2 p-4 ${active ? "border-navy-300 bg-white" : "border-navy-100 bg-navy-50/40"}`}>
        {dataUrl ? (
          <img src={dataUrl} alt="Attendance QR code" width={200} height={200} className={active ? "" : "opacity-30 grayscale"} />
        ) : error ? (
          <div className="h-[200px] w-[200px] flex items-center justify-center text-rose-500 text-xs text-center px-4">
            Couldn't generate QR code
          </div>
        ) : (
          <div className="h-[200px] w-[200px] flex items-center justify-center">
            <QrCode size={100} className="text-navy-200 animate-pulse" strokeWidth={1} />
          </div>
        )}
        {active && <span className="absolute top-2 right-2 h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />}
      </div>
      {sessionId && <p className="text-xs text-navy-400 mt-3">Session ID: {sessionId}</p>}
      <p className="text-[11px] text-navy-300 mt-1">Scan with a QR reader or the Student Attendance scanner</p>
    </div>
  );
}
