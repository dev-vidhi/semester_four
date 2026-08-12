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
  const [page, setPage] = useState<"landing" | "analyze">("landing");
  const [mode, setMode] = useState<"upload" | "camera">("upload");
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
    { text: "Collect in a green bin or compost bin" },
    { text: "Keep it separate from recyclables" },
    { text: "Drain excess liquids before disposal" },
    { text: "Compost at home or send to facility" },
    { text: "Do not mix with plastic or metal" },
  ];

  const recyclableSteps = [
    { text: "Clean and rinse the item thoroughly" },
    { text: "Flatten cardboard or paper to save space" },
    { text: "Place in the recycling bin" },
    { text: "Remove caps and labels if possible" },
    { text: "Do not include food soiled items" },
  ];

  // LANDING PAGE
  if (page === "landing") {
    return (
      <main className="min-h-screen bg-white">
        {/* Nav */}
        <nav className="border-b border-gray-100 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">W</span>
            </div>
            <span className="font-semibold text-gray-900 text-lg">WasteAI</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span>94% Accuracy</span>
            <span className="text-gray-300">|</span>
            <span>MobileNetV2</span>
            <span className="text-gray-300">|</span>
            <span>22,000+ Images Trained</span>
          </div>
        </nav>

        {/* Hero */}
        <div className="max-w-4xl mx-auto px-8 pt-24 pb-16 text-center">
          <div className="inline-block bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full mb-6 border border-green-200">
            AI Powered Waste Classification
          </div>
          <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
            Know your waste.<br />
            <span className="text-green-600">Act responsibly.</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed">
            Upload an image or use your camera to instantly identify whether your waste is organic or recyclable. Get precise disposal instructions powered by deep learning.
          </p>

          {/* Two Main Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={() => { setMode("upload"); setPage("analyze"); setActiveTab("analyze"); }}
              className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all text-base shadow-sm"
            >
              Upload an Image
            </button>
            <button
              onClick={() => { setMode("camera"); setPage("analyze"); setActiveTab("analyze"); startCamera(); }}
              className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-xl transition-all text-base border border-gray-200 shadow-sm"
            >
              Use Camera
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto border-t border-gray-100 pt-10">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">94%</p>
              <p className="text-sm text-gray-400 mt-1">Model Accuracy</p>
            </div>
            <div className="text-center border-x border-gray-100">
              <p className="text-3xl font-bold text-gray-900">22K+</p>
              <p className="text-sm text-gray-400 mt-1">Training Images</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">2s</p>
              <p className="text-sm text-gray-400 mt-1">Avg Response</p>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-gray-50 py-16 px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">How it works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl border border-gray-100">
                <div className="w-8 h-8 bg-green-100 text-green-700 rounded-lg flex items-center justify-center font-bold text-sm mb-4">1</div>
                <h3 className="font-semibold text-gray-900 mb-2">Capture or Upload</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Take a photo using your camera or upload an existing image of the waste item.</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100">
                <div className="w-8 h-8 bg-green-100 text-green-700 rounded-lg flex items-center justify-center font-bold text-sm mb-4">2</div>
                <h3 className="font-semibold text-gray-900 mb-2">AI Analysis</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Our MobileNetV2 model analyzes the image and classifies it with a confidence score.</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100">
                <div className="w-8 h-8 bg-green-100 text-green-700 rounded-lg flex items-center justify-center font-bold text-sm mb-4">3</div>
                <h3 className="font-semibold text-gray-900 mb-2">Get Instructions</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Receive step by step disposal instructions based on the waste category identified.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-100 py-6 px-8 text-center text-sm text-gray-400">
          WasteAI — Semester IV Project &nbsp;|&nbsp; Built with MobileNetV2, FastAPI, Next.js
        </footer>
      </main>
    );
  }

  // ANALYZE PAGE
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => { stopCamera(); setPage("landing"); setImage(null); setFile(null); setResult(null); }}
              className="text-gray-400 hover:text-gray-600 transition mr-2">
              &larr; Back
            </button>
            <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">W</span>
            </div>
            <span className="font-semibold text-gray-900">WasteAI</span>
          </div>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            <button onClick={() => setActiveTab("analyze")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "analyze" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>
              Analyze
            </button>
            <button onClick={() => setActiveTab("history")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "history" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>
              History {history.length > 0 && `(${history.length})`}
            </button>
            <button onClick={() => setActiveTab("stats")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "stats" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>
              Stats
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
                <div className="mb-4 rounded-2xl overflow-hidden border border-gray-200 bg-black">
                  <video ref={videoRef} autoPlay playsInline className="w-full" />
                  <div className="flex gap-2 p-3 bg-gray-900">
                    <button onClick={capturePhoto}
                      className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition text-sm">
                      Capture Photo
                    </button>
                    <button onClick={stopCamera}
                      className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition text-sm">
                      Cancel
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
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer mb-4 ${dragOver ? "border-green-400 bg-green-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
                  onClick={() => document.getElementById("fileInput")?.click()}
                >
                  <input id="fileInput" type="file" accept="image/*" className="hidden"
                    onChange={(e) => e.target.files && handleFile(e.target.files[0])} />
                  {image ? (
                    <img src={image} alt="uploaded" className="max-h-56 mx-auto rounded-xl" />
                  ) : (
                    <div>
                      <div className="w-12 h-12 bg-gray-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-700">Drop your image here</p>
                      <p className="text-xs text-gray-400 mt-1">or click to browse — JPG, PNG, WEBP</p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {!showCamera && (
                <div className="flex gap-3 mb-4">
                  <button onClick={startCamera}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition">
                    Switch to Camera
                  </button>
                  {image && (
                    <button onClick={() => { setImage(null); setFile(null); setResult(null); }}
                      className="px-4 py-3 rounded-xl text-sm font-semibold border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 transition">
                      Clear
                    </button>
                  )}
                </div>
              )}

              {image && !showCamera && (
                <button onClick={handlePredict} disabled={loading}
                  className="w-full py-4 rounded-xl text-white font-semibold text-sm transition-all bg-green-600 hover:bg-green-700 disabled:opacity-50">
                  {loading ? "Analyzing..." : "Analyze Waste"}
                </button>
              )}

              {!image && !showCamera && (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="w-6 h-6 bg-green-100 rounded-md mb-2"></div>
                    <h3 className="font-medium text-gray-800 text-sm">Organic</h3>
                    <p className="text-gray-400 text-xs mt-1">Food, garden waste</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="w-6 h-6 bg-blue-100 rounded-md mb-2"></div>
                    <h3 className="font-medium text-gray-800 text-sm">Recyclable</h3>
                    <p className="text-gray-400 text-xs mt-1">Plastic, glass, metal</p>
                  </div>
                </div>
              )}
            </div>

            {/* Result Panel */}
            <div>
              {result ? (
                <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white">
                  <div className="p-6 text-white text-center"
                    style={{ background: result.color }}>
                    <h2 className="text-2xl font-bold">{result.class}</h2>
                    <p className="text-white text-opacity-90 text-sm mt-1">Confidence: {result.confidence}%</p>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-800 mb-3 text-sm">Disposal Instructions</h3>
                    <div className="space-y-2">
                      {(result.class === "Organic Waste" ? organicSteps : recyclableSteps).map((step, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <span className="text-xs font-bold text-gray-400 mt-0.5">{i + 1}</span>
                          <p className="text-sm text-gray-700">{step.text}</p>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => { setImage(null); setFile(null); setResult(null); }}
                      className="w-full mt-4 border border-gray-200 text-gray-600 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                      Analyze Another
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-8 border border-gray-100 h-full flex flex-col justify-center items-center text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-gray-700">Ready to analyze</h3>
                  <p className="text-gray-400 text-sm mt-2">Upload an image or capture one using your camera</p>
                  <div className="mt-6 text-left w-full space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      Trained on 22,000+ waste images
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      94% classification accuracy
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      Results in under 2 seconds
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Analysis History</h2>
            {history.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-sm">No history yet. Analyze some waste first.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {history.map((item, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                    <img src={item.image} alt="waste" className="w-full h-36 object-cover" />
                    <div className="p-3">
                      <p className="font-medium text-sm text-gray-800">{item.result.class}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.result.confidence}% confidence · {item.timestamp}</p>
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
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Statistics</h2>
            {history.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-sm">No data yet. Analyze some waste first.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
                    <p className="text-4xl font-bold text-gray-900">{history.length}</p>
                    <p className="text-xs text-gray-400 mt-1">Total Analyzed</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
                    <p className="text-4xl font-bold text-green-600">{history.filter(h => h.result.class === "Organic Waste").length}</p>
                    <p className="text-xs text-gray-400 mt-1">Organic</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
                    <p className="text-4xl font-bold text-blue-600">{history.filter(h => h.result.class === "Recyclable Waste").length}</p>
                    <p className="text-xs text-gray-400 mt-1">Recyclable</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
                    <p className="text-4xl font-bold text-gray-700">{(history.reduce((acc, h) => acc + h.result.confidence, 0) / history.length).toFixed(1)}%</p>
                    <p className="text-xs text-gray-400 mt-1">Avg Confidence</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                  <h3 className="font-semibold text-gray-700 mb-4 text-sm">Breakdown</h3>
                  {["Organic Waste", "Recyclable Waste"].map((cls) => {
                    const count = history.filter(h => h.result.class === cls).length;
                    const pct = Math.round((count / history.length) * 100);
                    const color = cls === "Organic Waste" ? "bg-green-500" : "bg-blue-500";
                    return (
                      <div key={cls} className="mb-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">{cls}</span>
                          <span className="text-gray-500">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className={`${color} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}