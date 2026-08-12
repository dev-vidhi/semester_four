"use client";
import { useState, useCallback } from "react";
import { ArrowRight, Leaf, Recycle, BrainCircuit, BarChart3, Clock3, Trash2, CheckCircle2, ChevronRight, Droplets, Target } from "lucide-react";

interface Result {
  class: string;
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
  const [showLanding, setShowLanding] = useState(true);
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<"analyze" | "history" | "stats">("analyze");

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

  const handlePredict = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      // Ensure backend matches: res.json() must NOT contain 'emoji' key
      //const res = await fetch("http://127.0.0.1:8000/predict", {
      const res = await fetch("https://semesterfour-production.up.railway.app/predict", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data);
      if (image) {
        setHistory((prev) => [
          { image, result: data, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
          ...prev.slice(0, 9),
        ]);
      }
    } catch {
      alert("Error connecting to backend. Make sure it is running!");
    }
    setLoading(false);
  };

  const organicSteps = [
    { icon: <Trash2 className="text-green-500" size={20} />, text: "Collect in a green bin or compost pile" },
    { icon: <Leaf className="text-green-500" size={20} />, text: "Keep separate from dry recyclables" },
    { icon: <Droplets className="text-green-500" size={20} />, text: "Drain excess liquids before disposal" },
    { icon: <CheckCircle2 className="text-green-500" size={20} />, text: "Do NOT mix with plastic/metal" },
  ];

  const recyclableSteps = [
    { icon: <Trash2 className="text-blue-500" size={20} />, text: "Clean and rinse the item thoroughly" },
    { icon: <Trash2 className="text-blue-500" size={20} />, text: "Flatten cardboard to save space" },
    { icon: <Recycle className="text-blue-500" size={20} />, text: "Place in blue recycling container" },
    { icon: <CheckCircle2 className="text-blue-500" size={20} />, text: "Remove caps and labels if possible" },
  ];

  // --- LANDING PAGE ---
  if (showLanding) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 relative overflow-hidden font-sans">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-green-950/40 rounded-full blur-[160px] animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[800px] h-[800px] bg-blue-950/40 rounded-full blur-[160px] animate-pulse delay-1000" />
        </div>

        {/* Floating elements for visual depth */}
        <Leaf className="absolute text-green-700 top-20 left-32 blur-sm opacity-20" size={60} />
        <Recycle className="absolute text-blue-700 bottom-40 right-20 blur-[2px] opacity-15" size={100} />

        <div className="relative z-10 w-full max-w-6xl mt-12 md:mt-16 space-y-20">
          
          {/* Main Hero Card - GLASSMORPHISM */}
          <div className="backdrop-blur-2xl bg-white/5 border border-white/10 shadow-[0_16px_48px_0_rgba(0,0,0,0.3)] rounded-[3rem] p-8 md:p-12 text-center animate-in fade-in duration-700">
            
            <div className="inline-flex items-center gap-2 bg-slate-800/80 backdrop-blur-md px-5 py-2.5 rounded-full border border-slate-700 shadow-inner mb-6 transition-transform hover:scale-105">
              <BrainCircuit className="text-green-400" size={18} />
              <span className="text-sm font-semibold text-slate-300">AI Powered Analysis</span>
              <Target className="text-blue-400 ml-1" size={16} />
              <span className="text-sm font-semibold text-slate-300">94% Accuracy</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-50 tracking-tighter mb-4 leading-tight">
              Smart<span className="text-green-500">Waste</span>: The Intelligent Segregator
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-8 leading-relaxed">
              Transforming recycling through artificial intelligence. Take a photo of any waste item and our advanced MobileNetV2 model instantly determines if it is <span className="font-bold text-green-400">Organic</span> or <span className="font-bold text-blue-400">Recyclable</span>, providing you with precise disposal guidance.
            </p>

            {/* UPDATED LIGHT GREEN BUTTON */}
            <button
              onClick={() => setShowLanding(false)}
              className="group relative px-8 py-4 bg-green-400 hover:bg-green-300 text-slate-950 rounded-2xl font-black text-lg hover:shadow-[0_0_30px_rgba(74,222,128,0.4)] transition-all active:scale-95 duration-300"
            >
              Analyze Your Waste
            <ChevronRight className="ml-2 group-hover:translate-x-1.5 inline-block transition-transform duration-300" size={20} />
            </button>
          </div>

          {/* About Section - Subdued Glass cards */}
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2.5 bg-green-950/70 border border-green-900 rounded-full px-4 py-1.5">
                <Leaf className="text-green-400" size={18} />
                <span className="text-sm font-bold text-green-300">About the Initiative</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-50 tracking-tight">Our Mission for a Greener Tomorrow</h2>
              <p className="text-lg text-slate-400 leading-relaxed">
                SmartWaste was born from a simple yet powerful goal: to eliminate the guesswork in recycling. Traditional waste separation is complex and often confusing, leading to high levels of contamination in recycling streams. We believe that technology, specifically computer vision, can empower individuals to make sustainable choices effortless.
              </p>
              <p className="text-lg text-slate-400 leading-relaxed">
                Our team consists of environmental advocates and AI specialists who combined their expertise to develop a tool that is not only accurate but also accessible to everyone. We are dedicated to creating solutions that drive measurable environmental impact, one item at a time.
              </p>
            </div>
            <div className="backdrop-blur-xl bg-slate-900/50 border border-slate-800 rounded-3xl p-10 h-full flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-slate-100 mb-6 flex items-center gap-3"><CheckCircle2 className="text-green-500"/> Core Values</h3>
              <ul className="space-y-4 text-slate-400 text-lg list-none">
                <li className="before:content-['✓'] before:mr-3 before:text-green-500 before:font-bold">Accuracy: We leverage state-of-the-art AI.</li>
                <li className="before:content-['✓'] before:mr-3 before:text-green-500 before:font-bold">Accessibility: Making recycling simple for everyone.</li>
                <li className="before:content-['✓'] before:mr-3 before:text-green-500 before:font-bold">Education: Providing actionable disposal steps.</li>
                <li className="before:content-['✓'] before:mr-3 before:text-green-500 before:font-bold">Sustainability: Aiming for zero contamination.</li>
              </ul>
            </div>
          </div>

          {/* Technology Section */}
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="backdrop-blur-xl bg-slate-900/50 border border-slate-800 rounded-3xl p-10 space-y-6 md:order-2">
              <BrainCircuit className="text-blue-400" size={60} />
              <h3 className="text-2xl font-bold text-slate-100 mb-6">Advanced Computer Vision</h3>
              <p className="text-slate-400 text-lg leading-relaxed">
                The core of SmartWaste is a deep learning model based on the <span className="font-bold text-blue-400">MobileNetV2</span> architecture. This specific model was chosen for its optimal balance of speed and precision, allowing it to deliver real-time analysis even on mobile devices.
              </p>
              <p className="text-slate-400 text-lg leading-relaxed">
                Trained on a curated dataset of over 22,000 labeled waste images, the model has learned to recognize the subtle visual features of varied materials. This rigorous training allows it to classify waste as Organic or Recyclable with a remarkably high degree of <span className="font-bold text-blue-400">94.3% accuracy</span>.
              </p>
            </div>
            <div className="space-y-6 md:order-1">
              <div className="inline-flex items-center gap-2.5 bg-blue-950/70 border border-blue-900 rounded-full px-4 py-1.5">
                <BrainCircuit className="text-blue-400" size={18} />
                <span className="text-sm font-bold text-blue-300">How It Works</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-50 tracking-tight">AI Driven Decisions, Instantly</h2>
              <p className="text-lg text-slate-400 leading-relaxed">
                SmartWaste eliminates the mental burden of figuring out waste categories. Simply upload or take a snapshot of an item, and our AI instantly parses the image, identifies key features, and classifies the waste.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50">
                  <BarChart3 className="text-green-500 mb-3" size={24}/>
                  <p className="font-bold">Real-time Predictions</p>
                </div>
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50">
                  <Clock3 className="text-blue-500 mb-3" size={24}/>
                  <p className="font-bold">Rapid Processing</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        <footer className="mt-24 py-12 text-center text-slate-600 text-xs font-bold tracking-widest uppercase relative z-10 w-full border-t border-slate-800">
          Smart Waste Segregator • Utilizing MobileNetV2 for Environmental Impact
        </footer>
      </main>
    );
  }

  // --- MAIN APP ---
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-green-800 relative overflow-hidden">
      {/* Background gradients for app page */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-green-950/20 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-950/20 rounded-full blur-[160px]" />
      </div>

      <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setShowLanding(true)}>
            <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center shadow-lg group-hover:bg-white transition-colors duration-300">
              <Recycle className="text-slate-950" size={24} />
            </div>
            <h1 className="text-2xl font-black tracking-tighter">Smart<span className="text-green-500">Waste</span> <span className="text-[10px] font-medium text-slate-600 block -mt-1 tracking-normal">Intelligent Segregator</span></h1>
          </div>

          <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl shadow-inner">
            {[ {tab: "analyze", icon: <BrainCircuit size={16}/> }, {tab: "history", icon: <Clock3 size={16}/> }, {tab: "stats", icon: <BarChart3 size={16}/> } ].map(({tab, icon}) => (
              <button key={tab} onClick={() => setActiveTab(tab as "analyze" | "history" | "stats")}
                className={`px-6 py-2.5 flex items-center gap-2 rounded-lg text-sm font-bold capitalize transition-all duration-300 ${activeTab === tab ? "bg-slate-100 text-slate-950 shadow-md" : "text-slate-400 hover:text-slate-100"}`}
              >
                {icon} {tab}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        
        {activeTab === "analyze" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start animate-in fade-in duration-500">
            {/* Upload Area */}
            <div className="lg:col-span-7 space-y-8">
              <div onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
                onClick={() => document.getElementById("fileInput")?.click()}
                className={`relative group overflow-hidden border-2 border-dashed rounded-3xl p-16 text-center transition-all cursor-pointer ${dragOver ? "border-green-600 bg-green-950/20" : "border-slate-800 bg-slate-900 hover:border-green-600 hover:bg-green-950/10"}`}
              >
                <input id="fileInput" type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handleFile(e.target.files[0])} />
                {image ? (
                  <div className="relative group overflow-hidden rounded-2xl shadow-xl border border-slate-700">
                    <img src={image} alt="preview" className="max-h-96 mx-auto object-cover transition-transform group-hover:scale-[1.03] duration-500" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-bold bg-black/40 px-5 py-2.5 rounded-full backdrop-blur-md">Change Photo</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 space-y-6">
                    <div className="w-24 h-24 bg-slate-800 border border-slate-700 rounded-3xl flex items-center justify-center mx-auto transition-transform group-hover:scale-110 duration-300">
                      <Trash2 className="text-slate-600 group-hover:text-green-500 transition-colors" size={40} />
                    </div>
                    <p className="text-2xl font-bold text-slate-300">Submit a waste item</p>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto">Click to browse or drop an image. Supported formats: JPG, PNG, WEBP.</p>
                  </div>
                )}
              </div>

              {image && !result && (
                <button onClick={handlePredict} disabled={loading}
                  className="w-full py-5 rounded-2xl text-slate-950 font-black text-xl transition-all duration-300 bg-slate-100 hover:bg-white disabled:opacity-50 shadow-lg active:scale-[0.98]"
                >
                  {loading ? "Neural Engine Processing..." : "Classify Item Now"}
                </button>
              )}
            </div>

            {/* Results Sidebar */}
            <div className="lg:col-span-5">
              {result ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden sticky top-36 animate-in fade-in slide-in-from-bottom-6 duration-700">
                  <div className="p-12 text-center text-white" style={{ background: `linear-gradient(135deg, ${result.color}, ${result.color}cc)` }}>
                    <h2 className="text-4xl font-black mb-3 tracking-tighter">{result.class}</h2>
                    <div className="inline-block bg-black/20 backdrop-blur-md border border-white/20 rounded-full px-5 py-1.5 shadow-inner">
                      <span className="text-sm font-bold uppercase tracking-widest">{result.confidence}% Confidence</span>
                    </div>
                  </div>
                  <div className="p-10 space-y-8">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><CheckCircle2 size={16} className="text-green-600"/> Disposal Steps</h3>
                    <div className="grid gap-4">
                      {(result.class === "Organic Waste" ? organicSteps : recyclableSteps).map((step, i) => (
                        <div key={i} className="flex items-center gap-5 bg-slate-800/60 border border-slate-800/80 p-5 rounded-2xl transition-hover hover:bg-slate-800">
                          {step.icon}
                          <p className="text-slate-200 leading-tight">{step.text}</p>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => { setImage(null); setFile(null); setResult(null); }}
                      className="w-full py-4 border border-slate-800 bg-slate-900 text-slate-400 rounded-2xl font-bold hover:bg-slate-800 hover:text-slate-100 transition-all text-sm"
                    >
                      Reset and Classify New Item
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center h-full min-h-[450px] flex flex-col justify-center items-center">
                  <BrainCircuit className="text-slate-800 mb-8" size={70} />
                  <h3 className="text-xl font-bold text-slate-300 mb-4">Neural Engine Standby</h3>
                  <p className="text-slate-600 text-sm max-w-xs leading-relaxed">Please submit an image on the left. The MobileNetV2 model is primed for classification.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Other Tabs unchanged in structure, just styled */}
        {activeTab === "history" && (
          <div className="animate-in fade-in duration-700">
            <h2 className="text-3xl font-black text-slate-100 tracking-tight mb-10">Scan Timeline</h2>
            {history.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-24 text-center italic text-slate-600 font-medium"> No items scanned yet. Use the Analyze tab to begin. </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {history.map((item, i) => (
                  <div key={i} className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-lg group hover:shadow-2xl transition-all duration-300">
                    <div className="h-56 overflow-hidden relative">
                      <img src={item.image} alt="waste" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="p-7 space-y-3 relative">
                        <div className={`absolute top-0 right-0 w-2 h-full`} style={{ backgroundColor: item.result.color }} />
                        <p className="text-2xl font-black text-slate-100 tracking-tight leading-none">{item.result.class}</p>
                        <p className="text-sm font-semibold text-slate-400">Match Accuracy: {item.result.confidence}%</p>
                        <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">{item.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "stats" && (
          <div className="animate-in fade-in duration-700 space-y-10">
            <h2 className="text-3xl font-black text-slate-100 mb-10 tracking-tight">Environmental Dashboard</h2>
            {history.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-24 text-center italic text-slate-600 font-medium"> Awaiting classification data to populate analytics. </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {[ { label: "Scan Count", val: history.length }, { label: "Organic Items", val: history.filter(h => h.result.class === "Organic Waste").length }, { label: "Recyclables", val: history.filter(h => h.result.class === "Recyclable Waste").length } ].map((s) => (
                    <div key={s.label} className="bg-slate-900 border border-slate-800 p-10 rounded-3xl shadow-lg">
                      <p className="text-slate-600 text-xs font-bold uppercase tracking-widest mb-2">{s.label}</p>
                      <p className={`text-6xl font-extrabold text-slate-100`}>{s.val}</p>
                    </div>
                  ))}
                  <div className="lg:col-span-3 bg-slate-900 border border-slate-800 p-12 rounded-3xl shadow-lg">
                  <h3 className="text-xl font-bold text-slate-200 mb-8">Waste Composition %</h3>
                  <div className="space-y-10">
                    {["Organic Waste", "Recyclable Waste"].map((cls) => {
                      const count = history.filter(h => h.result.class === cls).length;
                      const pct = Math.round((count / history.length) * 100);
                      const color = cls === "Organic Waste" ? "bg-green-500" : "bg-blue-500";
                      return (
                        <div key={cls}>
                          <div className="flex justify-between items-baseline mb-3">
                            <span className="font-bold text-slate-300 text-lg">{cls}</span>
                            <span className="text-3xl font-extrabold text-slate-100">{pct}%</span>
                          </div>
                          <div className="h-6 w-full bg-slate-800 rounded-full overflow-hidden p-1">
                            <div className={`${color} h-full rounded-full transition-all duration-1000 ease-out`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
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