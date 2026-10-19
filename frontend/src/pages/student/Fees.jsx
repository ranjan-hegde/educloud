import { useState, useEffect } from "react";
import { Wallet, CheckCircle2, AlertCircle, Receipt, Download, CreditCard } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import DashboardCard from "../../components/DashboardCard";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import Loading from "../../components/Loading";
import { feeStructure } from "../../data/mockData";
import { useToast } from "../../context/ToastContext";
import * as feeService from "../../services/feeService";
import { usePersistentState } from "../../hooks/usePersistentState";

export default function StudentFees() {
  const [persistentStructure, setPersistentStructure] = usePersistentState("feeStructure");
  const structure = persistentStructure || feeStructure;
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payOpen, setPayOpen] = useState(false);
  const [amount, setAmount] = useState(structure.dueAmount);
  const [method, setMethod] = useState("UPI");
  const [paying, setPaying] = useState(false);
  const toast = useToast();

  useEffect(() => {
    feeService.getPaymentHistory().then((h) => { setHistory(h); setLoading(false); });
  }, []);

  async function submitPayment() {
    if (!amount || amount <= 0) { toast.error("Enter a valid amount."); return; }
    if (amount > structure.dueAmount) { toast.error("Amount cannot exceed the due amount."); return; }
    setPaying(true);
    const res = await feeService.payFee(amount);
    setPaying(false);
    setPayOpen(false);
    setPersistentStructure((s) => {
      const base = s || feeStructure;
      return { ...base, paidAmount: (base.paidAmount || 0) + amount, dueAmount: Math.max(0, (base.dueAmount || 0) - amount) };
    });
    setHistory((h) => [
      { id: res.receiptId, date: res.date, description: `${structure.semester} — Payment`, amount, mode: `Online (${method})`, status: "Paid" },
      ...h,
    ]);
    toast.success(`Payment successful. Receipt ${res.receiptId} generated.`);
  }

  return (
    <div className="liquid-glass-studio rounded-3xl overflow-hidden animate-fade-in text-slate-800 dark:text-slate-100 mb-8">
      {/* 1. Header */}
      <div className="p-6 sm:p-7 soft-line-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
              Financial Account
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight mt-1.5">
              Tuition &amp; Fees
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Fee details for {structure.semester} — Academic Year {structure.academicYear}
            </p>
          </div>

          {structure.dueAmount > 0 && (
            <button
              className="btn-primary inline-flex items-center gap-2 macos-bouncy"
              onClick={() => { setAmount(structure.dueAmount); setPayOpen(true); }}
            >
              <CreditCard size={15} /> Pay Balance
            </button>
          )}
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 soft-line-b divide-y sm:divide-y-0 sm:divide-x divide-black/5 dark:divide-white/10">
        <div className="p-4 sm:p-5 flex items-center justify-between group hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Fee</p>
            <p className="mt-1 text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight">₹{structure.totalFee.toLocaleString()}</p>
          </div>
          <div className="h-8 w-8 rounded-xl flex items-center justify-center border border-white/40 dark:border-white/10 text-blue-500 bg-blue-500/10">
            <Wallet size={16} />
          </div>
        </div>

        <div className="p-4 sm:p-5 flex items-center justify-between group hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Paid Amount</p>
            <p className="mt-1 text-2xl font-display font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">₹{structure.paidAmount.toLocaleString()}</p>
          </div>
          <div className="h-8 w-8 rounded-xl flex items-center justify-center border border-white/40 dark:border-white/10 text-emerald-500 bg-emerald-500/10">
            <CheckCircle2 size={16} />
          </div>
        </div>

        <div className="p-4 sm:p-5 flex items-center justify-between group hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Due Amount</p>
            <p className="mt-1 text-2xl font-display font-bold text-rose-500 dark:text-rose-400 tracking-tight">₹{structure.dueAmount.toLocaleString()}</p>
          </div>
          <div className="h-8 w-8 rounded-xl flex items-center justify-center border border-white/40 dark:border-white/10 text-rose-500 bg-rose-500/10">
            <AlertCircle size={16} />
          </div>
        </div>

        <div className="p-4 sm:p-5 flex items-center justify-between group hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Due Date</p>
            <p className="mt-1 text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight">{structure.dueDate}</p>
          </div>
          <div className="h-8 w-8 rounded-xl flex items-center justify-center border border-white/40 dark:border-white/10 text-amber-500 bg-amber-500/10">
            <Receipt size={16} />
          </div>
        </div>
      </div>

      {/* 3. Pending Alert Banner (if applicable) */}
      {structure.dueAmount > 0 && (
        <div className="p-4 sm:p-5 soft-line-b bg-rose-500/10 border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-rose-500 shrink-0" />
            <p className="text-xs sm:text-sm text-rose-900 dark:text-rose-200">
              You have an outstanding balance of <span className="font-bold">₹{structure.dueAmount.toLocaleString()}</span>, due on or before <span className="font-bold">{structure.dueDate}</span>.
            </p>
          </div>
          <button
            className="btn-primary !py-1.5 !px-3 text-xs macos-bouncy self-start sm:self-center"
            onClick={() => { setAmount(structure.dueAmount); setPayOpen(true); }}
          >
            Pay Now
          </button>
        </div>
      )}

      {/* 4. Fee Breakdown & Payment Progress */}
      <div className="grid lg:grid-cols-2 soft-line-b">
        <div className="p-6 lg:soft-line-r">
          <p className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight mb-4">Fee Breakdown</p>
          <div className="divide-y divide-black/5 dark:divide-white/10 text-sm">
            {structure.breakdown.map((b) => (
              <div key={b.head} className="flex items-center justify-between py-2.5">
                <span className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">{b.head}</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 text-xs sm:text-sm">₹{b.amount.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex items-center justify-between py-2.5 font-semibold">
              <span className="text-slate-900 dark:text-white">Total</span>
              <span className="text-slate-900 dark:text-white">₹{structure.totalFee.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight mb-4">Payment Progress</p>
          <div className="h-3 w-full rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.round((structure.paidAmount / structure.totalFee) * 100))}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 font-medium">
            {Math.round((structure.paidAmount / structure.totalFee) * 100)}% paid — ₹{structure.paidAmount.toLocaleString()} of ₹{structure.totalFee.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
            Payments are simulated in this frontend phase. A real payment gateway (Razorpay/Stripe) will be connected via the backend later.
          </p>
        </div>
      </div>

      {/* 5. Payment History & Receipts */}
      <div className="p-6">
        <p className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight mb-4">Payment History &amp; Receipts</p>
        {loading || !history ? (
          <Loading />
        ) : (
          <DataTable
            columns={["Receipt ID", "Date", "Description", "Amount", "Mode", "Status", ""]}
            data={history}
            renderRow={(h) => (
              <>
                <td className="px-3 py-3 font-medium text-slate-800 dark:text-slate-200">{h.id}</td>
                <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{h.date}</td>
                <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{h.description}</td>
                <td className="px-3 py-3 text-slate-800 dark:text-slate-200 font-medium">₹{h.amount.toLocaleString()}</td>
                <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{h.mode}</td>
                <td className="px-3 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {h.status}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <button
                    className="btn-ghost !py-1 !px-2 text-xs inline-flex items-center gap-1.5 macos-bouncy"
                    onClick={() => toast.info(`Receipt ${h.id} download will be enabled once the backend is connected.`)}
                  >
                    <Download size={13} /> Receipt
                  </button>
                </td>
              </>
            )}
          />
        )}
      </div>

      <Modal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        title="Pay Fees"
        footer={<><button className="btn-secondary" onClick={() => setPayOpen(false)}>Cancel</button><button className="btn-primary" onClick={submitPayment} disabled={paying}>{paying ? "Processing..." : `Pay ₹${Number(amount || 0).toLocaleString()}`}</button></>}
      >
        <div className="space-y-4">
          <div>
            <label className="label">Amount (₹)</label>
            <input type="number" className="input" value={amount} max={structure.dueAmount} onChange={(e) => setAmount(Number(e.target.value))} />
            <p className="text-xs text-navy-400 mt-1">Maximum payable: ₹{structure.dueAmount.toLocaleString()}</p>
          </div>
          <div>
            <label className="label">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {["UPI", "Card", "Net Banking"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`py-2 rounded-xl text-sm font-medium border transition-colors ${method === m ? "border-navy-800 bg-navy-800 text-white" : "border-surface-border text-navy-600 hover:bg-navy-50"}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-navy-400">This is a mock payment flow for the frontend phase — no real transaction will occur.</p>
        </div>
      </Modal>
    </div>
  );
}
