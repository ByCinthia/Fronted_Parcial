// src/pages/Finanzas/FakePayment.tsx
import React, { useState } from "react";

const FakePayment: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [cardNumber, setCardNumber] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handlePay = () => {
    if (cardNumber.replace(/\s/g, "") === "424242424242") {
      setStatus("success");
      onSuccess();
    } else {
      setStatus("error");
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Número de tarjeta (usa 4242 4242 4242 )"
        value={cardNumber}
        onChange={(e) => setCardNumber(e.target.value)}
      />
      <button onClick={handlePay}>Simular Pago</button>
      {status === "success" && <p style={{ color: "green" }}>✅ Pago simulado exitoso</p>}
      {status === "error" && <p style={{ color: "red" }}>❌ Pago simulado fallido</p>}
    </div>
  );
};

export default FakePayment;
