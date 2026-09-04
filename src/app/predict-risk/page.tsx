"use client";

import { useState } from "react";

export default function PredictRiskPage() {
  const [formData, setFormData] = useState({
    original_cost: "",
    revised_cost: "",
    expenditure: "",
    physical_progress: "",
  });

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/predict-risk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          original_cost: parseFloat(formData.original_cost) || 0,
          revised_cost: parseFloat(formData.revised_cost) || 0,
          expenditure: parseFloat(formData.expenditure) || 0,
          physical_progress: parseFloat(formData.physical_progress) || 0,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch prediction");
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 mt-10 bg-white rounded-lg shadow-md border border-gray-200">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Project Risk Predictor</h1>
      <p className="text-gray-600 mb-8">
        Enter project financial and physical progress details (in INR Crores) to evaluate risk.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Original Cost (INR Crores)
            </label>
            <input
              type="number"
              step="0.01"
              name="original_cost"
              required
              value={formData.original_cost}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. 1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Revised Cost (INR Crores)
            </label>
            <input
              type="number"
              step="0.01"
              name="revised_cost"
              required
              value={formData.revised_cost}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. 1200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expenditure (INR Crores)
            </label>
            <input
              type="number"
              step="0.01"
              name="expenditure"
              required
              value={formData.expenditure}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. 400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Physical Progress (%)
            </label>
            <input
              type="number"
              step="0.01"
              name="physical_progress"
              required
              min="0"
              max="100"
              value={formData.physical_progress}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. 30"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:bg-blue-300"
          >
            {loading ? "Analyzing..." : "Evaluate Risk"}
          </button>
        </form>

        <div className="bg-gray-50 p-6 rounded-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Results</h2>
          {error && <p className="text-red-500">{error}</p>}
          
          {!result && !error && (
            <p className="text-gray-500 italic">Submit the form to see the risk prediction.</p>
          )}

          {result && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Overall Health</p>
                <p
                  className={`text-lg font-bold ${
                    result.overall_health === "Critical"
                      ? "text-red-600"
                      : result.overall_health === "At Risk"
                      ? "text-amber-500"
                      : "text-green-600"
                  }`}
                >
                  {result.overall_health}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Recommendation</p>
                <p className="font-medium text-gray-800">{result.recommendation}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500">Cost Overrun Score</p>
                  <p className="font-semibold text-gray-800">{result.cost_overrun_score}/100</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Schedule Risk Score</p>
                  <p className="font-semibold text-gray-800">{result.schedule_risk_score}/100</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Cost Escalation</p>
                  <p className="font-semibold text-gray-800">₹{result.cost_escalation_crores} Cr</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Impl. Discrepancy</p>
                  <p className="font-semibold text-gray-800">{result.implementation_discrepancy_percentage}%</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
