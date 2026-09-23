import os
import re

path = "src/components/WorkflowInbox.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Add state for project code
content = content.replace(
    'const [feedback, setFeedback] = useState("");',
    'const [feedback, setFeedback] = useState("");\n  const [projectCodes, setProjectCodes] = useState<Record<string, string>>({});'
)

# Update handleAction
old_handle = """  const handleAction = async (id: string, action: string) => {
    if ((action === "reject" || action === "feedback") && !feedback) return alert("Please provide feedback/reason.");
    await fetch("/api/proposals", { method: "PUT", body: JSON.stringify({ id, action, feedback }) });
    setFeedback(""); load();
  };"""

new_handle = """  const handleAction = async (id: string, action: string) => {
    if ((action === "reject" || action === "feedback") && !feedback) return alert("Please provide feedback/reason.");
    
    const pCode = projectCodes[id] || undefined;
    if (action === "approve" && currentUser.role === "admin" && !pCode) {
       // Ask for confirmation if empty, or just let it pass
    }

    await fetch("/api/proposals", { method: "PUT", body: JSON.stringify({ id, action, feedback, project_code: pCode }) });
    setFeedback(""); load();
  };"""
content = content.replace(old_handle, new_handle)

# Add input for Admin approval
old_inbox = """            {activeTab === "inbox" && (
              <div className="flex items-center gap-2 mt-2">
                <input placeholder="Feedback / Reason..." value={feedback} onChange={e=>setFeedback(e.target.value)} className="border p-2 rounded flex-1 text-sm" />
                <Button onClick={() => handleAction(p._id, "approve")} className="bg-green-600 hover:bg-green-700">Approve</Button>
                <Button onClick={() => handleAction(p._id, "reject")} variant="destructive">Reject</Button>
              </div>
            )}"""

new_inbox = """            {activeTab === "inbox" && (
              <div className="flex flex-col gap-2 mt-2">
                {currentUser.role === "admin" && (
                  <input 
                    placeholder="Assign Project Code (Required for Approval)" 
                    value={projectCodes[p._id] || ""} 
                    onChange={e => setProjectCodes({...projectCodes, [p._id]: e.target.value})} 
                    className="border border-blue-300 bg-blue-50 p-2 rounded w-full md:w-1/2 text-sm font-mono" 
                  />
                )}
                <div className="flex items-center gap-2">
                  <input placeholder="Feedback / Reason..." value={feedback} onChange={e=>setFeedback(e.target.value)} className="border p-2 rounded flex-1 text-sm" />
                  <Button onClick={() => {
                    if(currentUser.role === "admin" && !projectCodes[p._id]) return alert("Please assign a Project Code before approving.");
                    handleAction(p._id, "approve");
                  }} className="bg-green-600 hover:bg-green-700">Approve</Button>
                  <Button onClick={() => handleAction(p._id, "reject")} variant="destructive">Reject</Button>
                </div>
              </div>
            )}"""
content = content.replace(old_inbox, new_inbox)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated WorkflowInbox")
