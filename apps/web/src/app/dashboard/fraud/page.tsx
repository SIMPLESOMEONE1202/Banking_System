"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Activity, Loader2, AlertCircle, TrendingUp, Search } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function FraudDashboard() {
  const { data: session } = useSession();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get(`${API_URL}/compliance/fraud`, {
          headers: { Authorization: `Bearer ${(session as any)?.accessToken}` },
        });
        setReports(res.data.reports);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (session) fetchReports();
  }, [session]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-zinc-500" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Activity className="w-6 h-6 text-purple-500" />
          Fraud Analytics & Heatmap
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mock Heatmap/Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-sm font-medium text-zinc-400 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Real-time Risk Index
            </h3>
            <div className="text-4xl font-bold text-white mb-2">
              {reports.length > 0 ? (reports[0].score > 80 ? "HIGH" : "ELEVATED") : "LOW"}
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 via-orange-500 to-red-500" 
                style={{ width: reports.length > 0 ? `${reports[0].score}%` : '10%' }}
              />
            </div>
            <p className="text-xs text-zinc-500 mt-2">Based on latest transaction volume</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-sm font-medium text-zinc-400 mb-4">Risk Factors Detected</h3>
            <ul className="space-y-3">
              <li className="flex items-center justify-between text-sm">
                <span>Geo-velocity mismatch</span>
                <span className="text-red-400">High</span>
              </li>
              <li className="flex items-center justify-between text-sm">
                <span>Unusual volume</span>
                <span className="text-orange-400">Medium</span>
              </li>
              <li className="flex items-center justify-between text-sm">
                <span>New device login</span>
                <span className="text-green-400">Low</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Fraud Reports List */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-zinc-800">
            <h3 className="font-medium text-white">Live AI Fraud Detections</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {reports.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 py-12">
                <Activity className="w-12 h-12 mb-4 opacity-20" />
                <p>No active fraud reports detected.</p>
              </div>
            ) : (
              reports.map((report) => {
                const factors = JSON.parse(report.factors);
                return (
                  <div key={report.id} className="bg-black border border-zinc-800 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <AlertCircle className="w-4 h-4 text-purple-500" />
                          <span className="font-semibold text-sm">Score: {report.score.toFixed(0)}/100</span>
                        </div>
                        <p className="text-xs text-zinc-500">TxID: {report.transactionId}</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-zinc-800 text-zinc-300">
                        {report.status}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-zinc-300 mb-1">Detected Factors:</p>
                      <div className="flex flex-wrap gap-2">
                        {factors.map((f: string, i: number) => (
                          <span key={i} className="text-xs px-2 py-1 bg-zinc-800 text-zinc-300 rounded border border-zinc-700">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                      <button className="px-3 py-1 bg-zinc-800 text-white text-xs font-medium rounded hover:bg-zinc-700 transition-colors">
                        View Details
                      </button>
                      <button className="px-3 py-1 bg-white text-black text-xs font-medium rounded hover:bg-gray-200 transition-colors">
                        Freeze Account
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
