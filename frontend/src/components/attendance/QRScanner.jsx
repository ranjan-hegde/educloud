import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { ScanLine, Camera, CameraOff, KeyRound, AlertTriangle, Upload } from "lucide-react";

const SCANNER_ELEMENT_ID = "educloud-qr-scanner-region";
const FILE_SCANNER_ELEMENT_ID = "educloud-qr-file-scanner-region";

// Three genuine ways to obtain a Session ID, all funneling into the same
// onScan(sessionIdOrRawText) callback — the caller runs the SAME validation
// function regardless of which method produced the value.
export default function QRScanner({ onScan, disabled }) {
  const [manualCode, setManualCode] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [cameraState, setCameraState] = useState("idle"); // idle | starting | running | error
  const [cameraError, setCameraError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      stopCamera();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    };
  }, []);

  async function startCamera() {
    if (disabled || cameraState === "starting" || cameraState === "running") return;
    setCameraState("starting");
    setCameraError("");
    try {
      const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          onScan(decodedText);
          stopCamera();
        },
        () => {
          // Per-frame "no QR found yet" — expected constantly while scanning, ignore.
        }
      );
      setCameraState("running");
    } catch (err) {
      setCameraState("error");
      setCameraError(
        err?.name === "NotAllowedError" || /permission/i.test(String(err))
          ? "Camera permission is required to scan the QR code."
          : "Couldn't access a camera on this device. Try uploading a QR image or entering the Session ID."
      );
    }
  }

  function stopCamera() {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (scanner) {
      scanner.stop().then(() => scanner.clear()).catch(() => {});
    }
    setCameraState("idle");
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file || disabled) return;
    setUploadError("");
    setUploading(true);
    try {
      // A separate, hidden scanner instance dedicated to decoding a static
      // image file — genuinely reads the real QR pixels, not a simulation.
      const fileScanner = new Html5Qrcode(FILE_SCANNER_ELEMENT_ID);
      const decodedText = await fileScanner.scanFile(file, false);
      await fileScanner.clear();
      onScan(decodedText);
    } catch {
      setUploadError("Could not find a valid QR code in this image.");
    } finally {
      setUploading(false);
    }
  }

  function submitManual() {
    if (!manualCode.trim()) return;
    onScan(manualCode.trim());
    setManualCode("");
  }

  return (
    <div className="space-y-4">
      <div className="relative rounded-2xl bg-navy-900 aspect-square max-w-xs mx-auto overflow-hidden flex items-center justify-center">
        <div id={SCANNER_ELEMENT_ID} className="w-full h-full [&_video]:!w-full [&_video]:!h-full [&_video]:!object-cover" />
        {cameraState !== "running" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
            {cameraState === "error" ? (
              <>
                <AlertTriangle size={32} className="text-amber-400" />
                <p className="text-amber-200 text-xs">{cameraError}</p>
              </>
            ) : (
              <>
                <Camera size={40} className="text-navy-600" />
                <p className="text-navy-300 text-xs">{cameraState === "starting" ? "Requesting camera access..." : "Camera is off"}</p>
              </>
            )}
          </div>
        )}
        {cameraState === "running" && (
          <>
            <div className="absolute inset-6 border-2 border-accent-teal/70 rounded-xl pointer-events-none" />
            <div className="absolute left-6 right-6 h-0.5 bg-accent-teal/80 animate-pulse top-1/2 pointer-events-none" />
          </>
        )}
      </div>

      {/* Hidden element html5-qrcode needs to mount its file-decoding canvas into. */}
      <div id={FILE_SCANNER_ELEMENT_ID} className="hidden" />

      {cameraState === "running" ? (
        <button className="btn-secondary w-full" onClick={stopCamera}>
          <CameraOff size={16} /> Stop Camera
        </button>
      ) : (
        <button className="btn-primary w-full" onClick={startCamera} disabled={disabled || cameraState === "starting"}>
          <ScanLine size={16} /> {cameraState === "starting" ? "Starting Camera..." : "Scan QR Code"}
        </button>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          className="btn-secondary text-xs"
          disabled={disabled || uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={13} /> {uploading ? "Reading image..." : "Upload QR Image"}
        </button>
        <button type="button" className="btn-secondary text-xs" onClick={() => setShowManual((s) => !s)}>
          <KeyRound size={13} /> Enter Session ID
        </button>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
      {uploadError && <p className="text-xs text-accent-coral text-center">{uploadError}</p>}

      {showManual && (
        <div className="space-y-2">
          <label className="label">Enter Attendance Session ID</label>
          <div className="flex gap-2">
            <input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="e.g. ATT-20260901-001"
              className="input"
            />
            <button className="btn-secondary shrink-0" onClick={submitManual} disabled={disabled}>Verify Session</button>
          </div>
        </div>
      )}
    </div>
  );
}
