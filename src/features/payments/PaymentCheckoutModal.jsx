import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  Building2,
  CreditCard,
  Loader2,
  Lock,
  QrCode,
  Smartphone,
} from "lucide-react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { formatINR } from "../../utils/money";
import { todayISO } from "../../utils/date";
import styles from "./payment.module.css";

const METHODS = [
  {
    id: "card",
    label: "Card",
    hint: "Visa / Mastercard / RuPay",
    icon: CreditCard,
  },
  {
    id: "upi",
    label: "UPI",
    hint: "GPay · PhonePe · Paytm",
    icon: Smartphone,
  },
  {
    id: "bank",
    label: "Net banking",
    hint: "NEFT / IMPS transfer",
    icon: Building2,
  },
  {
    id: "cash",
    label: "Cash",
    hint: "Counter collection",
    icon: Banknote,
  },
];

const emptyDetails = {
  cardName: "",
  cardNumber: "",
  expiry: "",
  cvv: "",
  upiId: "",
  bankName: "",
  accountLast4: "",
  ifsc: "",
  cashReceipt: "",
};

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function formatCardNumber(value) {
  return onlyDigits(value)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
}

function formatExpiry(value) {
  const d = onlyDigits(value).slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

export default function PaymentCheckoutModal({
  open,
  onClose,
  onSubmit,
  students,
  batches,
  initial,
  mode = "create",
}) {
  const [step, setStep] = useState("details");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    studentId: "",
    batchId: "",
    amount: 3000,
    method: "card",
    status: "paid",
    dueDate: todayISO(),
    note: "Fee payment",
  });
  const [details, setDetails] = useState(emptyDetails);

  useEffect(() => {
    if (!open) return;
    setStep("details");
    setProcessing(false);
    setError("");
    setDetails(emptyDetails);
    if (initial) {
      setForm({
        studentId: initial.studentId || students[0]?.id || "",
        batchId: initial.batchId || "",
        amount: initial.amount || 3000,
        method: initial.method || "card",
        status: mode === "collect" ? "paid" : initial.status || "paid",
        dueDate: initial.dueDate || todayISO(),
        note: initial.note || "Fee payment",
        id: initial.id,
      });
    } else {
      const student = students[0];
      const batch = batches.find((b) => b.id === student?.batchId);
      setForm({
        studentId: student?.id || "",
        batchId: student?.batchId || batches[0]?.id || "",
        amount: batch?.feeAmount || 3000,
        method: "card",
        status: "paid",
        dueDate: todayISO(),
        note: "Fee payment",
      });
    }
  }, [open, initial, students, batches, mode]);

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === form.studentId),
    [students, form.studentId],
  );

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onStudentChange(id) {
    const student = students.find((s) => s.id === id);
    const batch = batches.find((b) => b.id === student?.batchId);
    setForm((f) => ({
      ...f,
      studentId: id,
      batchId: student?.batchId || f.batchId,
      amount: batch?.feeAmount || f.amount,
    }));
  }

  function validateMethod() {
    if (form.method === "card") {
      const number = onlyDigits(details.cardNumber);
      if (!details.cardName.trim()) return "Cardholder name is required.";
      if (number.length < 16) return "Enter a valid 16-digit card number.";
      if (!/^\d{2}\/\d{2}$/.test(details.expiry)) return "Enter expiry as MM/YY.";
      if (onlyDigits(details.cvv).length < 3) return "Enter a valid CVV.";
    }
    if (form.method === "upi") {
      if (!/^[\w.-]+@[\w.-]+$/.test(details.upiId.trim())) {
        return "Enter a valid UPI ID (example@okaxis).";
      }
    }
    if (form.method === "bank") {
      if (!details.bankName.trim()) return "Select a bank.";
      if (onlyDigits(details.accountLast4).length !== 4) {
        return "Enter last 4 digits of account.";
      }
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(details.ifsc.trim())) {
        return "Enter a valid IFSC code.";
      }
    }
    if (form.method === "cash" && !details.cashReceipt.trim()) {
      return "Enter cash receipt / counter reference.";
    }
    return "";
  }

  function buildMethodMeta() {
    if (form.method === "card") {
      const digits = onlyDigits(details.cardNumber);
      return {
        brand: digits.startsWith("4") ? "Visa" : digits.startsWith("5") ? "Mastercard" : "RuPay",
        last4: digits.slice(-4),
        cardName: details.cardName.trim(),
      };
    }
    if (form.method === "upi") return { upiId: details.upiId.trim() };
    if (form.method === "bank") {
      return {
        bankName: details.bankName,
        accountLast4: onlyDigits(details.accountLast4),
        ifsc: details.ifsc.toUpperCase(),
      };
    }
    return { cashReceipt: details.cashReceipt.trim() };
  }

  function goPay(e) {
    e.preventDefault();
    if (!form.studentId || !form.amount || !form.dueDate) {
      setError("Student, amount, and due date are required.");
      return;
    }
    const methodError = validateMethod();
    if (methodError) {
      setError(methodError);
      return;
    }
    setError("");
    setStep("confirm");
  }

  function confirmPay() {
    setProcessing(true);
    const payload = {
      ...form,
      status: "paid",
      paidAt: new Date().toISOString(),
      methodMeta: buildMethodMeta(),
    };
    window.setTimeout(() => {
      onSubmit(payload);
      setProcessing(false);
    }, 900);
  }

  const method = METHODS.find((m) => m.id === form.method) || METHODS[0];
  const MethodIcon = method.icon;

  return (
    <Modal
      open={open}
      onClose={processing ? undefined : onClose}
      title={mode === "collect" ? "Collect payment" : "Checkout"}
      wide
      footer={
        step === "details" ? (
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" form="checkout-form">
              Continue to pay
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="secondary"
              onClick={() => setStep("details")}
              disabled={processing}
            >
              Back
            </Button>
            <Button onClick={confirmPay} disabled={processing}>
              {processing ? (
                <>
                  <Loader2 size={16} className={styles.spin} /> Processing…
                </>
              ) : (
                <>
                  <Lock size={16} /> Pay {formatINR(form.amount)}
                </>
              )}
            </Button>
          </>
        )
      }
    >
      {step === "details" ? (
        <form id="checkout-form" className={styles.checkout} onSubmit={goPay}>
          <div className={styles.summary}>
            <div>
              <div className={styles.summaryLabel}>Amount due</div>
              <div className={styles.summaryAmount}>{formatINR(form.amount)}</div>
            </div>
            <div className={styles.secure}>
              <Lock size={14} /> Demo secure checkout
            </div>
          </div>

          <div className="form-grid">
            <Select
              className="full"
              label="Student"
              value={form.studentId}
              onChange={(e) => onStudentChange(e.target.value)}
              disabled={mode === "collect"}
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
            <Input
              label="Amount (₹)"
              type="number"
              min="1"
              value={form.amount}
              onChange={(e) => setField("amount", Number(e.target.value))}
              disabled={mode === "collect"}
            />
            <Input
              label="Due date"
              type="date"
              value={form.dueDate}
              onChange={(e) => setField("dueDate", e.target.value)}
              disabled={mode === "collect"}
            />
            <Input
              className="full"
              label="Note"
              value={form.note}
              onChange={(e) => setField("note", e.target.value)}
            />
          </div>

          <div className={styles.sectionLabel}>Payment method</div>
          <div className={styles.methodGrid}>
            {METHODS.map((m) => {
              const Icon = m.icon;
              const active = form.method === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  className={`${styles.methodCard} ${active ? styles.methodActive : ""}`}
                  onClick={() => {
                    setField("method", m.id);
                    setError("");
                  }}
                >
                  <Icon size={20} />
                  <span className={styles.methodTitle}>{m.label}</span>
                  <span className={styles.methodHint}>{m.hint}</span>
                </button>
              );
            })}
          </div>

          <div className={styles.methodPanel}>
            <div className={styles.methodPanelHead}>
              <MethodIcon size={18} />
              <strong>{method.label} details</strong>
            </div>

            {form.method === "card" ? (
              <div className="form-grid">
                <Input
                  className="full"
                  label="Name on card"
                  placeholder="As printed on card"
                  value={details.cardName}
                  onChange={(e) =>
                    setDetails((d) => ({ ...d, cardName: e.target.value }))
                  }
                />
                <Input
                  className="full"
                  label="Card number"
                  inputMode="numeric"
                  placeholder="ACCT-000015"
                  value={details.cardNumber}
                  onChange={(e) =>
                    setDetails((d) => ({
                      ...d,
                      cardNumber: formatCardNumber(e.target.value),
                    }))
                  }
                />
                <Input
                  label="Expiry"
                  placeholder="MM/YY"
                  value={details.expiry}
                  onChange={(e) =>
                    setDetails((d) => ({
                      ...d,
                      expiry: formatExpiry(e.target.value),
                    }))
                  }
                />
                <Input
                  label="CVV"
                  inputMode="numeric"
                  placeholder="•••"
                  value={details.cvv}
                  onChange={(e) =>
                    setDetails((d) => ({
                      ...d,
                      cvv: onlyDigits(e.target.value).slice(0, 4),
                    }))
                  }
                />
                <div className={`${styles.cardPreview} full`}>
                  <div className={styles.cardChip} />
                  <div className={styles.cardNumber}>
                    {details.cardNumber || "•••• •••• •••• ••••"}
                  </div>
                  <div className={styles.cardFooter}>
                    <span>{details.cardName || selectedStudent?.name || "CARD HOLDER"}</span>
                    <span>{details.expiry || "MM/YY"}</span>
                  </div>
                </div>
              </div>
            ) : null}

            {form.method === "upi" ? (
              <div className={styles.upiLayout}>
                <div className={styles.qrBox}>
                  <QrCode size={72} strokeWidth={1.25} />
                  <span>Scan to pay (demo)</span>
                </div>
                <Input
                  label="UPI ID"
                  placeholder="name@okaxis"
                  value={details.upiId}
                  onChange={(e) =>
                    setDetails((d) => ({ ...d, upiId: e.target.value }))
                  }
                />
              </div>
            ) : null}

            {form.method === "bank" ? (
              <div className="form-grid">
                <Select
                  className="full"
                  label="Bank"
                  value={details.bankName}
                  onChange={(e) =>
                    setDetails((d) => ({ ...d, bankName: e.target.value }))
                  }
                >
                  <option value="">Select bank</option>
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="SBI">State Bank of India</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Kotak">Kotak Mahindra</option>
                </Select>
                <Input
                  label="Account last 4"
                  inputMode="numeric"
                  placeholder="1234"
                  value={details.accountLast4}
                  onChange={(e) =>
                    setDetails((d) => ({
                      ...d,
                      accountLast4: onlyDigits(e.target.value).slice(0, 4),
                    }))
                  }
                />
                <Input
                  label="IFSC"
                  placeholder="HDFC0001234"
                  value={details.ifsc}
                  onChange={(e) =>
                    setDetails((d) => ({
                      ...d,
                      ifsc: e.target.value.toUpperCase().slice(0, 11),
                    }))
                  }
                />
              </div>
            ) : null}

            {form.method === "cash" ? (
              <Input
                label="Receipt / counter reference"
                placeholder="CASH-2401"
                value={details.cashReceipt}
                onChange={(e) =>
                  setDetails((d) => ({ ...d, cashReceipt: e.target.value }))
                }
              />
            ) : null}
          </div>

          {error ? <div className={styles.error}>{error}</div> : null}
        </form>
      ) : (
        <div className={styles.confirm}>
          <div className={styles.confirmIcon}>
            <MethodIcon size={28} />
          </div>
          <h3>Confirm {method.label.toLowerCase()} payment</h3>
          <p className="muted">
            Paying <strong>{formatINR(form.amount)}</strong> for{" "}
            <strong>{selectedStudent?.name || "student"}</strong>
          </p>
          <ul className={styles.confirmList}>
            <li>
              <span>Method</span>
              <strong>{method.label}</strong>
            </li>
            {form.method === "card" ? (
              <li>
                <span>Card</span>
                <strong>•••• {onlyDigits(details.cardNumber).slice(-4)}</strong>
              </li>
            ) : null}
            {form.method === "upi" ? (
              <li>
                <span>UPI</span>
                <strong>{details.upiId}</strong>
              </li>
            ) : null}
            {form.method === "bank" ? (
              <li>
                <span>Bank</span>
                <strong>{details.bankName}</strong>
              </li>
            ) : null}
            {form.method === "cash" ? (
              <li>
                <span>Receipt</span>
                <strong>{details.cashReceipt}</strong>
              </li>
            ) : null}
          </ul>
        </div>
      )}
    </Modal>
  );
}
