import React from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import Navbar3 from "../components/navbar3";
import "./Payment.css";

const handleCreatePayment = async () => {
  console.log("Payment created");
  await axios
    .post(`${API_BASE_URL}/create-payment`, {
      amount: 1000,
      currency: "BDT",
    })
    .then((res) => {
      console.log(res);
    });
};

export default function Payment() {
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
              Payment gateway UI & SSLCommerz integration will be implemented in
              this section.
            </p>
            <button onClick={handleCreatePayment} className=" payment-btn ">
              Apply Now
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
