"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Plus, Wallet, Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function AccountsPage() {
  const { data: session } = useSession();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchAccounts = async () => {
    try {
      const res = await axios.get(`${API_URL}/accounts`, {
        headers: { Authorization: `Bearer ${(session as any)?.accessToken}` },
      });
      setAccounts(res.data.accounts);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchAccounts();
    }
  }, [session]);

  const createAccount = async () => {
    setCreating(true);
    try {
      await axios.post(
        `${API_URL}/accounts`,
        { type: "SAVINGS", currency: "USD" },
        { headers: { Authorization: `Bearer ${(session as any)?.accessToken}` } }
      );
      fetchAccounts();
    } catch (error) {
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-zinc-500" /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Accounts</h2>
        <button
          onClick={createAccount}
          disabled={creating}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Open New Account
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center text-zinc-500 flex flex-col items-center">
          <Wallet className="w-12 h-12 mb-4 opacity-20" />
          <p>You don't have any accounts yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((acc) => (
            <div key={acc.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm hover:border-zinc-700 transition-colors cursor-pointer relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-700 to-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-sm text-zinc-400 font-medium">{acc.type}</p>
                  <p className="text-xl tracking-widest mt-1">
                    **** {acc.accountNumber.slice(-4)}
                  </p>
                </div>
                <div className="bg-zinc-800 px-2 py-1 rounded text-xs font-semibold text-zinc-300">
                  {acc.currency}
                </div>
              </div>
              <div>
                <p className="text-sm text-zinc-400 mb-1">Available Balance</p>
                <p className="text-3xl font-semibold">${acc.balance.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
