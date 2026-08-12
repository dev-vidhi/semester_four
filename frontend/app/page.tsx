"use client";
import { useState, useCallback, useRef } from "react";

interface Result {
  class: string;
  emoji: string;
  color: string;
  tip: string;
  confidence: number;
}

interface HistoryItem {
  image: string;
  result: Result;
  timestamp: string;
}

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<"analyze" | "history" | "stats">("analyze");
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch {
      alert("Camera access denied! Please allow camera permission.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const f = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
        handleFile(f);
        stopCamera();
      }
    }, "image/jpeg");
  };

  const handlePredict = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("https://semesterfour-production.up.railway.app/predict", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data);
      if (image) {
        setHistory((prev) => [
          { image, result: data, timestamp: new Date().toLocaleTimeString() },
          ...prev.slice(0, 9),
        ]);
      }
    } catch {
      alert("Error connecting to backend. Make sure it is running!");
    }
    setLoading(false);
  };

  const organicSteps = [
    { icon: "🗑️", text: "Collect in a green bin or compost bin" },
    { icon: "🌿", text: "Keep it separate from recyclables" },
    { icon: "💧", text: "Drain excess liquids before disposal" },
    { icon: "🌱", text: "Compost at home or send to facility" },
    { icon: "🚫", text: "Do NOT mix with plastic or metal" },
  ];

  const recyclableSteps = [
    { icon: "🧹", text: "Clean and rinse the item thoroughly" },
    { icon: "📦", text: "Flatten cardboard/paper to save space" },
    { icon: "🔵", text: "Place in blue recycling bin" },
    { icon: "🏷️", text: "Remove caps and labels if possible" },
    { icon: "🚫", text: "Do NOT include food-soiled items" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-green-400 to-blue-500 p-2 rounded-xl">
              <span className="text-2xl">♻️</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Smart Waste Segregator</h1>
              <p className="text-xs text-gray-400">AI-powered • 94% Accuracy</p>
            </div>
          </div>
          <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
            <button onClick={() => setActiveTab("analyze")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "analyze" ? "bg-white shadow text-green-600" : "text-gray-500"}`}>
              🔍 Analyze
            </button>
            <button onClick={() => setActiveTab("history")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "history" ? "bg-white shadow text-blue-600" : "text-gray-500"}`}>
              🕒 History {history.length > 0 && `(${history.length})`}
            </button>
            <button onClick={() => setActiveTab("stats")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "stats" ? "bg-white shadow text-purple-600" : "text-gray-500"}`}>
              📊 Stats
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* ANALYZE TAB */}
        {activeTab === "analyze" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              {/* Camera View */}
              {showCamera && (
                <div className="mb-4 rounded-2xl overflow-hidden border-2 border-green-400 bg-black">
                  <video ref={videoRef} autoPlay playsInline className="w-full rounded-t-2xl" />
                  <div className="flex gap-2 p-3 bg-gray-900">
                    <button onClick={capturePhoto}
                      className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition">
                      📸 Capture Photo
                    </button>
                    <button onClick={stopCamera}
                      className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition">
                      ✕ Close
                    </button>
                  </div>
                </div>
              )}

              {/* Upload Area */}
              {!showCamera && (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer mb-4 ${dragOver ? "border-green-400 bg-green-50" : "border-gray-200 bg-white hover:border-green-400 hover:bg-green-50"}`}
                  onClick={() => document.getElementById("fileInput")?.click()}
                >
                  <input id="fileInput" type="file" accept="image/*" className="hidden"
                    onChange={(e) => e.target.files && handleFile(e.target.files[0])} />
                  {image ? (
                    <img src={image} alt="uploaded" className="max-h-56 mx-auto rounded-xl shadow-md" />
                  ) : (
                    <div>
                      <div className="text-5xl mb-3">📸</div>
                      <p className="text-lg font-semibold text-gray-700">Drop your image here</p>
                      <p className="text-gray-400 mt-1 text-sm">or click to browse</p>
                      <p className="text-xs text-gray-300 mt-1">JPG, PNG, WEBP supported</p>
                    </div>
                  )}
                </div>
              )}

              {/* Two Buttons */}
              {!showCamera && (
                <div className="flex gap-3 mb-4">
                  <button onClick={startCamera}
                    className="flex-1 py-3 rounded-2xl text-white font-bold transition-all bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg">
                    📷 Open Camera
                  </button>
                  {image && (
                    <button onClick={() => { setImage(null); setFile(null); setResult(null); }}
                      className="px-4 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition">
                      🗑️ Clear
                    </button>
                  )}
                </div>
              )}

              {/* Analyze Button */}
              {image && !showCamera && (
                <button onClick={handlePredict} disabled={loading}
                  className="w-full py-4 rounded-2xl text-white font-bold text-lg transition-all bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:opacity-50 shadow-lg">
                  {loading ? "🔍 Analyzing..." : "🔍 Analyze Waste"}
                </button>
              )}

              {/* Info Cards */}
              {!image && !showCamera && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-100">
                    <div className="text-3xl mb-2">🍃</div>
                    <h3 className="font-bold text-gray-800">Organic</h3>
                    <p className="text-gray-400 text-xs mt-1">Food, garden waste</p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100">
                    <div className="text-3xl mb-2">♻️</div>
                    <h3 className="font-bold text-gray-800">Recyclable</h3>
                    <p className="text-gray-400 text-xs mt-1">Plastic, glass, metal</p>
                  </div>
                </div>
              )}
            </div>

            {/* Result Panel */}
            <div>
              {result ? (
                <div className="rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-6 text-white text-center"
                    style={{ background: `linear-gradient(135deg, ${result.color}, ${result.color}99)` }}>
                    <div className="text-6xl mb-3">{result.emoji}</div>
                    <h2 className="text-2xl font-bold">{result.class}</h2>
                    <div className="bg-black bg-opacity-20 rounded-xl px-4 py-1 inline-block mt-2">
                      <span className="font-semibold">Confidence: {result.confidence}%</span>
                    </div>
                  </div>
                  <div className="bg-white p-5">
                    <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">📋 Disposal Instructions</h3>
                    <div className="space-y-2">
                      {(result.class === "Organic Waste" ? organicSteps : recyclableSteps).map((step, i) => (
                        <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                          <span className="text-xl">{step.icon}</span>
                          <p className="text-sm text-gray-700">{step.text}</p>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => { setImage(null); setFile(null); setResult(null); }}
                      className="w-full mt-4 border-2 border-gray-200 text-gray-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition text-sm">
                      Try Another Image
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full flex flex-col justify-center items-center text-center">
                  <div className="text-5xl mb-4">🤖</div>
                  <h3 className="text-lg font-bold text-gray-700">AI Ready!</h3>
                  <p className="text-gray-400 text-sm mt-2">Upload an image or use camera to classify waste</p>
                  <div className="mt-6 bg-green-50 rounded-xl p-4 text-left w-full">
                    <p className="text-xs font-semibold text-green-700 mb-2">✅ Model Stats</p>
                    <p className="text-xs text-gray-500">• Trained on 22,000+ images</p>
                    <p className="text-xs text-gray-500">• 94% accuracy</p>
                    <p className="text-xs text-gray-500">• MobileNetV2 architecture</p>
                  </div>
                  <div className="mt-4 bg-purple-50 rounded-xl p-4 text-left w-full">
                    <p className="text-xs font-semibold text-purple-700 mb-2">📷 Two Ways to Analyze</p>
                    <p className="text-xs text-gray-500">• Upload image from your device</p>
                    <p className="text-xs text-gray-500">• Use camera for real-time capture</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          <div>
            <h2 className="text-xl font-bold text-gray-700 mb-6">🕒 Analysis History</h2>
            {history.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <div className="text-5xl mb-4">📭</div>
                <p>No history yet. Analyze some waste first!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {history.map((item, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                    <img src={item.image} alt="waste" className="w-full h-36 object-cover" />
                    <div className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{item.result.emoji}</span>
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{item.result.class}</p>
                          <p className="text-xs text-gray-400">{item.result.confidence}% • {item.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STATS TAB */}
        {activeTab === "stats" && (
          <div>
            <h2 className="text-xl font-bold text-gray-700 mb-6">📊 Waste Statistics</h2>
            {history.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <div className="text-5xl mb-4">📊</div>
                <p>No data yet. Analyze some waste first!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                    <p className="text-4xl font-bold text-gray-800">{history.length}</p>
                    <p className="text-sm text-gray-400 mt-1">Total Analyzed</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 text-center">
                    <p className="text-4xl font-bold text-green-600">{history.filter(h => h.result.class === "Organic Waste").length}</p>
                    <p className="text-sm text-gray-400 mt-1">🍃 Organic</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 text-center">
                    <p className="text-4xl font-bold text-blue-600">{history.filter(h => h.result.class === "Recyclable Waste").length}</p>
                    <p className="text-sm text-gray-400 mt-1">♻️ Recyclable</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100 text-center">
                    <p className="text-4xl font-bold text-purple-600">{(history.reduce((acc, h) => acc + h.result.confidence, 0) / history.length).toFixed(1)}%</p>
                    <p className="text-sm text-gray-400 mt-1">Avg Confidence</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-700 mb-4">Waste Breakdown</h3>
                  {["Organic Waste", "Recyclable Waste"].map((cls) => {
                    const count = history.filter(h => h.result.class === cls).length;
                    const pct = Math.round((count / history.length) * 100);
                    const color = cls === "Organic Waste" ? "bg-green-400" : "bg-blue-400";
                    const emoji = cls === "Organic Waste" ? "🍃" : "♻️";
                    return (
                      <div key={cls} className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">{emoji} {cls}</span>
                          <span className="font-semibold text-gray-700">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-4">
                          <div className={`${color} h-4 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  <h3 className="font-bold text-gray-700 mt-6 mb-3">Recent Activity</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {history.map((item, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span>{item.result.emoji}</span>
                          <span className="text-xs text-gray-600">{item.result.class}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{item.result.confidence}%</span>
                          <span className="text-xs text-gray-300">{item.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}