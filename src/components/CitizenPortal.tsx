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
  const [step, setStep] = useState<"login" | "otp" | "menu" | "complaint" | "feedback">("login");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [location, setLocation] = useState<{lat: number, lon: number} | null>(null);
  
  // Chat State
  const [messages, setMessages] = useState<{role: "system" | "user", text: string}[]>([]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);



  );

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
      setStep("otp");
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length >= 4) {
      setStep("menu");
      requestLocation();
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.webm");
          
          setInputText("Transcribing...");
          try {
            const res = await fetch("/api/transcribe", {
              method: "POST",
              body: formData
            });
            if (res.ok) {
              const data = await res.json();
              if (data.text) {
                setInputText(data.text);
              } else {
                setInputText("");
              }
            } else {
              setInputText("");
              console.error("Failed to transcribe");
            }
          } catch (e) {
            console.error(e);
            setInputText("");
          }
          
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Microphone access denied", err);
      }
    }
  };

  const handleSendComplaint = async () => {
    if (!inputText.trim()) return;
    
    // Add user message
    const newMessages = [...messages, { role: "user", text: inputText }];
    setMessages(newMessages as any);
    const textToSend = inputText;
    setInputText("");

    try {
        let step = 1;
        if (newMessages.length >= 3) {
            step = 2;
        }
        
        const res = await fetch('/api/citizen-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: newMessages, step, location, mobile })
        });
        
        const data = await res.json();
        const aiText = data.text || "Thank you. We have forwarded your complaint to the concerned department.";
        
        const finalMessages = [...newMessages, { role: "system", text: aiText }];
        setMessages(finalMessages as any);
        
        if (step === 2 && location) {
            fetch('https://sentinal-api.onrender.com/api/v1/citizen/ingest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone_number: mobile,
                    device_id: "pulse_web",
                    lat: location.lat,
                    lon: location.lon,
                    raw_text: textToSend, // Sending the initial complaint text
                    language: "auto"
                })
            }).catch(e => console.error("API error", e));
        }
    } catch (e) {
        console.error("Chat error", e);
    }
  };



  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-indigo-600 p-6 text-white text-center relative">
          {(step === "complaint") && (
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

        {/* OTP Step */}
        {step === "otp" && (
          <div className="p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-slate-800">Verify Mobile</h2>
              <p className="text-slate-500 text-sm mt-2">Code sent to {mobile}</p>
            </div>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Verification Code</label>
                <input 
                  type="text" 
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="Enter the 6-digit code" 
                  className="w-full mt-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-center tracking-widest text-lg"
                  required
                />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition">
                Verify Code
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
                setMessages([{ role: "system", text: "Welcome! You can register your complaint by speaking or typing in any language (English, Hindi, Bengali, etc.)." }]);
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


      </div>
    </div>
  );
}
