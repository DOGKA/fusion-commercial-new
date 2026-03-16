"use client";

import { CheckoutProvider } from "@/context/CheckoutContext";

export default function CheckoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CheckoutProvider>{children}</CheckoutProvider>;
}

