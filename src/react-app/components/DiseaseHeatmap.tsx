import { useState, useEffect, useRef } from "react";
import { Activity, MapPin, AlertTriangle, Info, ChevronDown, Loader2, Brain, Radar, LocateFixed } from "lucide-react";
import { Link } from "react-router";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
// @ts-ignore — side-effect import to extend L with heatLayer
import "leaflet.heat";

interface HeatPoint {
  city: string;
  disease: string;
  cases: number;
  riskScore: number;
}

interface Insight {
  type: "danger" | "warning" | "info";
  message: string;
}

const DISEASE_OPTIONS = ["All", "Dengue", "Malaria", "Flu", "COVID"];

export default function DiseaseHeatmap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const heatLayerRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDisease, setSelectedDisease] = useState("All");
  const [heatRadius, setHeatRadius] = useState(50);
  const [heatBlur, setHeatBlur] = useState(30);
  const [heatData, setHeatData] = useState<number[][]>([]);
  const [rawData, setRawData] = useState<HeatPoint[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Intersection observer for fade-in animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Initialize map once component is visible
  useEffect(() => {
    if (!visible) return; // Wait until section is in view
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      scrollWheelZoom: false,
      zoomControl: true,
      minZoom: 2,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    mapInstance.current = map;
    setTimeout(() => {
      map.invalidateSize();
      setMapReady(true);
    }, 400);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [visible]);

  // Fetch heatmap data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const url = selectedDisease === "All"
          ? "/api/heatmap/data"
          : `/api/heatmap/data?disease=${encodeURIComponent(selectedDisease)}`;

        const res = await fetch(url);
        const data = await res.json();

        setHeatData(data.heatData || []);
        setRawData(data.rawData || []);
        setInsights(data.insights || []);
      } catch (error) {
        console.error("Failed to fetch heatmap data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedDisease]);

  // Apply heat layer when map is ready AND data is loaded
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !mapReady || heatData.length === 0) return;

    // Remove old layer
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    // Verify L.heatLayer exists
    if (typeof (L as any).heatLayer !== "function") {
      console.error("leaflet.heat plugin not loaded");
      return;
    }

    // Create heat layer — bold and visible
    heatLayerRef.current = (L as any).heatLayer(heatData, {
      radius: heatRadius,
      blur: heatBlur,
      maxZoom: 18,
      max: 1.0,
      minOpacity: 0.6,
      gradient: {
        0.1: "#2ECC71",
        0.3: "#F1C40F",
        0.5: "#E67E22",
        0.7: "#E74C3C",
        0.9: "#C0392B",
        1.0: "#8B0000",
      },
    }).addTo(map);
  }, [heatData, mapReady, heatRadius, heatBlur]);

  const insightIcon = (type: string) => {
    if (type === "danger") return <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />;
    if (type === "warning") return <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />;
    return <Info className="w-4 h-4 text-green-600 shrink-0" />;
  };

  const insightBg = (type: string) => {
    if (type === "danger") return "bg-red-50 border-red-100";
    if (type === "warning") return "bg-orange-50 border-orange-100";
    return "bg-green-50 border-green-100";
  };

  return (
    <section
      ref={sectionRef}
      className={`relative z-10 py-20 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full mb-4">
            <Brain className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-green-700">Powered by Mistral AI</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
            AI Disease Surveillance Map
          </h2>
          <p className="text-lg text-gray-500 max-w-3xl mx-auto">
            AI analyzes anonymized health records and visualizes disease concentration across regions.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: Info */}
          <div className={`transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
            <h3 className="text-2xl font-bold text-black mb-4">AI-Powered Disease Heatmap</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Our intelligent surveillance system uses Mistral AI to analyze disease data across the globe, 
              scoring outbreak risk in real-time and visualizing high-risk zones on an interactive world map.
            </p>

            <div className="space-y-4 mb-8">
              {[
                { icon: Radar, text: "Real-time disease monitoring" },
                { icon: Brain, text: "AI-assisted outbreak detection" },
                { icon: LocateFixed, text: "Location-based health insights" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-black font-medium">{item.text}</span>
                </div>
              ))}
            </div>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-all hover:shadow-lg hover:shadow-green-500/25 hover:-translate-y-0.5"
              style={{ backgroundColor: "#2ECC71" }}
            >
              <Activity className="w-5 h-5" />
              Explore Dashboard
            </Link>

            {/* Risk score legend */}
            {rawData.length > 0 && (
              <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h4 className="text-sm font-semibold text-black mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" /> AI Risk Scores
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {rawData
                    .sort((a, b) => b.riskScore - a.riskScore)
                    .map((d, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-medium text-black truncate">{d.city}</span>
                          <span className="text-gray-400 text-xs">({d.disease})</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${d.riskScore * 100}%`,
                                backgroundColor: d.riskScore > 0.7 ? "#E74C3C" : d.riskScore > 0.4 ? "#F39C12" : "#2ECC71",
                              }}
                            />
                          </div>
                          <span
                            className="text-xs font-bold w-8 text-right"
                            style={{
                              color: d.riskScore > 0.7 ? "#E74C3C" : d.riskScore > 0.4 ? "#F39C12" : "#2ECC71",
                            }}
                          >
                            {(d.riskScore * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Map */}
          <div className={`transition-all duration-700 delay-400 ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
            {/* Controls */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-4 space-y-3">
              {/* Disease filter */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-black whitespace-nowrap">Disease:</label>
                <div className="relative">
                  <select
                    value={selectedDisease}
                    onChange={(e) => setSelectedDisease(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2 rounded-xl border border-gray-200 bg-white text-black text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all cursor-pointer"
                  >
                    {DISEASE_OPTIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                {loading && <Loader2 className="w-4 h-4 animate-spin text-green-600" />}
              </div>
              {/* Radius slider */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-black whitespace-nowrap w-16">Radius:</label>
                <input
                  type="range"
                  min={15}
                  max={80}
                  value={heatRadius}
                  onChange={(e) => setHeatRadius(Number(e.target.value))}
                  className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer accent-green-500"
                  style={{ accentColor: "#2ECC71" }}
                />
                <span className="text-xs font-mono text-gray-500 w-8 text-right">{heatRadius}</span>
              </div>
              {/* Blur slider */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-black whitespace-nowrap w-16">Blur:</label>
                <input
                  type="range"
                  min={5}
                  max={50}
                  value={heatBlur}
                  onChange={(e) => setHeatBlur(Number(e.target.value))}
                  className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: "#2ECC71" }}
                />
                <span className="text-xs font-mono text-gray-500 w-8 text-right">{heatBlur}</span>
              </div>
            </div>

            {/* Map container */}
            <div
              className="rounded-2xl overflow-hidden border border-gray-200 shadow-lg"
              style={{ height: 480 }}
            >
              <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
            </div>

            {/* AI Insight Card */}
            {insights.length > 0 && (
              <div className="mt-4 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h4 className="text-sm font-semibold text-black mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-green-600" /> AI Risk Insights
                </h4>
                <div className="space-y-2">
                  {insights.map((insight, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border ${insightBg(insight.type)}`}
                    >
                      {insightIcon(insight.type)}
                      <p className="text-sm text-black leading-relaxed">{insight.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
