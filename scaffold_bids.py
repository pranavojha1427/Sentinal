import os

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

write_file("src/app/api/bids/route.ts", """import { NextResponse } from "next/server";
import clientPromise, { DB_NAME, BIDS_COLLECTION, PROPOSALS_COLLECTION } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const proposalId = url.searchParams.get("proposalId");
  
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const bids = await db.collection(BIDS_COLLECTION).find({ proposalId }).sort({ bidAmount: 1 }).toArray();

  if (session.role === "admin") {
    // Merge ranks from supabase
    const supabase = await createClient();
    const { data: rankData } = await supabase.from("agency_performance_rankings").select("agency, delay_frequency_pct, avg_cost_overrun_pct").order("delay_frequency_pct", { ascending: true });
    
    // Assign rank based on index in rankData
    bids.forEach(bid => {
      const matchIndex = rankData?.findIndex((r: any) => r.agency === bid.agencyName) ?? -1;
      bid.agencyRank = matchIndex !== -1 ? matchIndex + 1 : "Unranked";
      if(matchIndex !== -1) {
        bid.delayFreq = rankData![matchIndex].delay_frequency_pct;
        bid.costOverrun = rankData![matchIndex].avg_cost_overrun_pct;
      }
    });
  }

  return NextResponse.json(bids);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (session?.role !== "agency") return NextResponse.json({ error: "Only agencies can bid" }, { status: 403 });

  const body = await req.json();
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const proposal = await db.collection(PROPOSALS_COLLECTION).findOne({ _id: new ObjectId(body.proposalId) });
  if (!proposal || proposal.status !== "bidding_open") {
    return NextResponse.json({ error: "Bidding is not open for this proposal" }, { status: 400 });
  }

  const now = new Date().getTime();
  const opened = new Date(proposal.biddingStartedAt || proposal.createdAt).getTime();
  if (now > opened + 7 * 24 * 60 * 60 * 1000) {
    return NextResponse.json({ error: "Bidding window (1 week) has closed." }, { status: 400 });
  }

  const bid = {
    proposalId: body.proposalId,
    agencyId: session.id,
    agencyName: session.agency || session.name,
    bidAmount: Number(body.bidAmount),
    remarks: body.remarks,
    status: "submitted",
    submittedAt: new Date()
  };

  await db.collection(BIDS_COLLECTION).insertOne(bid);
  return NextResponse.json({ success: true });
}
""")

write_file("src/components/BiddingBoard.tsx", """
"use client";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";

export function BiddingBoard({ proposal, currentUser }: any) {
  const [bids, setBids] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const load = () => fetch(`/api/bids?proposalId=${proposal._id}`).then(r => r.json()).then(d => Array.isArray(d) ? setBids(d) : setBids([]));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!amount) return;
    setLoading(true);
    const res = await fetch("/api/bids", { method: "POST", body: JSON.stringify({ proposalId: proposal._id, bidAmount: amount, remarks }) });
    setLoading(false);
    const data = await res.json();
    if (data.error) alert(data.error);
    else { alert("Bid placed!"); load(); }
  };

  const award = async (bid: any) => {
    await fetch("/api/proposals", { method: "PUT", body: JSON.stringify({ id: proposal._id, action: "award_bid", feedback: `Bid awarded to ${bid.agencyName} for ?${bid.bidAmount} Cr.` }) });
    alert("Bid Awarded!");
    window.location.reload();
  };

  // Check 1 week rule purely for UI display
  const opened = new Date(proposal.biddingStartedAt || proposal.createdAt).getTime();
  const now = new Date().getTime();
  const msLeft = (opened + 7 * 24 * 60 * 60 * 1000) - now;
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
  const isClosed = msLeft <= 0;

  return (
    <div className="bg-slate-50 p-4 rounded border">
      <h4 className="font-bold mb-2">Bidding Platform</h4>
      <div className="text-sm mb-4">
        {isClosed ? <span className="text-red-600 font-bold">Bidding Closed</span> : <span className="text-green-600 font-bold">{daysLeft} days remaining</span>}
      </div>

      {currentUser.role === "admin" && (
        <div className="space-y-2">
          {bids.map((b, i) => (
            <div key={i} className="flex justify-between items-center bg-white p-3 border rounded">
              <div>
                <div className="font-semibold">{b.agencyName}</div>
                <div className="text-xs text-slate-500">{b.remarks}</div>
                {b.agencyRank && (
                  <div className="text-xs font-mono mt-1 bg-yellow-100 text-yellow-800 px-2 py-0.5 inline-block rounded">
                    Rank: #{b.agencyRank} | Delay: {b.delayFreq}%
                  </div>
                )}
              </div>
              <div className="text-right flex items-center gap-4">
                <div className="font-bold text-lg">?{b.bidAmount} Cr</div>
                {!isClosed && <Button size="sm" onClick={() => award(b)}>Award</Button>}
              </div>
            </div>
          ))}
          {bids.length === 0 && <p className="text-sm text-slate-500">No bids yet.</p>}
        </div>
      )}

      {currentUser.role === "agency" && (
        <div className="flex gap-2">
          <input type="number" placeholder="Bid Amount (Cr)" value={amount} onChange={e=>setAmount(e.target.value)} className="border p-2 rounded" />
          <input placeholder="Remarks..." value={remarks} onChange={e=>setRemarks(e.target.value)} className="border p-2 rounded flex-1" />
          <Button disabled={isClosed || loading} onClick={submit}>Place Bid</Button>
        </div>
      )}

      {currentUser.role === "ministry" && (
         <div className="text-sm text-slate-500">{bids.length} bids placed so far. Awaiting Admin decision.</div>
      )}
    </div>
  );
}
""")
print("Bids API and BiddingBoard generated")
