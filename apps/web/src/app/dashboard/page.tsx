"use client";

import { useSession } from "next-auth/react";
import { Activity, CreditCard, Shield, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function DashboardOverview() {
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 text-zinc-400 mb-4">
            <CreditCard className="w-5 h-5" />
            <h2 className="font-medium text-sm">Total Balance</h2>
          </div>
          <div className="text-3xl font-semibold">$0.00</div>
          <div className="mt-4 flex items-center text-sm text-green-500">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            0.0% from last month
          </div>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 text-zinc-400 mb-4">
            <Activity className="w-5 h-5" />
            <h2 className="font-medium text-sm">Monthly Spend</h2>
          </div>
          <div className="text-3xl font-semibold">$0.00</div>
          <div className="mt-4 flex items-center text-sm text-zinc-500">
            <ArrowDownRight className="w-4 h-4 mr-1" />
            0.0% from last month
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 text-zinc-400 mb-4">
            <Shield className="w-5 h-5" />
            <h2 className="font-medium text-sm">Compliance Status</h2>
          </div>
          <div className="text-3xl font-semibold text-green-500">Verified</div>
          <div className="mt-4 flex items-center text-sm text-zinc-500">
            KYC completed successfully
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
          <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
            <Activity className="w-12 h-12 mb-4 opacity-20" />
            <p>No recent transactions</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Active Cards</h2>
          <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
            <CreditCard className="w-12 h-12 mb-4 opacity-20" />
            <p>No active cards found</p>
            <button className="mt-4 px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
              Issue Virtual Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
