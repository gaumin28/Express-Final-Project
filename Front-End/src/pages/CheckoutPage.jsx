import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/useCart";
import { useToast } from "../context/ToastContext";
import { placeOrder } from "../services/api";

const STEPS = ["Shipping", "Payment", "Review"];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition ${i < current ? "bg-indigo-600 text-white" : i === current ? "border-2 border-indigo-600 text-indigo-600" : "border-2 border-slate-300 text-slate-400"}`}
          >
            {i < current ? "✓" : i + 1}
          </div>
          <span
            className={`hidden text-sm font-medium sm:block ${i === current ? "text-indigo-600" : i < current ? "text-slate-600" : "text-slate-400"}`}
          >
            {step}
          </span>
          {i < STEPS.length - 1 && (
            <div
              className={`h-0.5 w-8 sm:w-16 ${i < current ? "bg-indigo-600" : "bg-slate-200"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function InputField({ label, placeholder, type = "text", value, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  );
}

function ShippingStep({ shipping, onChange }) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-slate-900">Shipping information</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="First name"
          placeholder="John"
          value={shipping.firstName}
          onChange={(e) => onChange("firstName", e.target.value)}
        />
        <InputField
          label="Last name"
          placeholder="Doe"
          value={shipping.lastName}
          onChange={(e) => onChange("lastName", e.target.value)}
        />
      </div>
      <InputField
        label="Email address"
        placeholder="you@example.com"
        type="email"
        value={shipping.email}
        onChange={(e) => onChange("email", e.target.value)}
      />
      <InputField
        label="Phone number"
        placeholder="+84 12345678"
        type="tel"
        value={shipping.phone}
        onChange={(e) => onChange("phone", e.target.value)}
      />
      <InputField
        label="Address"
        placeholder="123 Main Street"
        value={shipping.address}
        onChange={(e) => onChange("address", e.target.value)}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <InputField
          label="City"
          placeholder="HCM"
          value={shipping.city}
          onChange={(e) => onChange("city", e.target.value)}
        />
        <InputField
          label="Ward"
          placeholder="Sai Gon"
          value={shipping.state}
          onChange={(e) => onChange("ward", e.target.value)}
        />
        {/* <InputField
          label="ZIP code"
          placeholder="10001"
          value={shipping.zip}
          onChange={(e) => onChange("zip", e.target.value)}
        /> */}
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">Shipping method</p>
        {[
          {
            id: "standard",
            label: "Standard shipping",
            sub: "5–7 business days",
            price: "FREE",
          },
          {
            id: "express",
            label: "Express shipping",
            sub: "2–3 business days",
            price: "$9.99",
          },
          {
            id: "overnight",
            label: "Overnight",
            sub: "Next business day",
            price: "$19.99",
          },
        ].map((method) => (
          <label
            key={method.id}
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-indigo-300"
          >
            <input
              type="radio"
              name="shipping"
              checked={shipping.method === method.id}
              onChange={() => onChange("method", method.id)}
              className="accent-indigo-600"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">
                {method.label}
              </p>
              <p className="text-xs text-slate-500">{method.sub}</p>
            </div>
            <span
              className={`text-sm font-bold ${method.price === "FREE" ? "text-emerald-600" : "text-slate-900"}`}
            >
              {method.price}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function PaymentStep({ payment, onChange, paymentMethod, onMethodChange }) {
  const methods = [
    { id: "card", label: "Credit / Debit Card" },
    { id: "shopBeePay", label: "ShopBee Pay" },
    { id: "cod", label: "Cash on delivery" },
  ];
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-slate-900">Payment details</h2>
      <div className="space-y-2">
        {methods.map((method) => (
          <label
            key={method.id}
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-indigo-300"
          >
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === method.id}
              onChange={() => onMethodChange(method.id)}
              className="accent-indigo-600"
            />
            <span className="text-sm font-semibold text-slate-900">
              {method.label}
            </span>
          </label>
        ))}
      </div>
      {paymentMethod === "card" && (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <InputField
            label="Cardholder name"
            placeholder="John Doe"
            value={payment.cardholderName}
            onChange={(e) => onChange("cardholderName", e.target.value)}
          />
          <InputField
            label="Card number"
            placeholder="1234 5678 9012 3456"
            value={payment.cardNumber}
            onChange={(e) => onChange("cardNumber", e.target.value)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="Expiry date"
              placeholder="MM / YY"
              value={payment.expiryDate}
              onChange={(e) => onChange("expiryDate", e.target.value)}
            />
            <InputField
              label="CVV"
              placeholder="123"
              value={payment.cvv}
              onChange={(e) => onChange("cvv", e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewStep({ cartItems, cartTotal }) {
  const shipping = cartTotal > 50 ? 0 : 5.99;
  const tax = cartTotal * 0.08;
  const total = cartTotal + shipping + tax;

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-slate-900">Order review</h2>
      <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4">
            <img
              src={item.image}
              alt={item.name}
              className="h-14 w-14 rounded-xl object-cover"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">
                {item.name}
              </p>
              <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
            </div>
            <p className="text-sm font-bold text-slate-900">
              ${(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 text-sm text-slate-600">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-semibold text-slate-900">
            ${cartTotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span
            className={`font-semibold ${shipping === 0 ? "text-emerald-600" : "text-slate-900"}`}
          >
            {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Tax (8%)</span>
          <span className="font-semibold text-slate-900">
            ${tax.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between border-t border-slate-100 pt-3 text-base font-bold text-slate-900">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [placed, setPlaced] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [shipping, setShipping] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    ward: "",
    method: "standard",
  });
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [payment, setPayment] = useState({
    cardholderName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  function isShippingValid() {
    return (
      shipping.firstName.trim() &&
      shipping.lastName.trim() &&
      shipping.email.trim() &&
      shipping.phone.trim() &&
      shipping.address.trim() &&
      shipping.city.trim() &&
      shipping.ward.trim()
    );
  }

  function isPaymentValid() {
    if (paymentMethod !== "card") return true;
    return (
      payment.cardholderName.trim() &&
      payment.cardNumber.trim() &&
      payment.expiryDate.trim() &&
      payment.cvv.trim()
    );
  }

  function canContinue() {
    if (step === 0) return isShippingValid();
    if (step === 1) return isPaymentValid();
    return true;
  }

  async function handlePlaceOrder() {
    const shippingFee = cartTotal > 50 ? 0 : 5.99;
    const tax = cartTotal * 0.08;
    const total = cartTotal + shippingFee + tax;

    setPlacing(true);
    try {
      await placeOrder({
        items: cartItems.map((item) => ({
          id: item.id,
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        shipping,
        paymentMethod,
        subtotal: cartTotal,
        shippingFee,
        tax,
        total,
      });

      setPlaced(true);
      clearCart();
      toast({ message: "Order placed successfully!", type: "success" });
    } catch (error) {
      toast({
        message: error.message || "Failed to place order. Please try again.",
        type: "error",
      });
    } finally {
      setPlacing(false);
    }
  }

  if (placed) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Order placed!</h1>
          <p className="mt-2 text-slate-500">
            Thank you for your purchase. You will receive a confirmation email
            soon.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/"
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition"
          >
            Back to home
          </Link>
          <Link
            to="/profile"
            className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            View orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Checkout</h1>
      <StepIndicator current={step} />

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        {step === 0 && (
          <ShippingStep
            shipping={shipping}
            onChange={(key, value) =>
              setShipping((prev) => ({ ...prev, [key]: value }))
            }
          />
        )}
        {step === 1 && (
          <PaymentStep
            payment={payment}
            onChange={(key, value) =>
              setPayment((prev) => ({ ...prev, [key]: value }))
            }
            paymentMethod={paymentMethod}
            onMethodChange={setPaymentMethod}
          />
        )}
        {step === 2 && (
          <ReviewStep cartItems={cartItems} cartTotal={cartTotal} />
        )}
      </div>

      <div className="flex justify-between">
        {step > 0 ? (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            ← Back
          </button>
        ) : (
          <Link
            to="/cart"
            className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            ← Cart
          </Link>
        )}

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canContinue()}
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        ) : (
          <button
            onClick={handlePlaceOrder}
            disabled={placing}
            className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition"
          >
            {placing ? "Placing..." : "Place order"}
          </button>
        )}
      </div>
    </div>
  );
}

export default CheckoutPage;
