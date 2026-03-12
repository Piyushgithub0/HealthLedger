import { useState, useRef, useEffect } from "react";
import { Camera, QrCode, Loader2, User, FileText, Pill, Calendar, AlertCircle, Heart, ChevronDown, ChevronUp, X } from "lucide-react";

interface PatientData {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  bloodType: string;
  address: string;
  emergencyContact: string;
  allergies: string[];
  conditions: string[];
}

interface MedRecord {
  date: string;
  diagnosis: string;
  doctor: string;
  status: string;
}

interface Prescription {
  name: string;
  dosage: string;
  duration: string;
  status: string;
  prescribedBy: string;
}

interface ScanResult {
  version: number;
  generatedAt: string;
  patient: PatientData;
  medicalRecords: MedRecord[];
  prescriptions: Prescription[];
}

interface QRScannerProps {
  sidebarComponent: React.ComponentType<{ children: React.ReactNode }>;
}

export default function QRScanner({ sidebarComponent: Sidebar }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const [showRecords, setShowRecords] = useState(false);
  const [showPrescriptions, setShowPrescriptions] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<any>(null);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setError("");
    setResult(null);
    setScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;

      // Wait for next tick so video element is rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadeddata = () => {
            videoRef.current?.play();
            // Start scanning after video feed is live
            scanIntervalRef.current = setInterval(() => {
              captureAndDecode();
            }, 500);
          };
        }
      }, 100);
    } catch {
      setScanning(false);
      setError("Camera access denied. Please allow camera permissions or enter the QR code manually.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const captureAndDecode = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Use BarcodeDetector API if available
    if ("BarcodeDetector" in window) {
      // @ts-ignore
      const detector = new BarcodeDetector({ formats: ["qr_code"] });
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      detector
        .detect(imageData)
        .then((barcodes: any[]) => {
          if (barcodes.length > 0) {
            handleQRResult(barcodes[0].rawValue);
          }
        })
        .catch(() => {});
    }
  };

  const handleQRResult = async (raw: string) => {
    stopCamera();
    // Extract snapshotId from URL or use raw value
    let snapshotId = raw;
    const match = raw.match(/\/api\/qr\/view\/([a-f0-9]+)/);
    if (match) {
      snapshotId = match[1];
    }
    await fetchSnapshot(snapshotId);
  };

  const fetchSnapshot = async (snapshotId: string) => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`/api/qr/view/${snapshotId}`);
      if (!res.ok) {
        throw new Error("QR code not found or invalid");
      }
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to read QR data");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = () => {
    if (!manualInput.trim()) return;
    let id = manualInput.trim();
    const match = id.match(/\/api\/qr\/view\/([a-f0-9]+)/);
    if (match) id = match[1];
    fetchSnapshot(id);
  };

  return (
    <Sidebar>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">QR Health Card Scanner</h1>
          <p className="text-muted-foreground mt-1">
            Scan a patient's QR code to view their health records
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner Section */}
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" /> Scan QR Code
            </h2>

            {/* Camera view — video always rendered, visibility toggled */}
            <div className="relative rounded-xl overflow-hidden bg-black mb-4" style={{ minHeight: 300 }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover absolute inset-0"
                style={{ display: scanning ? "block" : "none", minHeight: 300 }}
              />
              {scanning && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ minHeight: 300 }}>
                  <div className="w-48 h-48 border-2 border-white/60 rounded-2xl relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 rounded-tl-xl" style={{ borderColor: "#2ECC71" }} />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 rounded-tr-xl" style={{ borderColor: "#2ECC71" }} />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 rounded-bl-xl" style={{ borderColor: "#2ECC71" }} />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 rounded-br-xl" style={{ borderColor: "#2ECC71" }} />
                  </div>
                  <p className="absolute bottom-4 text-white text-xs font-medium bg-black/50 px-3 py-1 rounded-full">
                    Point camera at QR code
                  </p>
                </div>
              )}
              {!scanning && (
                <div className="flex items-center justify-center" style={{ minHeight: 300 }}>
                  <QrCode className="w-16 h-16 text-gray-600" />
                </div>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <div className="flex gap-2">
              {scanning ? (
                <button
                  onClick={stopCamera}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-all"
                >
                  <X className="w-4 h-4" /> Stop Camera
                </button>
              ) : (
                <button
                  onClick={startCamera}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25"
                >
                  <Camera className="w-4 h-4" /> Start Camera
                </button>
              )}
            </div>

            {/* Manual input */}
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm font-medium text-foreground mb-2">Or enter QR code ID manually:</p>
              <div className="flex gap-2">
                <input
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
                  placeholder="Paste snapshot ID or URL..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  onClick={handleManualSubmit}
                  disabled={!manualInput.trim() || loading}
                  className="px-4 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 text-sm"
                >
                  Look Up
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Patient Information
            </h2>

            {loading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : result ? (
              <div className="space-y-4">
                {/* Version badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700">
                    Version {result.version}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Generated: {new Date(result.generatedAt).toLocaleString()}
                  </span>
                </div>

                {/* Patient card */}
                <div className="bg-gradient-to-br from-primary to-emerald-600 rounded-2xl p-5 text-white">
                  <p className="text-lg font-bold">{result.patient.fullName}</p>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                    <div><span className="opacity-60">Blood:</span> {result.patient.bloodType || "N/A"}</div>
                    <div><span className="opacity-60">Gender:</span> {result.patient.gender || "N/A"}</div>
                    <div><span className="opacity-60">DOB:</span> {result.patient.dateOfBirth || "N/A"}</div>
                    <div><span className="opacity-60">Phone:</span> {result.patient.phone || "N/A"}</div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{result.patient.email}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                    <Heart className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Emergency:</span>
                    <span className="font-medium">{result.patient.emergencyContact || "N/A"}</span>
                  </div>
                  {result.patient.allergies?.length > 0 && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-muted-foreground">Allergies:</span>
                      <span className="font-medium text-red-600">{result.patient.allergies.join(", ")}</span>
                    </div>
                  )}
                </div>

                {/* Medical records */}
                <div className="border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setShowRecords(!showRecords)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <FileText className="w-4 h-4 text-primary" />
                      Medical Records ({result.medicalRecords.length})
                    </span>
                    {showRecords ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {showRecords && (
                    <div className="p-3 space-y-2">
                      {result.medicalRecords.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No records</p>
                      ) : (
                        result.medicalRecords.map((r, i) => (
                          <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-gray-50">
                            <div>
                              <span className="font-semibold">{r.diagnosis}</span>
                              <span className="text-muted-foreground ml-2">• {r.doctor}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">{r.date}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                r.status === "Ongoing" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
                              }`}>{r.status}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Prescriptions */}
                <div className="border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setShowPrescriptions(!showPrescriptions)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Pill className="w-4 h-4 text-primary" />
                      Prescriptions ({result.prescriptions.length})
                    </span>
                    {showPrescriptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {showPrescriptions && (
                    <div className="p-3 space-y-2">
                      {result.prescriptions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No prescriptions</p>
                      ) : (
                        result.prescriptions.map((rx, i) => (
                          <div key={i} className="text-xs p-2 rounded-lg bg-gray-50">
                            <span className="font-semibold">{rx.name}</span>
                            <span className="text-muted-foreground"> — {rx.dosage} for {rx.duration}</span>
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              rx.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                            }`}>{rx.status}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <QrCode className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">No patient data yet</p>
                <p className="text-sm text-muted-foreground mt-1">Scan a QR code or enter the ID to view patient records</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
