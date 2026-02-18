import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import Navbar3 from "../components/navbar3";
import "./Payment.css";

export default function Payment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreatePayment = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.post(`${API_BASE_URL}/create-payment`, {
        amount: 1000,
        currency: "BDT",
      });
      if (res?.data?.success && res?.data?.GatewayPageURL) {
        window.location.href = res.data.GatewayPageURL;
      } else {
        setError(res?.data?.message || "Payment init failed");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Payment request failed."
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="payment-page">
      <Navbar3 />

      <main className="payment-content">
        <section className="payment-card">
          <h1 className="payment-title">Secure Payment</h1>
          <p className="payment-subtitle">
            We will integrate SSLCommerz here to securely process your
            application fees and service payments.
          </p>
          <div className="payment-placeholder-box">
            <p>
              Pay application fee (1000 BDT) securely via SSLCommerz. You will be
              redirected to the payment gateway.
            </p>
            {error && <p className="payment-error">{error}</p>}
            <button
              onClick={handleCreatePayment}
              className="payment-btn"
              disabled={loading}
            >
              {loading ? "Processing..." : "Apply Now"}
            </button>
            <p className="payment-hint">
              <Link to="/">Back to Home</Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
