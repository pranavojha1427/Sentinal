import os

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

write_file("src/components/WorkflowInbox.tsx", """
"use client";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { BiddingBoard } from "./BiddingBoard";

export function WorkflowInbox({ currentUser }: any) {
  const [proposals, setProposals] = useState<any[]>([]);
  const [feedback, setFeedback] = useState("");
  const [activeTab, setActiveTab] = useState("inbox");

  const load = () => fetch("/api/proposals").then(r => r.json()).then(d => Array.isArray(d) ? setProposals(d) : setProposals([]));
  useEffect(() => { load(); }, []);

  const handleAction = async (id: string, action: string) => {
    if ((action === "reject" || action === "feedback") && !feedback) return alert("Please provide feedback/reason.");
    await fetch("/api/proposals", { method: "PUT", body: JSON.stringify({ id, action, feedback }) });
    setFeedback(""); load();
  };

  const pending = proposals.filter(p => {
    if(currentUser.role === "admin") return p.status === "pending_admin";
    if(currentUser.role === "ministry") return p.status === "pending_ministry" && p.ministry === currentUser.ministry;
    return false;
  });

  const allRelevant = proposals;

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b pb-2">
        {(currentUser.role === "admin" || currentUser.role === "ministry") && <button className={`font-semibold ${activeTab==="inbox" ? "text-blue-600" : "text-slate-500"}`} onClick={() => setActiveTab("inbox")}>Inbox ({pending.length})</button>}
        <button className={`font-semibold ${activeTab==="all" ? "text-blue-600" : "text-slate-500"}`} onClick={() => setActiveTab("all")}>All Proposals / Bidding</button>
      </div>

      <div className="flex flex-col gap-4">
        {(activeTab === "inbox" ? pending : allRelevant).map(p => (
          <div key={p._id} className="border p-4 bg-white rounded shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-lg">{p.project_name}</h4>
                  <span className="px-2 py-0.5 text-xs font-mono uppercase bg-slate-100 rounded">{p.status.replace(/_/g, ' ')}</span>
                </div>
                <p className="text-sm text-slate-600">Proposed by: {p.creatorName} ({p.creatorRole}) - {p.ministry}</p>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">?{p.expected_expenditure} Cr</div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-3 rounded text-sm text-slate-700 whitespace-pre-wrap">{p.details}</div>

            {p.feedback && p.feedback.length > 0 && (
              <div className="bg-yellow-50 p-3 rounded text-sm text-yellow-900 border border-yellow-100">
                <div className="font-semibold mb-1">Feedback History:</div>
                {p.feedback.map((f:any, i:number) => <div key={i}><strong>{f.author}:</strong> {f.text}</div>)}
              </div>
            )}

            {activeTab === "inbox" && (
              <div className="flex items-center gap-2 mt-2">
                <input placeholder="Feedback / Reason..." value={feedback} onChange={e=>setFeedback(e.target.value)} className="border p-2 rounded flex-1 text-sm" />
                <Button onClick={() => handleAction(p._id, "approve")} className="bg-green-600 hover:bg-green-700">Approve</Button>
                <Button onClick={() => handleAction(p._id, "reject")} variant="destructive">Reject</Button>
              </div>
            )}

            {activeTab === "all" && p.status === "bidding_open" && (
              <div className="mt-4 border-t pt-4">
                <BiddingBoard proposal={p} currentUser={currentUser} />
              </div>
            )}
          </div>
        ))}
        {(activeTab === "inbox" ? pending : allRelevant).length === 0 && <p className="text-slate-500">No proposals found.</p>}
      </div>
    </div>
  );
}
""")
print("Inbox generated")
