"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Mic, Send, MapPin, CheckCircle } from "lucide-react";

export default function CitizenPortal() {
  const [step, setStep] = useState<"login" | "otp" | "menu" | "complaint">("login");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [location, setLocation] = useState<{lat: number, lon: number} | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Form States
  const [name, setName] = useState("");
  const [ministry, setMinistry] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Skip to menu if we are bypassing login in dev
    if (localStorage.getItem('citizen_phone')) {
      setMobile(localStorage.getItem('citizen_phone')!);
      setStep("menu");
    }
  }, []);

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        (err) => console.error("Location error", err)
      );
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobile.length > 9) setStep("otp");
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      localStorage.setItem('citizen_phone', mobile);
      setStep("menu");
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob);
        
        try {
          const res = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          if (data.text) {
            setDetails(prev => prev + (prev ? " " : "") + data.text);
          }
        } catch (e) {
          console.error("Transcription error", e);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing mic", err);
      alert("Microphone access is required to use voice commands.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
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

        {/* Complaint Form Step */}
        {step === "complaint" && (
          <div className="flex flex-col max-h-[700px] overflow-y-auto">
            <div className="p-6 space-y-4">
              
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your name" 
                  className="w-full mt-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Ministry / Department</label>
                <select 
                  value={ministry}
                  onChange={e => setMinistry(e.target.value)}
                  className="w-full mt-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  required
                >
                  <option value="" disabled>Select Ministry</option>
                  <option value="Ministry of Road Transport and Highways">Road Transport & Highways</option>
                  <option value="Ministry of Power">Power</option>
                  <option value="Ministry of Jal Shakti">Jal Shakti (Water)</option>
                  <option value="Ministry of Railways">Railways</option>
                  <option value="Ministry of Housing and Urban Affairs">Housing & Urban Affairs</option>
                  <option value="Ministry of Health">Health & Family Welfare</option>
                  <option value="Ministry of Education">Education</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase flex justify-between">
                  <span>Complaint Details (Any Language)</span>
                  <button 
                    onClick={toggleRecording}
                    type="button"
                    className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    <Mic className="w-3 h-3" /> {isRecording ? "Recording..." : "Record Voice"}
                  </button>
                </label>
                <textarea 
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  placeholder="Describe the issue in your preferred language..." 
                  className="w-full mt-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none"
                  required
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                {location ? (
                  <div className="text-xs text-emerald-600 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" /> Exact Location Captured ({location.lat.toFixed(4)}, {location.lon.toFixed(4)})
                  </div>
                ) : (
                  <div className="text-xs text-amber-600 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" /> Requesting location... (Please allow location access)
                  </div>
                )}
              </div>

              <button 
                onClick={async () => {
                  if (!name || !ministry || !details) return alert("Please fill all fields");
                  setIsSubmitting(true);
                  try {
                    const res = await fetch('/api/submit-complaint', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name, phone: mobile, details, location, ministry })
                    });
                    if (res.ok) {
                      setStep('menu');
                      alert("Complaint registered successfully! The details have been forwarded to the concerned department.");
                      window.location.href = '/dashboard';
                    } else {
                      alert("Failed to submit. Please try again.");
                    }
                  } catch (e) {
                    console.error("Submit error", e);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                disabled={isSubmitting || !location}
                className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? "Submitting..." : <><Send className="w-4 h-4 mr-2" /> Submit Complaint</>}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
