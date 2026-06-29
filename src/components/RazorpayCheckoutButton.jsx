import { useState } from "react";
import { billingApi, getApiErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function RazorpayCheckoutButton({ plan, label, buttonText, onSuccess, onError }) {
  const { user, refreshUser } = useAuth();
  const [pending, setPending] = useState(false);

  const startCheckout = async () => {
    setPending(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Could not load Razorpay checkout.");
      }
      const subscription = await billingApi.createSubscription(plan);

      const razorpay = new window.Razorpay({
        key: subscription.razorpay_key_id,
        subscription_id: subscription.razorpay_subscription_id,
        name: "Garo2",
        description: `${label} plan subscription`,
        handler: async (response) => {
          await billingApi.verifySubscription({
            plan,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_subscription_id: response.razorpay_subscription_id,
            razorpay_signature: response.razorpay_signature,
          });
          await refreshUser();
          setPending(false);
          onSuccess?.();
        },
        modal: {
          ondismiss: () => {
            onError?.("Payment cancelled.");
            setPending(false);
          },
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: "#159781",
        },
      });

      razorpay.on("payment.failed", (response) => {
        const reason = response?.error?.description || "Payment failed.";
        onError?.(reason);
        setPending(false);
      });

      razorpay.open();
    } catch (error) {
      onError?.(getApiErrorMessage(error, "Could not start the upgrade flow."));
      setPending(false);
      return;
    }
  };

  return (
    <button type="button" className="primary-button" disabled={pending} onClick={startCheckout}>
      {pending ? "Starting..." : buttonText || `Pay for ${label}`}
    </button>
  );
}
