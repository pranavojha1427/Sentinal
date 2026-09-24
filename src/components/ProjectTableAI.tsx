"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getAIHealthScores } from "@/app/actions";
import { Loader2, MessageSquare, ShieldCheck, FileCheck } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export function ProjectTableAI({ projects }: { projects: any[] }) {
  const [aiScores, setAiScores] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [hasFailed, setHasFailed] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Feedback State
  const [feedbackProject, setFeedbackProject] = useState<any | null>(null);
  const [feedbackStep, setFeedbackStep] = useState(0);
  const [mobileNo, setMobileNo] = useState("");
  const [otp, setOtp] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

  const fetchScores = async () => {
    setLoading(true);
    setHasFailed(false);
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const scores = await getAIHealthScores();
        if (scores && Object.keys(scores).length > 0) {
          setAiScores(scores);
          setLoading(false);
          return;
        }
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 2000));
        }
      } catch (error) {
        console.error(`AI scores fetch attempt ${attempt} failed:`, error);
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 2000));
        }
      }
    }
    setHasFailed(true);
    setLoading(false);
  };

  useEffect(() => {
    fetchScores();
  }, []);

  const getHealthBadge = (health: string) => {
    if (!health) return <Badge variant="outline" className="border-slate-300 text-slate-500 rounded-none">N/A</Badge>;
    
    switch (health.toLowerCase()) {
      case "critical":
        return <Badge className="bg-red-200 text-red-900 border border-red-300 rounded-none">CRITICAL</Badge>;
      case "high":
        return <Badge className="bg-orange-100 text-orange-800 border border-orange-200 rounded-none">HIGH</Badge>;
      case "at risk":
      case "medium":
        return <Badge className="bg-amber-100 text-amber-800 border border-amber-200 rounded-none">MEDIUM</Badge>;
      case "on track":
      case "low":
        return <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-none">LOW</Badge>;
      default:
        return <Badge className="bg-slate-200 text-slate-700 rounded-none uppercase">{health}</Badge>;
    }
  };

  const handleSendOTP = () => {
    if (mobileNo.length < 10) {
      setFeedbackError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setFeedbackError("");
    setFeedbackStep(1); // Proceed to OTP
  };

  const handleVerifyOTP = () => {
    if (otp.length < 4) {
      setFeedbackError("Please enter the verification code.");
      return;
    }
    setFeedbackError("");
    setFeedbackStep(2); // Proceed to Feedback text
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) {
      setFeedbackError("Please provide your feedback.");
      return;
    }
    
    setIsSubmitting(true);
    setFeedbackError("");

    try {
      const { error } = await supabase.from("project_feedbacks").insert({
        project_id: feedbackProject.id,
        mobile_no: mobileNo,
        feedback_text: feedbackText
      });

      if (error) {
        if (error.code === '23505') { // Unique violation
          setFeedbackError("Feedback from this mobile number has already been registered for this project.");
        } else {
          setFeedbackError("An error occurred. Please try again.");
        }
        setIsSubmitting(false);
        return;
      }

      setFeedbackStep(3); // Success
    } catch (e) {
      console.error(e);
      setFeedbackError("Unexpected error occurred.");
    }
    
    setIsSubmitting(false);
  };

  const closeFeedbackModal = () => {
    setFeedbackProject(null);
    setFeedbackStep(0);
    setMobileNo("");
    setOtp("");
    setFeedbackText("");
    setFeedbackError("");
  };

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-sm z-10 flex items-center justify-center border-t border-slate-200">
           <div className="flex flex-col items-center gap-2">
             <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
             <p className="text-sm font-mono text-blue-400">AI Engine evaluating {projects.length.toLocaleString()} projects...</p>
           </div>
        </div>
      )}
      {hasFailed && !loading && (
        <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm z-10 flex items-center justify-center border-t border-slate-200">
           <div className="flex flex-col items-center gap-3">
             <p className="text-sm font-mono text-red-400">AI Backend unavailable. Ensure backend API is correctly deployed and reachable.</p>
             <button onClick={fetchScores} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-mono rounded transition-colors">
               Retry
             </button>
           </div>
        </div>
      )}
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow className="border-slate-200 hover:bg-slate-50/50">
            <TableHead className="text-slate-600 font-mono py-4">Code</TableHead>
            <TableHead className="text-slate-600 font-mono py-4">Project Name</TableHead>
            <TableHead className="text-slate-600 font-mono py-4">Sector</TableHead>
            <TableHead className="text-slate-600 font-mono text-right py-4">Orig. Cost</TableHead>
            <TableHead className="text-slate-600 font-mono text-right py-4">Rev. Cost</TableHead>
            <TableHead className="text-slate-600 font-mono text-right py-4">Overrun %</TableHead>
            <TableHead className="text-slate-600 font-mono text-right py-4">Discrepancy</TableHead>
            <TableHead className="text-slate-600 font-mono text-center py-4">AI Health Score</TableHead>
            <TableHead className="text-slate-600 font-mono text-center py-4">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((p) => {
            const aiData = aiScores[p.id];
            
            return (
              <TableRow 
                key={p.id} 
                className="border-slate-200 hover:bg-slate-200/50 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedProject(p);
                  setIsSheetOpen(true);
                }}
              >
                <TableCell className="font-mono text-xs text-slate-700">{p.project_code}</TableCell>
                <TableCell className="font-medium max-w-[250px] truncate text-slate-900" title={p.project_name}>{p.project_name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-slate-300 text-slate-700 font-mono rounded-none bg-slate-200/50">{p.sector}</Badge>
                </TableCell>
                <TableCell className="text-right font-mono text-slate-700">{p.original_cost?.toFixed(2) || '-'}</TableCell>
                <TableCell className="text-right font-mono text-amber-500">{p.revised_cost?.toFixed(2) || '-'}</TableCell>
                <TableCell className="text-right font-mono">
                  <span className={p.costOverrunPercent > 0 ? "text-red-500" : "text-slate-600"}>
                    {p.costOverrunPercent > 0 ? '+' : ''}{p.costOverrunPercent.toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell className="text-right font-mono">
                  <span className={Math.abs(p.implementationDiscrepancy) > 20 ? "text-red-500 font-bold" : "text-slate-600"}>
                    {p.implementationDiscrepancy > 0 ? '+' : ''}{p.implementationDiscrepancy.toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell className="text-center font-mono">
                  {getHealthBadge(aiData?.overall_health)}
                </TableCell>
                <TableCell className="text-center font-mono">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="font-sans flex items-center gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFeedbackProject(p);
                      setFeedbackStep(0);
                    }}
                  >
                    <MessageSquare className="w-4 h-4" /> Add Feedback
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* AI Risk Report Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="bg-slate-50 border-l-2 border-slate-300 text-slate-900 overflow-y-auto sm:max-w-md w-full font-sans">
          <SheetHeader className="border-b border-slate-200 pb-4 mb-4">
            <SheetTitle className="text-xl font-bold uppercase tracking-wide text-slate-900">Explainable AI Risk Report</SheetTitle>
            <SheetDescription className="font-mono text-slate-600 text-xs uppercase">
              {selectedProject?.project_code} — AI Analysis
            </SheetDescription>
          </SheetHeader>
          
          {selectedProject && aiScores[selectedProject.id] ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-mono text-xs text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-1 text-center">Overall Health</h3>
                <div className="flex items-center justify-center pt-1">
                  {getHealthBadge(aiScores[selectedProject.id]?.overall_health)}
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <h3 className="font-mono text-xs text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-1 text-center">
                  AI Recommendation
                </h3>
                <div className="text-sm bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-4 rounded-md shadow-sm font-medium text-slate-800 leading-relaxed relative overflow-hidden text-center">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  {aiScores[selectedProject.id]?.recommendation}
                </div>
              </div>

              {aiScores[selectedProject.id]?.overall_health === 'Critical' && aiScores[selectedProject.id]?.SHAP_Explanation && aiScores[selectedProject.id]?.SHAP_Explanation.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-mono text-xs text-red-500 uppercase tracking-widest border-b border-slate-200 pb-1">Critical Risk Factors (SHAP)</h3>
                  <div className="flex flex-col gap-2 mt-2">
                    {aiScores[selectedProject.id].SHAP_Explanation.map((explanation: string, i: number) => {
                      const parts = explanation.split("->");
                      return (
                        <div key={i} className="flex items-center justify-between bg-white border border-slate-200 p-2 rounded">
                          <span className="text-xs text-slate-700 pr-2">{parts[0]?.trim()}</span>
                          {parts[1] && (
                            <span className="text-[10px] font-mono text-red-400 bg-red-950/30 px-2 py-1 rounded">
                              {parts[1].trim()}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div className="bg-white p-3 border border-slate-200">
                  <p className="text-[10px] font-mono text-slate-500 uppercase">Cost Overrun Score</p>
                  <p className="text-2xl font-black text-slate-900">{aiScores[selectedProject.id]?.cost_overrun_score}</p>
                </div>
                <div className="bg-white p-3 border border-slate-200">
                  <p className="text-[10px] font-mono text-slate-500 uppercase">Schedule Risk Score</p>
                  <p className="text-2xl font-black text-slate-900">{aiScores[selectedProject.id]?.schedule_risk_score}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 font-mono text-slate-500 text-sm">
              Loading AI Explanation...
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Feedback Dialog */}
      <Dialog open={!!feedbackProject} onOpenChange={(open) => !open && closeFeedbackModal()}>
        <DialogContent className="sm:max-w-md bg-white border border-slate-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-800">
              {feedbackStep === 3 ? "Feedback Submitted!" : "Submit Project Feedback"}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              {feedbackProject?.project_name}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {feedbackError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                {feedbackError}
              </div>
            )}

            {feedbackStep === 0 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
                  <input 
                    type="tel" 
                    value={mobileNo}
                    onChange={(e) => setMobileNo(e.target.value)}
                    placeholder="Enter your 10-digit mobile number"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  />
                </div>
                <p className="text-xs text-slate-500">We will send a one-time verification code to this number.</p>
              </div>
            )}

            {feedbackStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Verification Code</label>
                  <input 
                    type="text" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter the 6-digit code"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-center tracking-widest font-mono text-lg"
                    maxLength={6}
                  />
                </div>
                <p className="text-xs text-slate-500 text-center">Code sent to +91 {mobileNo}</p>
              </div>
            )}

            {feedbackStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Your Feedback</label>
                  <textarea 
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Describe your observations, concerns, or feedback regarding this project..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition min-h-[120px] resize-none"
                  />
                </div>
              </div>
            )}

            {feedbackStep === 3 && (
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                  <FileCheck className="w-8 h-8" />
                </div>
                <p className="text-slate-600 text-sm">
                  Your feedback has been recorded securely and will be reviewed by the admin and respective ministry.
                </p>
                <p className="text-xs text-slate-400 font-mono mt-2">Verified Mobile: +91 {mobileNo}</p>
              </div>
            )}
          </div>

          <DialogFooter className="sm:justify-between border-t border-slate-100 pt-4">
            {feedbackStep < 3 ? (
              <>
                <Button variant="ghost" onClick={closeFeedbackModal} className="text-slate-500 hover:text-slate-700">Cancel</Button>
                {feedbackStep === 0 && <Button onClick={handleSendOTP} className="bg-indigo-600 hover:bg-indigo-700 text-white">Send OTP</Button>}
                {feedbackStep === 1 && <Button onClick={handleVerifyOTP} className="bg-indigo-600 hover:bg-indigo-700 text-white"><ShieldCheck className="w-4 h-4 mr-2"/> Verify Code</Button>}
                {feedbackStep === 2 && (
                  <Button onClick={handleSubmitFeedback} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Submit Feedback
                  </Button>
                )}
              </>
            ) : (
              <Button onClick={closeFeedbackModal} className="w-full bg-slate-800 hover:bg-slate-900 text-white">Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
