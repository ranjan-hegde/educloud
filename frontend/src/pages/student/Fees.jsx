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
    <div>
      <PageHeader
        title="Fees"
        subtitle={`Fee details for ${structure.semester} — Academic Year ${structure.academicYear}`}
        actions={
          structure.dueAmount > 0 && (
            <button className="btn-primary" onClick={() => { setAmount(structure.dueAmount); setPayOpen(true); }}>
              <CreditCard size={15} /> Pay Now
            </button>
          )
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardCard icon={Wallet} label="Total Fee" value={`₹${structure.totalFee.toLocaleString()}`} tone="navy" />
        <DashboardCard icon={CheckCircle2} label="Paid" value={`₹${structure.paidAmount.toLocaleString()}`} tone="teal" />
        <DashboardCard icon={AlertCircle} label="Due Amount" value={`₹${structure.dueAmount.toLocaleString()}`} tone="coral" />
        <DashboardCard icon={Receipt} label="Due Date" value={structure.dueDate} tone="amber" />
      </div>

      {structure.dueAmount > 0 && (
        <div className="card p-4 mb-6 flex items-center justify-between bg-accent-coral/5 border-accent-coral/20">
          <div className="flex items-center gap-3">
            <AlertCircle size={18} className="text-accent-coral" />
            <p className="text-sm text-navy-700">
              You have a pending balance of <span className="font-semibold">₹{structure.dueAmount.toLocaleString()}</span>, due by {structure.dueDate}.
            </p>
          </div>
          <button className="btn-primary !py-2" onClick={() => { setAmount(structure.dueAmount); setPayOpen(true); }}>Pay Now</button>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <p className="font-semibold text-navy-900 mb-4">Fee Breakdown</p>
          <div className="divide-y divide-surface-border">
            {structure.breakdown.map((b) => (
              <div key={b.head} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-navy-600">{b.head}</span>
                <span className="font-medium text-navy-800">₹{b.amount.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex items-center justify-between py-2.5 text-sm font-semibold">
              <span className="text-navy-900">Total</span>
              <span className="text-navy-900">₹{structure.totalFee.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <p className="font-semibold text-navy-900 mb-4">Payment Progress</p>
          <div className="h-3 w-full rounded-full bg-navy-50 overflow-hidden">
            <div
              className="h-full bg-accent-teal rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.round((structure.paidAmount / structure.totalFee) * 100))}%` }}
            />
          </div>
          <p className="text-xs text-navy-400 mt-2">
            {Math.round((structure.paidAmount / structure.totalFee) * 100)}% paid — ₹{structure.paidAmount.toLocaleString()} of ₹{structure.totalFee.toLocaleString()}
          </p>
          <p className="text-xs text-navy-400 mt-4">
            Payments are simulated in this frontend phase. A real payment gateway (Razorpay/Stripe) will be connected via the backend later.
          </p>
        </div>
      </div>

      <div className="card p-5">
        <p className="font-semibold text-navy-900 mb-4">Payment History &amp; Receipts</p>
        {loading || !history ? (
          <Loading />
        ) : (
          <DataTable
            columns={["Receipt ID", "Date", "Description", "Amount", "Mode", "Status", ""]}
            data={history}
            renderRow={(h) => (
              <>
                <td className="px-3 py-3 font-medium text-navy-800">{h.id}</td>
                <td className="px-3 py-3 text-navy-500">{h.date}</td>
                <td className="px-3 py-3 text-navy-600">{h.description}</td>
                <td className="px-3 py-3 text-navy-700 font-medium">₹{h.amount.toLocaleString()}</td>
                <td className="px-3 py-3 text-navy-500">{h.mode}</td>
                <td className="px-3 py-3"><span className="badge-green">{h.status}</span></td>
                <td className="px-3 py-3">
                  <button
                    className="btn-ghost !py-1.5 !px-2"
                    onClick={() => toast.info(`Receipt ${h.id} download will be enabled once the backend is connected.`)}
                  >
                    <Download size={14} /> Receipt
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
