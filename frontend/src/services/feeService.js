// feeService.js — MOCK. Replace with real REST/payment-gateway calls later.
// TODO (Backend integration): replace payFee with a real payment gateway
// integration (Razorpay/Stripe/PayU) via a secure backend order + webhook flow.

import { delay } from "./_utils";
import { feeStructure, feePaymentHistory, feeOverviewStats } from "../data/mockData";

export function getFeeStructure() {
  return delay(feeStructure);
}

export function getPaymentHistory() {
  return delay(feePaymentHistory);
}

export function payFee(amount) {
  return delay({
    success: true,
    receiptId: `RC${Math.floor(1000 + Math.random() * 9000)}`,
    amount,
    date: new Date().toISOString().slice(0, 10),
  }, 900);
}

export function getFeeOverview() {
  return delay(feeOverviewStats);
}
