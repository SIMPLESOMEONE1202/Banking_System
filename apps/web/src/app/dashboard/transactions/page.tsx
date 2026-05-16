"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Loader2, Send, ArrowUpRight, ArrowDownRight, Search, AlertCircle } from "lucide-react";
import clsx from "clsx";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function TransactionsPage() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTransferring, setIsTransferring] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Transfer Form State
  const [sourceAccountId, setSourceAccountId] = useState("");
  const [targetAccountId, setTargetAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const [txRes, accRes] = await Promise.all([
        axios.get(`${API_URL}/transactions`, {
          headers: { Authorization: `Bearer ${(session as any)?.accessToken}` },
        }),
        axios.get(`${API_URL}/accounts`, {
          headers: { Authorization: `Bearer ${(session as any)?.accessToken}` },
        }),
      ]);
      setTransactions(txRes.data.transactions);
      setAccounts(accRes.data.accounts);
      if (accRes.data.accounts.length > 0) {
        setSourceAccountId(accRes.data.accounts[0].id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchData();
  }, [session]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTransferring(true);
    setError("");

    try {
      await axios.post(
        `${API_URL}/transactions`,
        {
          sourceAccountId,
          targetAccountId: targetAccountId || undefined,
          amount: parseFloat(amount),
          description,
        },
        { headers: { Authorization: `Bearer ${(session as any)?.accessToken}` } }
      );
      
      setShowTransferModal(false);
      setAmount("");
      setDescription("");
      setTargetAccountId("");
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || "Transfer failed");
    } finally {
      setIsTransferring(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-zinc-500" /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Transactions</h2>
        <button
          onClick={() => setShowTransferModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Send className="w-4 h-4" />
          Send Money
        </button>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">Transfer Funds</h3>
            <form onSubmit={handleTransfer} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 text-sm">
                  {typeof error === 'string' ? error : JSON.stringify(error)}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">From Account</label>
                <select 
                  value={sourceAccountId}
                  onChange={(e) => setSourceAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg text-white"
                  required
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.type} - ****{acc.accountNumber.slice(-4)} (${acc.balance.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">To Account (Optional if external)</label>
                <input 
                  type="text"
                  placeholder="Target Account ID"
                  value={targetAccountId}
                  onChange={(e) => setTargetAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Amount (USD)</label>
                <input 
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg text-white text-2xl font-semibold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Description</label>
                <input 
                  type="text"
                  placeholder="What is this for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg text-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="flex-1 px-4 py-2 bg-zinc-800 text-white font-medium rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTransferring}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {isTransferring ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search transactions..."
              className="w-full pl-9 pr-4 py-2 bg-black border border-zinc-700 rounded-lg text-sm text-white focus:ring-1 focus:ring-white transition-all"
            />
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 flex flex-col items-center">
            <ArrowUpRight className="w-12 h-12 mb-4 opacity-20" />
            <p>No transactions found.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {transactions.map((tx) => {
              const isOutgoing = accounts.some(acc => acc.id === tx.sourceAccountId);
              const isFlagged = tx.status === 'FLAGGED';
              
              return (
                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={clsx(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      isOutgoing ? "bg-zinc-800 text-zinc-300" : "bg-green-900/30 text-green-500",
                      isFlagged && "bg-red-900/30 text-red-500"
                    )}>
                      {isFlagged ? <AlertCircle className="w-5 h-5" /> : isOutgoing ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium">{tx.description || (isOutgoing ? "Outgoing Transfer" : "Incoming Transfer")}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {new Date(tx.createdAt).toLocaleDateString()} • {tx.status}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={clsx(
                      "font-semibold",
                      isOutgoing ? "text-white" : "text-green-500"
                    )}>
                      {isOutgoing ? "-" : "+"}${tx.amount.toFixed(2)}
                    </p>
                    {tx.aiRiskScore > 0 && (
                      <p className={clsx("text-xs mt-0.5", isFlagged ? "text-red-400" : "text-zinc-500")}>
                        Risk Score: {tx.aiRiskScore.toFixed(0)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
