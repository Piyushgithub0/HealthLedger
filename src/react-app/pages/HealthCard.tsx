import { useState, useEffect } from "react";
import { QrCode, Download, Phone, Mail, Calendar, Droplets, AlertCircle, Heart, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Sidebar from "@/react-app/components/Sidebar";

interface HealthCardData {
  name: string;
  id: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  bloodType: string;
  allergies: string[];
  conditions: string[];
  emergencyContact: string;
  totalVisits: number;
  memberSince: string;
}

export default function HealthCard() {
  const [card, setCard] = useState<HealthCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = JSON.parse(localStorage.getItem("user") || "{}").id;

        // Fetch health card data
        const cardRes = await fetch("/api/patient/health-card", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const cardData = await cardRes.json();
        setCard(cardData);

        // Fetch network base URL for QR code
        const infoRes = await fetch("/api/server-info");
        const infoData = await infoRes.json();
        setPdfUrl(`${infoData.baseUrl}/api/patient/pdf/${userId}`);
      } catch {
        console.error("Failed to fetch health card");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Sidebar>
    );
  }

  if (!card) return null;

  return (
    <Sidebar>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">My Health Card</h1>
          <p className="text-muted-foreground mt-1">Your digital health identity card</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Digital Health Card */}
          <div className="bg-gradient-to-br from-primary to-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-primary/20">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-sm font-medium opacity-80">HealthLedger</span>
                <span className="block text-xs opacity-60 mt-0.5">Digital Health Card</span>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>
            </div>

            <div className="mb-6">
              <p className="text-white/60 text-xs mb-1">Patient Name</p>
              <p className="font-bold text-2xl">{card.name}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-white/60 text-xs mb-0.5">ID</p>
                <p className="font-semibold text-sm">{card.id}</p>
              </div>
              <div>
                <p className="text-white/60 text-xs mb-0.5">Blood Type</p>
                <p className="font-semibold text-sm">{card.bloodType}</p>
              </div>
              <div>
                <p className="text-white/60 text-xs mb-0.5">Total Visits</p>
                <p className="font-semibold text-sm">{card.totalVisits}</p>
              </div>
            </div>

            <div className="border-t border-white/20 pt-4">
              <p className="text-white/60 text-xs">
                Member since {new Date(card.memberSince).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">QR Health Code</h2>
            <div className="bg-gray-50 border-2 border-dashed border-border rounded-xl p-8 flex items-center justify-center mb-4">
              <div className="text-center">
                <div className="w-44 h-44 mx-auto bg-white rounded-lg flex items-center justify-center mb-3 shadow-sm p-3">
                  {pdfUrl ? (
                    <QRCodeSVG
                      value={pdfUrl}
                      size={160}
                      level="H"
                      includeMargin={false}
                    />
                  ) : (
                    <QrCode className="w-24 h-24 text-gray-300" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Scan to download patient health report (PDF)</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (pdfUrl) window.open(pdfUrl, "_blank");
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25"
            >
              <Download className="w-4 h-4" />
              Download Health Report PDF
            </button>
          </div>
        </div>

        {/* Details Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium text-foreground text-sm">{card.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium text-foreground text-sm">{card.phone}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date of Birth</p>
                <p className="font-medium text-foreground text-sm">{card.dateOfBirth}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                <Droplets className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Blood Type</p>
                <p className="font-medium text-foreground text-sm">{card.bloodType}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Allergies</p>
                <p className="font-medium text-foreground text-sm">
                  {card.allergies.length > 0 ? card.allergies.join(", ") : "None recorded"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Emergency Contact</p>
                <p className="font-medium text-foreground text-sm">{card.emergencyContact}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
