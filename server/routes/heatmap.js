import express from "express";
import MedicalRecord from "../models/MedicalRecord.js";

const router = express.Router();

// Global sample disease dataset with coordinates
const SAMPLE_DATA = [
  // Asia
  { city: "Mumbai", lat: 19.076, lng: 72.8777, cases: 50, disease: "Dengue" },
  { city: "Delhi", lat: 28.6139, lng: 77.209, cases: 45, disease: "Flu" },
  { city: "Chennai", lat: 13.0827, lng: 80.2707, cases: 35, disease: "Dengue" },
  { city: "Kolkata", lat: 22.5726, lng: 88.3639, cases: 28, disease: "Malaria" },
  { city: "Bangalore", lat: 12.9716, lng: 77.5946, cases: 22, disease: "COVID" },
  { city: "Tokyo", lat: 35.6762, lng: 139.6503, cases: 40, disease: "Flu" },
  { city: "Beijing", lat: 39.9042, lng: 116.4074, cases: 55, disease: "COVID" },
  { city: "Shanghai", lat: 31.2304, lng: 121.4737, cases: 38, disease: "Flu" },
  { city: "Bangkok", lat: 13.7563, lng: 100.5018, cases: 42, disease: "Dengue" },
  { city: "Jakarta", lat: -6.2088, lng: 106.8456, cases: 48, disease: "Dengue" },
  { city: "Manila", lat: 14.5995, lng: 120.9842, cases: 30, disease: "Dengue" },
  { city: "Dhaka", lat: 23.8103, lng: 90.4125, cases: 33, disease: "Malaria" },
  { city: "Karachi", lat: 24.8607, lng: 67.0011, cases: 27, disease: "Dengue" },
  { city: "Seoul", lat: 37.5665, lng: 126.978, cases: 15, disease: "Flu" },
  { city: "Singapore", lat: 1.3521, lng: 103.8198, cases: 12, disease: "Dengue" },
  // Europe
  { city: "London", lat: 51.5074, lng: -0.1278, cases: 32, disease: "Flu" },
  { city: "Paris", lat: 48.8566, lng: 2.3522, cases: 28, disease: "COVID" },
  { city: "Berlin", lat: 52.52, lng: 13.405, cases: 20, disease: "Flu" },
  { city: "Rome", lat: 41.9028, lng: 12.4964, cases: 25, disease: "COVID" },
  { city: "Madrid", lat: 40.4168, lng: -3.7038, cases: 22, disease: "Flu" },
  { city: "Moscow", lat: 55.7558, lng: 37.6173, cases: 35, disease: "COVID" },
  { city: "Istanbul", lat: 41.0082, lng: 28.9784, cases: 18, disease: "Flu" },
  // Americas
  { city: "New York", lat: 40.7128, lng: -74.006, cases: 60, disease: "COVID" },
  { city: "Los Angeles", lat: 34.0522, lng: -118.2437, cases: 45, disease: "Flu" },
  { city: "São Paulo", lat: -23.5505, lng: -46.6333, cases: 55, disease: "Dengue" },
  { city: "Mexico City", lat: 19.4326, lng: -99.1332, cases: 38, disease: "Dengue" },
  { city: "Buenos Aires", lat: -34.6037, lng: -58.3816, cases: 20, disease: "Flu" },
  { city: "Lima", lat: -12.0464, lng: -77.0428, cases: 25, disease: "Dengue" },
  { city: "Bogota", lat: 4.711, lng: -74.0721, cases: 30, disease: "Malaria" },
  { city: "Toronto", lat: 43.6532, lng: -79.3832, cases: 18, disease: "Flu" },
  // Africa
  { city: "Lagos", lat: 6.5244, lng: 3.3792, cases: 65, disease: "Malaria" },
  { city: "Cairo", lat: 30.0444, lng: 31.2357, cases: 28, disease: "Flu" },
  { city: "Nairobi", lat: -1.2921, lng: 36.8219, cases: 40, disease: "Malaria" },
  { city: "Johannesburg", lat: -26.2041, lng: 28.0473, cases: 22, disease: "COVID" },
  { city: "Kinshasa", lat: -4.4419, lng: 15.2663, cases: 50, disease: "Malaria" },
  { city: "Accra", lat: 5.6037, lng: -0.187, cases: 35, disease: "Malaria" },
  // Oceania
  { city: "Sydney", lat: -33.8688, lng: 151.2093, cases: 18, disease: "Flu" },
  { city: "Melbourne", lat: -37.8136, lng: 144.9631, cases: 14, disease: "COVID" },
  { city: "Auckland", lat: -36.8485, lng: 174.7633, cases: 8, disease: "Flu" },
  // Middle East
  { city: "Dubai", lat: 25.2048, lng: 55.2708, cases: 15, disease: "COVID" },
  { city: "Riyadh", lat: 24.7136, lng: 46.6753, cases: 20, disease: "Flu" },
  { city: "Tehran", lat: 35.6892, lng: 51.389, cases: 32, disease: "COVID" },
];

// Call Mistral AI for risk scoring
async function getAIRiskScores(diseaseData) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    // Fallback: calculate risk from case count
    const maxCases = Math.max(...diseaseData.map((d) => d.cases), 1);
    return diseaseData.map((d) => ({
      ...d,
      riskScore: Math.round((d.cases / maxCases) * 100) / 100,
    }));
  }

  try {
    const dataStr = diseaseData
      .map((d) => `${d.city}: ${d.cases} cases of ${d.disease}`)
      .join("\n");

    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        messages: [
          {
            role: "system",
            content:
              "You are a disease surveillance AI. Analyze disease data and assign risk scores. Respond ONLY with a valid JSON array, no markdown, no explanation.",
          },
          {
            role: "user",
            content: `Analyze this disease dataset and assign a risk score between 0 and 1 for each location based on outbreak probability. Consider the number of cases and disease severity.\n\n${dataStr}\n\nRespond with a JSON array in this exact format: [{"city":"CityName","riskScore":0.XX}]`,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content?.trim() || "[]";

    // Parse AI response — handle markdown code blocks
    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // Fallback if AI response isn't valid JSON
      const maxCases = Math.max(...diseaseData.map((d) => d.cases), 1);
      return diseaseData.map((d) => ({
        ...d,
        riskScore: Math.round((d.cases / maxCases) * 100) / 100,
      }));
    }

    // Merge AI scores with original data
    return diseaseData.map((d) => {
      const aiEntry = parsed.find(
        (p) => p.city?.toLowerCase() === d.city?.toLowerCase()
      );
      return {
        ...d,
        riskScore: aiEntry?.riskScore ?? Math.round((d.cases / Math.max(...diseaseData.map((x) => x.cases), 1)) * 100) / 100,
      };
    });
  } catch (error) {
    console.error("Mistral AI error:", error.message);
    // Fallback
    const maxCases = Math.max(...diseaseData.map((d) => d.cases), 1);
    return diseaseData.map((d) => ({
      ...d,
      riskScore: Math.round((d.cases / maxCases) * 100) / 100,
    }));
  }
}

// Generate AI insights
async function getAIInsights(diseaseData) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    return diseaseData
      .sort((a, b) => b.cases - a.cases)
      .slice(0, 4)
      .map((d) => ({
        type: d.cases > 30 ? "danger" : d.cases > 15 ? "warning" : "info",
        message: `${d.cases > 30 ? "High" : d.cases > 15 ? "Moderate" : "Low"} ${d.disease} activity detected in ${d.city} (${d.cases} cases)`,
      }));
  }

  try {
    const dataStr = diseaseData.map((d) => `${d.city}: ${d.cases} cases of ${d.disease}`).join("\n");

    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        messages: [
          {
            role: "system",
            content: "You are a disease surveillance AI. Provide concise health risk insights. Respond ONLY with a valid JSON array, no markdown.",
          },
          {
            role: "user",
            content: `Analyze this disease data and provide 3-4 brief risk insight alerts.\n\n${dataStr}\n\nRespond with a JSON array: [{"type":"danger|warning|info","message":"Brief insight message"}]`,
          },
        ],
        temperature: 0.4,
        max_tokens: 300,
      }),
    });

    if (!response.ok) throw new Error("API error");

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content?.trim() || "[]";
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return diseaseData
      .sort((a, b) => b.cases - a.cases)
      .slice(0, 3)
      .map((d) => ({
        type: d.cases > 30 ? "danger" : d.cases > 15 ? "warning" : "info",
        message: `${d.disease} activity in ${d.city}: ${d.cases} cases detected`,
      }));
  }
}

// GET /api/heatmap/data — public endpoint
router.get("/data", async (req, res) => {
  try {
    const { disease } = req.query;

    // Try to get real data from DB first
    let diseaseData = [...SAMPLE_DATA];

    // Augment with DB records if possible
    try {
      const dbRecords = await MedicalRecord.aggregate([
        ...(disease && disease !== "All" ? [{ $match: { diagnosis: { $regex: disease, $options: "i" } } }] : []),
        { $match: { location: { $ne: "" } } },
        { $group: { _id: { diagnosis: "$diagnosis", location: "$location" }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      if (dbRecords.length > 0) {
        // Map DB locations to coordinates (we use sample coords as lookup)
        const cityCoords = {};
        SAMPLE_DATA.forEach((s) => {
          cityCoords[s.city.toLowerCase()] = { lat: s.lat, lng: s.lng };
        });

        const dbData = dbRecords
          .map((r) => {
            const coords = cityCoords[r._id.location?.toLowerCase()];
            if (!coords) return null;
            return {
              city: r._id.location,
              lat: coords.lat,
              lng: coords.lng,
              cases: r.count,
              disease: r._id.diagnosis,
            };
          })
          .filter(Boolean);

        if (dbData.length > 0) {
          diseaseData = [...diseaseData, ...dbData];
        }
      }
    } catch {
      // Use sample data only
    }

    // Filter by disease if specified
    if (disease && disease !== "All") {
      diseaseData = diseaseData.filter(
        (d) => d.disease.toLowerCase() === disease.toLowerCase()
      );
    }

    if (diseaseData.length === 0) {
      return res.json({ heatData: [], insights: [], rawData: [] });
    }

    // Get AI risk scores
    const scoredData = await getAIRiskScores(diseaseData);

    // Convert to dense heatmap points — scatter multiple points per city for visible heat
    const heatData = [];
    for (const d of scoredData) {
      // More cases = more scattered points for density
      const numPoints = Math.max(8, Math.ceil(d.cases / 3));
      for (let i = 0; i < numPoints; i++) {
        const jitterLat = (Math.random() - 0.5) * 2.5;
        const jitterLng = (Math.random() - 0.5) * 2.5;
        const intensityJitter = d.riskScore * (0.7 + Math.random() * 0.3);
        heatData.push([d.lat + jitterLat, d.lng + jitterLng, intensityJitter]);
      }
      // Center point always full intensity
      heatData.push([d.lat, d.lng, d.riskScore]);
    }

    // Get AI insights
    const insights = await getAIInsights(diseaseData);

    res.json({
      heatData,
      insights,
      rawData: scoredData.map((d) => ({
        city: d.city,
        disease: d.disease,
        cases: d.cases,
        riskScore: d.riskScore,
      })),
    });
  } catch (error) {
    console.error("Heatmap error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
