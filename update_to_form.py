import re

with open('src/components/CitizenPortal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# I will replace the state variables and the "Complaint Chat Step"

new_states = """
  // Form States
  const [name, setName] = useState("");
  const [ministry, setMinistry] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
"""

content = re.sub(r'const \[messages, setMessages\] = useState<any\[\]>\(\[\]\);', new_states, content)

form_ui = """
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
"""

# Replace the chat UI completely
chat_ui_regex = re.compile(r'\{\/\* Complaint Chat Step \*\/\}.*?(?=\{\/\*|$)', re.DOTALL)
content = chat_ui_regex.sub(form_ui, content)

# We need to change what happens when recording finishes.
# Currently, `stopRecording` calls `/api/transcribe` and sends it as a message.
# We want it to append to `details` instead.

old_transcribe = """
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.text) {
        handleSendComplaint(data.text);
      }
"""

new_transcribe = """
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.text) {
        setDetails(prev => prev + (prev ? " " : "") + data.text);
      }
"""
content = content.replace(old_transcribe, new_transcribe)

with open('src/components/CitizenPortal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
