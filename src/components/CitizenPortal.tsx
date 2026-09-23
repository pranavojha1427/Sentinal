"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Send, MapPin, CheckCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// A mock of the SpeechRecognition API for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function CitizenPortal() {
  const [step, setStep] = useState<"login" | "menu" | "complaint" | "feedback">("login");
  const [mobile, setMobile] = useState("");
  const [location, setLocation] = useState<{lat: number, lon: number} | null>(null);
  
  // Chat State
  const [messages, setMessages] = useState<{role: "system" | "user", text: string}[]>([]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Projects (for feedback)
  const [nearbyProjects, setNearbyProjects] = useState<any[]>([]);

  useEffect(() => {
    // Initialize Speech Recognition
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "hi-IN"; // Default to Hindi, can be changed
        
        recognition.onresult = (event: any) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          setInputText(transcript);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const requestLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        (err) => console.warn("Location error:", err)
      );
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobile.length >= 10) {
      setStep("menu");
      requestLocation();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setInputText("");
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleSendComplaint = async () => {
    if (!inputText.trim()) return;
    
    // Add user message
    const newMessages = [...messages, { role: "user", text: inputText }];
    setMessages(newMessages as any);
    const textToSend = inputText;
    setInputText("");

    // Simple mocked AI conversational flow for demonstration
    setTimeout(() => {
      if (newMessages.length === 1) {
        setMessages([...newMessages, { role: "system", text: "हमें आपकी समस्या मिल गई है। क्या आप हमें बता सकते हैं कि यह समस्या कितने समय से है?" }] as any);
      } else if (newMessages.length === 3) {
        setMessages([...newMessages, { role: "system", text: "धन्यवाद। हमने आपकी शिकायत (लोकेशन के साथ) संबंधित विभाग को भेज दी है।" }] as any);
        
        // Actually submit to our FastAPI / Supabase backend here
        if (location) {
          fetch('http://localhost:8000/api/v1/citizen/ingest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone_number: mobile,
                device_id: "pulse_web",
                lat: location.lat,
                lon: location.lon,
                raw_text: textToSend, // Sending the initial complaint text
                language: "hi"
            })
          }).catch(e => console.error("API error", e));
        }
      }
    }, 1000);
  };

  const loadNearbyProjects = async () => {
    // Mocking fetching nearby projects from Supabase
    setStep("feedback");
    const { data } = await supabase.from("projects").select("id, project_name, sector").limit(5);
    if (data) setNearbyProjects(data);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-indigo-600 p-6 text-white text-center relative">
          {(step === "complaint" || step === "feedback") && (
            <button onClick={() => setStep("menu")} className="absolute left-4 top-6 text-indigo-100 hover:text-white">
              <ArrowLeft />
            </button>
          )}
          <h1 className="text-2xl font-bold">PragatiPulse</h1>
          <p className="text-indigo-200 text-sm mt-1">Citizen Participation Portal</p>
        </div>

        {/* Login Step */}
        {step === "login" && (
          <div className="p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-slate-800">Welcome</h2>
              <p className="text-slate-500 text-sm mt-2">Enter your mobile number to participate in nation-building.</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Mobile Number</label>
                <input 
                  type="tel" 
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  placeholder="+91 98765 43210" 
                  className="w-full mt-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition">
                Continue
              </button>
            </form>
          </div>
        )}

        {/* Main Menu Step */}
        {step === "menu" && (
          <div className="p-8 space-y-4">
            <div className="flex items-center justify-center mb-6 text-emerald-600 bg-emerald-50 py-2 px-4 rounded-full text-sm font-semibold">
              <CheckCircle className="w-4 h-4 mr-2" /> Registered successfully
            </div>
            
            <button 
              onClick={() => {
                setStep("complaint");
                setMessages([{ role: "system", text: "नमस्ते! आप अपनी शिकायत बोलकर या लिखकर दर्ज कर सकते हैं।" }]);
                requestLocation();
              }}
              className="w-full text-left p-4 border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 rounded-xl transition flex items-center group"
            >
              <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                <Mic className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-slate-800">Register Complaint</h3>
                <p className="text-xs text-slate-500 mt-1">Report local infrastructure issues</p>
              </div>
            </button>

            <button 
              onClick={loadNearbyProjects}
              className="w-full text-left p-4 border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 rounded-xl transition flex items-center group"
            >
              <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-slate-800">Feedback on Projects</h3>
                <p className="text-xs text-slate-500 mt-1">Review ongoing projects near you</p>
              </div>
            </button>
          </div>
        )}

        {/* Complaint Chat Step */}
        {step === "complaint" && (
          <div className="flex flex-col h-[500px]">
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.role === "user" ? "bg-indigo-600 text-white rounded-br-none" : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200">
              {location ? (
                <div className="text-[10px] text-emerald-600 flex items-center mb-2">
                  <MapPin className="w-3 h-3 mr-1" /> Location captured ({location.lat.toFixed(4)}, {location.lon.toFixed(4)})
                </div>
              ) : (
                <div className="text-[10px] text-amber-600 flex items-center mb-2">
                  <MapPin className="w-3 h-3 mr-1" /> Requesting location...
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleRecording}
                  className={`p-3 rounded-full flex-shrink-0 transition ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  <Mic className="w-5 h-5" />
                </button>
                <input 
                  type="text" 
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder={isRecording ? "Listening..." : "Type or speak..."}
                  className="flex-1 p-3 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
                  onKeyDown={e => e.key === 'Enter' && handleSendComplaint()}
                />
                <button 
                  onClick={handleSendComplaint}
                  className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition flex-shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Step */}
        {step === "feedback" && (
          <div className="flex flex-col h-[500px]">
             <div className="p-4 bg-slate-50 border-b border-slate-200">
                <h3 className="font-semibold text-slate-800">Nearby Projects</h3>
                <p className="text-xs text-slate-500">Based on your location</p>
             </div>
             <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {nearbyProjects.map(p => (
                  <div key={p.id} className="bg-white border border-slate-200 p-4 rounded-xl hover:border-indigo-500 cursor-pointer">
                    <div className="text-xs font-semibold text-indigo-600 uppercase mb-1">{p.sector}</div>
                    <div className="font-semibold text-slate-800 text-sm">{p.project_name}</div>
                    <button 
                      onClick={() => {
                        setStep("complaint");
                        setMessages([{ role: "system", text: `आप "${p.project_name}" के बारे में अपना फीडबैक बोलकर दर्ज कर सकते हैं।` }]);
                      }}
                      className="mt-3 text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 font-semibold flex items-center"
                    >
                      <Mic className="w-3 h-3 mr-1" /> Add Voice Feedback
                    </button>
                  </div>
                ))}
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
