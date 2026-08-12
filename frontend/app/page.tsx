"use client";
import { useState, useCallback, useRef, useEffect } from "react";

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
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<"analyze" | "history" | "stats">("analyze");
  const [showCamera, setShowCamera] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      <main className="min-h-screen bg-white overflow-x-hidden">
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-12px); }
          }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes pulse-green {
            0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
            50% { box-shadow: 0 0 0 12px rgba(34,197,94,0); }
          }
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .float { animation: float 4s ease-in-out infinite; }
          .float-delay { animation: float 4s ease-in-out infinite 1s; }
          .float-delay2 { animation: float 4s ease-in-out infinite 2s; }
          .fade-up { animation: fadeUp 0.8s ease forwards; }
          .fade-up-delay { animation: fadeUp 0.8s ease 0.2s forwards; opacity: 0; }
          .fade-up-delay2 { animation: fadeUp 0.8s ease 0.4s forwards; opacity: 0; }
          .fade-up-delay3 { animation: fadeUp 0.8s ease 0.6s forwards; opacity: 0; }
          .slide-in { animation: slideIn 0.6s ease forwards; }
          .pulse-green { animation: pulse-green 2s infinite; }
          .spin-slow { animation: spin-slow 20s linear infinite; }
          .card-hover { transition: all 0.3s ease; }
          .card-hover:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
          .btn-hover { transition: all 0.25s ease; }
          .btn-hover:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
          .gradient-text {
            background: linear-gradient(135deg, #16a34a, #0284c7);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .bg-mesh {
            background-color: #f0fdf4;
            background-image: radial-gradient(at 40% 20%, rgba(134,239,172,0.3) 0px, transparent 50%),
              radial-gradient(at 80% 0%, rgba(147,197,253,0.3) 0px, transparent 50%),
              radial-gradient(at 0% 50%, rgba(167,243,208,0.2) 0px, transparent 50%);
          }
        `}</style>

        {/* Navbar */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-sm border-b border-gray-100" : "bg-transparent"}`}>
          <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white text-sm font-bold">W</span>
              </div>
              <span className="font-bold text-gray-900 text-lg">WasteAI</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
              <a href="#how" className="hover:text-gray-900 transition">How it works</a>
              <a href="#tech" className="hover:text-gray-900 transition">Technology</a>
              <a href="#impact" className="hover:text-gray-900 transition">Impact</a>
            </div>
            <button
              onClick={() => { setPage("analyze"); setActiveTab("analyze"); }}
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl btn-hover"
            >
              Try Now
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="bg-mesh pt-32 pb-20 px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-xs font-semibold px-4 py-2 rounded-full mb-6 fade-up">
                  <div className="w-2 h-2 bg-green-500 rounded-full pulse-green"></div>
                  AI Model Live and Running
                </div>
                <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-5 fade-up-delay">
                  Sort waste smarter.<br />
                  <span className="gradient-text">Not harder.</span>
                </h1>
                <p className="text-lg text-gray-500 leading-relaxed mb-8 fade-up-delay2">
                  Point your camera at any waste item and our deep learning model tells you instantly — organic or recyclable — with step by step disposal guidance.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 fade-up-delay3">
                  <button
                    onClick={() => { setPage("analyze"); setActiveTab("analyze"); }}
                    className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl btn-hover text-base shadow-lg shadow-green-200"
                  >
                    Analyze by Image
                  </button>
                  <button
                    onClick={() => { setPage("analyze"); setActiveTab("analyze"); startCamera(); }}
                    className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-800 font-bold rounded-2xl btn-hover text-base border-2 border-gray-200"
                  >
                    Use Live Camera
                  </button>
                </div>
                <div className="flex items-center gap-6 mt-8 fade-up-delay3">
                  <div className="flex -space-x-2">
                    {["bg-green-400", "bg-blue-400", "bg-purple-400", "bg-yellow-400"].map((c, i) => (
                      <div key={i} className={`w-8 h-8 ${c} rounded-full border-2 border-white`}></div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">Built for smart waste management</p>
                </div>
              </div>

              {/* Hero Visual */}
              <div className="relative flex justify-center items-center h-80">
                <div className="absolute w-64 h-64 bg-green-100 rounded-full opacity-50 spin-slow"></div>
                <div className="relative z-10 float">
                  <div className="w-48 h-48 bg-white rounded-3xl shadow-2xl flex flex-col items-center justify-center border border-gray-100">
                    <div className="w-16 h-16 bg-green-500 rounded-2xl mb-3 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-xs font-bold text-gray-700">Waste Detected</p>
                    <p className="text-green-600 font-bold text-sm mt-1">Organic — 97%</p>
                  </div>
                </div>
                <div className="absolute top-4 right-8 float-delay">
                  <div className="bg-white rounded-2xl shadow-lg px-4 py-3 border border-gray-100">
                    <p className="text-xs text-gray-500">Accuracy</p>
                    <p className="text-xl font-extrabold text-green-600">94%</p>
                  </div>
                </div>
                <div className="absolute bottom-4 left-8 float-delay2">
                  <div className="bg-white rounded-2xl shadow-lg px-4 py-3 border border-gray-100">
                    <p className="text-xs text-gray-500">Images Trained</p>
                    <p className="text-xl font-extrabold text-blue-600">22K+</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 px-8 border-y border-gray-100 bg-white">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "94%", label: "Model Accuracy", color: "text-green-600" },
              { value: "22K+", label: "Training Images", color: "text-blue-600" },
              { value: "2s", label: "Avg Response Time", color: "text-purple-600" },
              { value: "2", label: "Waste Categories", color: "text-orange-500" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className={`text-4xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-sm text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it Works */}
        <section id="how" className="py-20 px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900">How it works</h2>
              <p className="text-gray-500 mt-3 max-w-xl mx-auto">Three simple steps from waste to wisdom</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { num: "01", title: "Capture or Upload", desc: "Take a photo using your device camera or upload an existing image of any waste item from your gallery.", color: "bg-green-500", light: "bg-green-50 border-green-200" },
                { num: "02", title: "AI Classifies", desc: "Our MobileNetV2 deep learning model processes the image and identifies whether it is organic or recyclable waste.", color: "bg-blue-500", light: "bg-blue-50 border-blue-200" },
                { num: "03", title: "Act on Guidance", desc: "Get step by step disposal instructions tailored to the waste type along with confidence score and tips.", color: "bg-purple-500", light: "bg-purple-50 border-purple-200" },
              ].map((s, i) => (
                <div key={i} className={`bg-white rounded-3xl p-8 border-2 ${s.light} card-hover`}>
                  <div className={`w-12 h-12 ${s.color} rounded-2xl flex items-center justify-center text-white font-extrabold text-lg mb-6`}>
                    {s.num}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Waste Types */}
        <section className="py-20 px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900">What we detect</h2>
              <p className="text-gray-500 mt-3">Two primary waste categories with detailed sub-types</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl p-8 border border-green-200 card-hover">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Organic Waste</h3>
                    <p className="text-green-600 text-sm font-medium">Biodegradable</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-5">
                  {["Food scraps", "Vegetable peels", "Fruit waste", "Leaves", "Eggshells", "Garden waste", "Tea bags", "Coffee grounds"].map((t) => (
                    <span key={t} className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full border border-green-200">{t}</span>
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">Organic waste can be composted and converted into nutrient-rich fertilizer. Proper disposal reduces methane emissions from landfills.</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-sky-100 rounded-3xl p-8 border border-blue-200 card-hover">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Recyclable Waste</h3>
                    <p className="text-blue-600 text-sm font-medium">Can be reused</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-5">
                  {["Plastic bottles", "Glass", "Metal cans", "Cardboard", "Paper", "Tetra packs", "Aluminium foil", "Newspapers"].map((t) => (
                    <span key={t} className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full border border-blue-200">{t}</span>
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">Recyclable waste can be processed and turned into new products, reducing the need for raw materials and conserving natural resources.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section id="tech" className="py-20 px-8 bg-gray-900 text-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold">Built with modern tech</h2>
              <p className="text-gray-400 mt-3">A full-stack AI application from model to deployment</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "MobileNetV2", role: "AI Model", color: "bg-orange-500" },
                { name: "TensorFlow", role: "ML Framework", color: "bg-yellow-500" },
                { name: "FastAPI", role: "Backend API", color: "bg-green-500" },
                { name: "Next.js", role: "Frontend", color: "bg-blue-500" },
                { name: "Python 3.10", role: "Language", color: "bg-purple-500" },
                { name: "TailwindCSS", role: "Styling", color: "bg-cyan-500" },
                { name: "Railway", role: "Backend Host", color: "bg-pink-500" },
                { name: "Vercel", role: "Frontend Host", color: "bg-indigo-500" },
              ].map((t, i) => (
                <div key={i} className="bg-gray-800 rounded-2xl p-5 border border-gray-700 card-hover">
                  <div className={`w-8 h-8 ${t.color} rounded-lg mb-3`}></div>
                  <p className="font-bold text-white text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{t.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section id="impact" className="py-20 px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900">Why it matters</h2>
              <p className="text-gray-500 mt-3 max-w-xl mx-auto">Improper waste disposal is one of the biggest environmental challenges of our time</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { stat: "62M", label: "Tonnes of waste generated in India yearly", color: "bg-red-50 border-red-200", statColor: "text-red-500" },
                { stat: "30%", label: "Error rate in manual waste sorting by humans", color: "bg-orange-50 border-orange-200", statColor: "text-orange-500" },
                { stat: "94%", label: "Accuracy achieved by our AI classification model", color: "bg-green-50 border-green-200", statColor: "text-green-500" },
              ].map((s, i) => (
                <div key={i} className={`rounded-3xl p-8 border-2 ${s.color} card-hover text-center`}>
                  <p className={`text-5xl font-extrabold ${s.statColor} mb-3`}>{s.stat}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-8 bg-gradient-to-br from-green-600 to-green-800 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-extrabold mb-5">Start classifying waste today</h2>
            <p className="text-green-100 text-lg mb-10 leading-relaxed">Upload an image or open your camera. Our AI model will classify your waste and guide you on proper disposal in under 2 seconds.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => { setPage("analyze"); setActiveTab("analyze"); }}
                className="px-10 py-4 bg-white text-green-700 font-bold rounded-2xl btn-hover text-base shadow-xl"
              >
                Upload an Image
              </button>
              <button
                onClick={() => { setPage("analyze"); setActiveTab("analyze"); startCamera(); }}
                className="px-10 py-4 bg-green-500 hover:bg-green-400 text-white font-bold rounded-2xl btn-hover text-base border-2 border-green-400"
              >
                Use Live Camera
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 py-10 px-8">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">W</span>
              </div>
              <span className="font-bold text-white">WasteAI</span>
            </div>
            <p className="text-sm text-center">Semester IV Project — Built with MobileNetV2, FastAPI, Next.js and TailwindCSS</p>
            <div className="flex items-center gap-4 text-sm">
              <a href="https://github.com/dev-vidhi/semester_four" target="_blank" className="hover:text-white transition">GitHub</a>
              <a href="https://semesterfour-production.up.railway.app" target="_blank" className="hover:text-white transition">API</a>
            </div>
          </div>
        </footer>
      </main>
    );
  }

  // ANALYZE PAGE
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => { stopCamera(); setPage("landing"); setImage(null); setFile(null); setResult(null); }}
              className="text-gray-400 hover:text-gray-600 transition mr-1 text-sm">
              &larr; Back
            </button>
            <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">W</span>
            </div>
            <span className="font-bold text-gray-900">WasteAI</span>
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
        {activeTab === "analyze" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              {showCamera && (
                <div className="mb-4 rounded-2xl overflow-hidden border border-gray-200 bg-black">
                  <video ref={videoRef} autoPlay playsInline className="w-full" />
                  <div className="flex gap-2 p-3 bg-gray-900">
                    <button onClick={capturePhoto} className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition text-sm">
                      Capture Photo
                    </button>
                    <button onClick={stopCamera} className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition text-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {!showCamera && (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer mb-4 ${dragOver ? "border-green-400 bg-green-50" : "border-gray-200 bg-white hover:border-green-300 hover:bg-green-50"}`}
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
                  className="w-full py-4 rounded-xl text-white font-bold text-sm transition-all bg-green-600 hover:bg-green-700 disabled:opacity-50 shadow-lg shadow-green-200">
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

            <div>
              {result ? (
                <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">
                  <div className="p-6 text-white text-center" style={{ background: result.color }}>
                    <h2 className="text-2xl font-bold">{result.class}</h2>
                    <p className="text-white text-sm mt-1 opacity-90">Confidence: {result.confidence}%</p>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-800 mb-3 text-sm">Disposal Instructions</h3>
                    <div className="space-y-2">
                      {(result.class === "Organic Waste" ? organicSteps : recyclableSteps).map((step, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <span className="text-xs font-bold text-gray-400 mt-0.5 w-4">{i + 1}</span>
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
                  <p className="text-gray-400 text-sm mt-2">Upload an image or use your camera</p>
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
                      <p className="text-xs text-gray-400 mt-0.5">{item.result.confidence}% · {item.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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
                  {[
                    { val: history.length, label: "Total Analyzed", color: "text-gray-900" },
                    { val: history.filter(h => h.result.class === "Organic Waste").length, label: "Organic", color: "text-green-600" },
                    { val: history.filter(h => h.result.class === "Recyclable Waste").length, label: "Recyclable", color: "text-blue-600" },
                    { val: `${(history.reduce((acc, h) => acc + h.result.confidence, 0) / history.length).toFixed(1)}%`, label: "Avg Confidence", color: "text-purple-600" },
                  ].map((s, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
                      <p className={`text-4xl font-bold ${s.color}`}>{s.val}</p>
                      <p className="text-xs text-gray-400 mt-1">{s.label}</p>
                    </div>
                  ))}
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
                          <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  <h3 className="font-semibold text-gray-700 mt-6 mb-3 text-sm">Recent Activity</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {history.map((item, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                        <span className="text-xs text-gray-600">{item.result.class}</span>
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