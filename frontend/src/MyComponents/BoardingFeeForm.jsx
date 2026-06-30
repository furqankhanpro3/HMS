import { useState, useRef, useEffect } from "react";
import { useHostel } from "@/context/useHostel";
import { toast } from "sonner";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const YEARS = ["2024", "2025", "2026", "2027", "2028", "2029", "2030", "2031", "2032", "2033", "2034", "2035"];

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "mobile_wallet", label: "Mobile Wallet" },
];

const WALLET_PROVIDERS = [
  { value: "easypaisa", label: "Easypaisa" },
  { value: "jazzcash", label: "JazzCash" },
  { value: "nayapay", label: "NayaPay" },
  { value: "sadapay", label: "SadaPay" },
  { value: "upaisa", label: "Upaisa" },
  { value: "other", label: "Other" },
];

const today = () => new Date().toISOString().split("T")[0];

const formatMoney = (value) => {
  if (value === undefined || value === null || value === "") return "0";
  return Number(value).toLocaleString();
};

const statusStyle = (s) => ({
  paid: { bg: "#e6f4ea", color: "#16A34A", border: "#b2dfbc" },
  partial: { bg: "#fff8e1", color: "#7a5c00", border: "#ffe082" },
  pending: { bg: "#fdecea", color: "#8b1a1a", border: "#f5c6c6" },
}[s] || {});

export default function BoardingFeeForm({ onSuccess }) {
  const { students, searchFeeStudent, getStudentFeeInfo, recordFeePayment } = useHostel();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDrop, setShowDrop] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feeInfo, setFeeInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    boardingNo: "",
    boarderName: "",
    fatherName: "",
    contact: "",
    feeMonth: "",
    feeYear: "",
    amount: "",
    paymentMethod: "",
    transactionNo: "",
    walletProvider: "",
    receivingDate: today(),
    remarks: "",
  });

  const [errors, setErrors] = useState({});
  const dropRef = useRef(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setShowDrop(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch fee info when student or period changes
  useEffect(() => {
    const fetchFeeInfo = async () => {
      if (!selectedStudent?.boardingNumber) return;
      setLoading(true);
      const result = await getStudentFeeInfo(selectedStudent.boardingNumber);
      if (result?.success) {
        setFeeInfo(result.data);
      }
      setLoading(false);
    };
    fetchFeeInfo();
  }, [selectedStudent?.boardingNumber]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    setForm((f) => ({
      ...f,
      boardingNo: val,
      boarderName: "",
      fatherName: "",
      contact: "",
    }));
    setSelectedStudent(null);
    setFeeInfo(null);

    if (!val.trim()) {
      setSuggestions([]);
      setShowDrop(false);
      return;
    }

    const q = val.trim().toLowerCase();
    const matches = students.filter((s) => {
      const bn = s.boardingNumber?.toLowerCase() || "";
      const name = s.user?.name?.toLowerCase() || "";
      return bn.includes(q) || name.includes(q);
    });

    setSuggestions(matches);
    setShowDrop(true);
  };

  const handleSelectSuggestion = (student) => {
    selectStudent(student);
    setSuggestions([]);
    setShowDrop(false);
  };

  const selectStudent = async (student) => {
    setQuery(student.boardingNumber);
    setSelectedStudent(student);
    setForm((f) => ({
      ...f,
      boardingNo: student.boardingNumber,
      boarderName: student.user?.name || student.name || "",
      fatherName: student.fatherName || "",
      contact: student.contact || student.contactNumber || "",
    }));

    setLoading(true);
    const result = await getStudentFeeInfo(student.boardingNumber);
    if (result?.success) {
      setFeeInfo(result.data);
    }
    setLoading(false);
  };

  const currentYear = new Date().getFullYear().toString();
  const currentMonthIndex = new Date().getMonth();
  const currentMonth = MONTHS[currentMonthIndex];

  const monthSummary = feeInfo?.monthlySummary?.find(
    (m) => m.feeMonth === form.feeMonth && m.feeYear.toString() === form.feeYear
  );

  const decidedFee = feeInfo?.decidedFee || 0;
  const paidForMonth = monthSummary?.receivedAmount || 0;
  const dueForMonth = monthSummary
    ? monthSummary.balanceAmount
    : decidedFee;

  // Check previous months dues (from admission date up to, but not including, selected month)
  const previousMonthsDue = [];
  if (form.feeMonth && form.feeYear && feeInfo?.student?.admissionDate) {
    const selectedIndex = MONTHS.indexOf(form.feeMonth);
    const selectedYear = Number(form.feeYear);
    const admission = new Date(feeInfo.student.admissionDate);
    const startYear = admission.getFullYear();
    const startMonth = admission.getMonth(); // 0-based

    let year = startYear;
    let month = startMonth;
    while (year < selectedYear || (year === selectedYear && month < selectedIndex)) {
      const monthName = MONTHS[month];
      const summary = feeInfo.monthlySummary.find(
        (m) => m.feeMonth === monthName && Number(m.feeYear) === year
      );
      const balance = summary ? summary.balanceAmount : decidedFee;
      if (balance > 0) {
        previousMonthsDue.push({ feeMonth: monthName, feeYear: year, balanceAmount: balance });
      }
      month += 1;
      if (month > 11) {
        month = 0;
        year += 1;
      }
    }
  }

  const totalArrears = previousMonthsDue.reduce((sum, item) => sum + item.balanceAmount, 0);
  const totalOutstanding = dueForMonth + totalArrears;
  const hasPreviousDues = previousMonthsDue.length > 0;

  const validate = () => {
    const e = {};
    if (!form.boardingNo.trim()) e.boardingNo = true;
    if (!form.feeMonth) e.feeMonth = true;
    if (!form.feeYear) e.feeYear = true;
    if (!form.receivingDate) e.receivingDate = true;
    if (!form.amount || Number(form.amount) <= 0) e.amount = true;
    if (Number(form.amount) > totalOutstanding) {
      e.amount = `Amount exceeds total outstanding of Rs. ${totalOutstanding}`;
    }
    if (!form.paymentMethod) e.paymentMethod = true;

    if (form.paymentMethod === "bank_transfer" || form.paymentMethod === "cheque") {
      if (!form.transactionNo?.trim()) e.transactionNo = true;
    }

    if (form.paymentMethod === "mobile_wallet") {
      if (!form.walletProvider) e.walletProvider = true;
      if (!form.transactionNo?.trim()) e.transactionNo = true;
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    const result = await recordFeePayment({
      boardingNo: form.boardingNo,
      boarderName: form.boarderName,
      feeMonth: form.feeMonth,
      feeYear: Number(form.feeYear),
      amount: Number(form.amount),
      paymentMethod: form.paymentMethod,
      transactionNo: form.transactionNo,
      walletProvider: form.walletProvider,
      receivingDate: form.receivingDate,
      remarks: form.remarks,
    });

    if (result?.success) {
      toast.success("Payment recorded successfully");
      // Refresh fee info
      const refresh = await getStudentFeeInfo(form.boardingNo);
      if (refresh?.success) setFeeInfo(refresh.data);
      setForm((f) => ({
        ...f,
        amount: "",
        paymentMethod: "",
        transactionNo: "",
        walletProvider: "",
        remarks: "",
      }));
      if (onSuccess) onSuccess();
    }
    setLoading(false);
  };

  const handleCancel = () => {
    if (window.confirm("Discard all changes?")) {
      setQuery("");
      setSelectedStudent(null);
      setFeeInfo(null);
      setForm({
        boardingNo: "",
        boarderName: "",
        fatherName: "",
        contact: "",
        feeMonth: "",
        feeYear: "",
        amount: "",
        paymentMethod: "",
        transactionNo: "",
        walletProvider: "",
        receivingDate: today(),
        remarks: "",
      });
      setErrors({});
    }
  };

  const monthPayments = feeInfo?.payments?.filter(
    (p) => p.feeMonth === form.feeMonth && p.feeYear.toString() === form.feeYear
  ) || [];

  return (
    <div className="px-3 pb-4 space-y-3">
      {/* Student Search */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Search Student</label>
        <div ref={dropRef} className="relative">
          <input
            {...inp(errors.boardingNo)}
            value={query}
            onChange={handleSearch}
            onFocus={() => suggestions.length > 0 && setShowDrop(true)}
            placeholder="Boarding no. or name…"
            autoComplete="off"
            className="w-full"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>

          {showDrop && suggestions.length > 0 && (
            <ul className="absolute top-full mt-1 left-0 right-0 bg-background border border-border rounded-lg z-50 max-h-48 overflow-y-auto shadow-lg">
              {suggestions.map((s) => (
                <li
                  key={s._id}
                  onMouseDown={() => handleSelectSuggestion(s)}
                  className="px-3 py-2 cursor-pointer text-sm flex justify-between items-center border-b border-border last:border-b-0 hover:bg-muted/50"
                >
                  <span className="font-medium text-foreground">{s.boardingNumber}</span>
                  <span className="text-muted-foreground text-xs">{s.user?.name}</span>
                </li>
              ))}
            </ul>
          )}

          {showDrop && query.trim().length >= 1 && suggestions.length === 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-background border border-border rounded-lg z-50 px-3 py-2 text-sm text-muted-foreground shadow-lg">
              No student found
            </div>
          )}
        </div>
      </div>

      {/* Auto-filled fields */}
      {selectedStudent && (
        <div className="grid grid-cols-2 gap-2 p-2.5 bg-muted/30 rounded-md border border-border text-xs">
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Student</div>
            <div className="font-medium mt-0.5">{form.boarderName}</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Father</div>
            <div className="font-medium mt-0.5">{form.fatherName || "—"}</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Contact</div>
            <div className="font-medium mt-0.5">{form.contact || "—"}</div>
          </div>
        </div>
      )}

      {/* Fee Period & Summary */}
      {selectedStudent && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Fee Period <span className="text-destructive">*</span></label>
              <div className="grid grid-cols-2 gap-1.5">
                <select {...inp(errors.feeMonth)} value={form.feeMonth} onChange={set("feeMonth")}>
                  <option value="">Month</option>
                  {MONTHS.map((m) => <option key={m}>{m}</option>)}
                </select>
                <select {...inp(errors.feeYear)} value={form.feeYear} onChange={set("feeYear")}>
                  <option value="">Year</option>
                  {YEARS.map((y) => <option key={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Date <span className="text-destructive">*</span></label>
              <input {...inp(errors.receivingDate)} type="date" value={form.receivingDate} onChange={set("receivingDate")} />
            </div>
          </div>

          {form.feeMonth && form.feeYear && feeInfo && (
            <div className="grid grid-cols-4 gap-1.5">
              <div className="p-2 bg-muted/50 rounded border border-border">
                <div className="text-[9px] text-muted-foreground uppercase">Decided</div>
                <div className="text-xs font-semibold mt-0.5">₨{formatMoney(decidedFee)}</div>
              </div>
              <div className="p-2 bg-muted/50 rounded border border-border">
                <div className="text-[9px] text-muted-foreground uppercase">Paid</div>
                <div className="text-xs font-semibold mt-0.5 text-green-600">₨{formatMoney(paidForMonth)}</div>
              </div>
              <div className="p-2 bg-muted/50 rounded border border-border">
                <div className="text-[9px] text-muted-foreground uppercase">Arrears</div>
                <div className={`text-xs font-semibold mt-0.5 ${totalArrears > 0 ? 'text-red-600' : 'text-green-600'}`}>₨{formatMoney(totalArrears)}</div>
              </div>
              <div className="p-2 bg-primary/5 rounded border border-primary/20">
                <div className="text-[9px] text-primary uppercase">Outstanding</div>
                <div className={`text-sm font-bold mt-0.5 ${totalOutstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>₨{formatMoney(totalOutstanding)}</div>
              </div>
            </div>
          )}

          {hasPreviousDues && (
            <div className="p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
              <strong>Previous dues:</strong> {previousMonthsDue.map((m) => `${m.feeMonth} ${m.feeYear} (₨${formatMoney(m.balanceAmount)})`).join(", ")}
            </div>
          )}

          <Divider />

          {/* Payment Details */}
          <div className="space-y-2">
            {feeInfo?.payments?.[0] && (
              <div className="p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800 flex justify-between items-center">
                <span><strong>Last:</strong> ₨{formatMoney(feeInfo.payments[0].amount)} ({feeInfo.payments[0].paymentMethod?.replace(/_/g, " ")})</span>
                <span>{new Date(feeInfo.payments[0].receivingDate || feeInfo.payments[0].createdAt).toLocaleDateString("en-GB")}</span>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Amount <span className="text-destructive">*</span></label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₨</span>
                  <input 
                    {...prefixInp(errors.amount)} 
                    value={form.amount} 
                    onChange={set("amount")} 
                    placeholder="0" 
                    type="number" 
                    min="0" 
                    className="pl-6 w-full"
                  />
                </div>
                {errors.amount && <p className="text-[10px] text-destructive mt-1">{errors.amount === true ? "Required" : errors.amount}</p>}
              </div>
              
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Method <span className="text-destructive">*</span></label>
                <select {...inp(errors.paymentMethod)} value={form.paymentMethod} onChange={set("paymentMethod")} className="w-full">
                  <option value="">Select</option>
                  {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>

              {(form.paymentMethod === "bank_transfer" || form.paymentMethod === "cheque" || form.paymentMethod === "mobile_wallet") && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Transaction # <span className="text-destructive">*</span></label>
                  <input {...inp(errors.transactionNo)} value={form.transactionNo} onChange={set("transactionNo")} placeholder="e.g. TXN-789" className="w-full" />
                </div>
              )}
              
              {form.paymentMethod === "mobile_wallet" && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Wallet <span className="text-destructive">*</span></label>
                  <select {...inp(errors.walletProvider)} value={form.walletProvider} onChange={set("walletProvider")} className="w-full">
                    <option value="">Select</option>
                    {WALLET_PROVIDERS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Remarks (Optional)</label>
              <textarea
                value={form.remarks} 
                onChange={set("remarks")}
                placeholder="Notes…"
                rows={2}
                className="w-full resize-none text-sm"
                style={{ ...inp().style, lineHeight: 1.5, minHeight: 45 }}
              />
            </div>
          </div>

          {/* Month Payment History */}
          {form.feeMonth && form.feeYear && (
            <>
              <Divider />
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{form.feeMonth} {form.feeYear} History</div>
              {monthPayments.length === 0 ? (
                <p className="text-xs text-muted-foreground">No payments recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-muted/50">
                        {["Date", "Amount", "Method", "Reference"].map((h) => (
                          <th key={h} className="px-2 py-1.5 text-left font-medium text-muted-foreground border-b">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {monthPayments.map((p, i) => (
                        <tr key={i} className="border-b">
                          <td className="px-2 py-1.5">{new Date(p.receivingDate || p.createdAt).toLocaleDateString("en-GB")}</td>
                          <td className="px-2 py-1.5">₨{formatMoney(p.amount)}</td>
                          <td className="px-2 py-1.5">{p.paymentMethod?.replace(/_/g, " ")}</td>
                          <td className="px-2 py-1.5">{p.transactionNo || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Full Fee Ledger */}
          {feeInfo?.payments?.length > 0 && (
            <>
              <Divider />
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Full Ledger</div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/50">
                      {["Month", "Date", "Amount", "Method", "Status"].map((h) => (
                        <th key={h} className="px-2 py-1.5 text-left font-medium text-muted-foreground border-b">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {feeInfo.payments.map((p, i) => {
                      const summary = feeInfo.monthlySummary.find((m) => m.feeMonth === p.feeMonth && m.feeYear === p.feeYear);
                      const s = statusStyle(summary?.status || "pending");
                      return (
                        <tr key={i} className="border-b">
                          <td className="px-2 py-1.5 font-medium">{p.feeMonth} {p.feeYear}</td>
                          <td className="px-2 py-1.5">{new Date(p.receivingDate || p.createdAt).toLocaleDateString("en-GB")}</td>
                          <td className="px-2 py-1.5">₨{formatMoney(p.amount)}</td>
                          <td className="px-2 py-1.5">{p.paymentMethod?.replace(/_/g, " ")}</td>
                          <td className="px-2 py-1.5">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                              {summary?.status || "pending"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button onClick={handleCancel} className={btnClass("cancel")}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={loading} className={`${btnClass("save")} ${loading ? 'opacity-60' : ''}`}>
              {loading ? "Saving..." : "Record Payment"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-border" />;
}

function inp(err) {
  return {
    style: {
      width: "100%", padding: "7px 10px", fontSize: 13,
      fontFamily: "inherit", border: `1px solid ${err ? "#e24b4a" : "#ddd"}`,
      borderRadius: 6, background: "hsl(0 0% 98%)", color: "#111",
      outline: "none", boxSizing: "border-box",
    }
  };
}

const prefixInp = (err) => ({ ...inp(err), style: { ...inp(err).style, paddingLeft: 24 } });

function btnClass(type) {
  const base = "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md cursor-pointer border transition-opacity";
  if (type === "save") return `${base} bg-[#1E1E1E] text-white border-[#1E1E1E]`;
  return `${base} bg-white text-foreground border-border hover:bg-muted/50`;
}
