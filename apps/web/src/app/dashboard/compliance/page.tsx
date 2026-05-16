"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { ShieldAlert, Loader2, AlertTriangle, CheckCircle, Search } from "lucide-react";
import clsx from "clsx";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function ComplianceDashboard() {
  const { data: session } = useSession();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await axios.get(`${API_URL}/compliance/aml`, {
          headers: { Authorization: `Bearer ${(session as any)?.accessToken}` },
        });
        setAlerts(res.data.alerts);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (session) fetchAlerts();
  }, [session]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-zinc-500" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-red-500" />
          AML Monitoring Queue
        </h2>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search alert ID or reason..."
              className="w-full pl-9 pr-4 py-2 bg-black border border-zinc-700 rounded-lg text-sm text-white focus:ring-1 focus:ring-white transition-all"
            />
          </div>
        </div>

        {alerts.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 flex flex-col items-center">
            <CheckCircle className="w-12 h-12 mb-4 text-green-500 opacity-50" />
            <p>Queue is clear. No active AML alerts.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-6 flex items-start justify-between hover:bg-zinc-800/30 transition-colors">
                <div className="flex gap-4">
                  <div className="mt-1">
                    <AlertTriangle className={clsx(
                      "w-6 h-6",
                      alert.severity === 'CRITICAL' ? "text-red-500" : "text-orange-500"
                    )} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{alert.reason}</span>
                      <span className={clsx(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        alert.severity === 'CRITICAL' ? "bg-red-900/30 text-red-500" : "bg-orange-900/30 text-orange-500"
                      )}>
                        {alert.severity}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-zinc-800 text-zinc-300">
                        {alert.status}
                      </span>
                    </div>
                    <div className="text-sm text-zinc-400 space-y-1">
                      <p>Alert ID: <span className="font-mono text-xs">{alert.id}</span></p>
                      <p>Transaction ID: <span className="font-mono text-xs">{alert.transactionId}</span></p>
                      <p className="text-zinc-300">
                        Amount: ${alert.transaction.amount.toFixed(2)} {alert.transaction.currency}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button className="px-3 py-1.5 bg-white text-black text-xs font-medium rounded hover:bg-gray-200 transition-colors">
                    Investigate
                  </button>
                  <button className="px-3 py-1.5 bg-zinc-800 text-white text-xs font-medium rounded hover:bg-zinc-700 transition-colors">
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
