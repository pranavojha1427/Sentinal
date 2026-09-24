import re

with open("src/components/CitizenPortal.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update imports for MediaRecorder useRef
content = content.replace(
    'const recognitionRef = useRef<any>(null);',
    'const mediaRecorderRef = useRef<MediaRecorder | null>(null);\n  const audioChunksRef = useRef<Blob[]>([]);'
)

# 2. Remove useEffect for SpeechRecognition
speech_rec_effect = re.search(r'useEffect\(\(\) => \{\s*// Initialize Speech Recognition.*?(?=\s*\}\, \[\]\);)', content, re.DOTALL)
if speech_rec_effect:
    # also remove the }, []); part
    content = content[:speech_rec_effect.start()] + content[speech_rec_effect.end()+8:]
    
# 3. Replace toggleRecording
toggle_recording_old = """  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setInputText("");
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };"""

toggle_recording_new = """  const toggleRecording = async () => {
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
  };"""

content = content.replace(toggle_recording_old, toggle_recording_new)

with open("src/components/CitizenPortal.tsx", "w", encoding="utf-8") as f:
    f.write(content)
