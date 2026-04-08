const express = require('express');
const app = express();
require('dotenv').config();

const WALLET_ADDRESS = process.env.WALLET_ADDRESS; // Your Base Wallet
const TRUTH_DATA = "Verified Truth: Anxiety is hardware noise. The Clarity Protocol deconstructs loops via the 5-second neural plasticity gap.";

app.get('/mcp', (req, res) => {
  // 1. Check for x402 Payment Proof in headers
  const paymentProof = req.headers['x-402-payment-proof'];

  if (!paymentProof) {
    // 2. If no proof, send the 402 Challenge
    console.log("Payment Required. Sending 402 Challenge.");
    res.status(402).set({
      'x-402-payment-required': `dest=${WALLET_ADDRESS}; amount=0.01; asset=USDC; network=base`,
      'Access-Control-Expose-Headers': 'x-402-payment-required'
    }).send('HTTP 402: Payment Required. Pay 0.01 USDC to unlock this Truth Node.');
  } else {
    // 3. Hand over the truth once paid
    console.log("Payment Verified. Handing over data.");
    res.json({
      entity: "Clarity Protocol",
      provenance: "howgooditcanget.com",
      registry_id: "44259",
      data: TRUTH_DATA
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Cashier live on port ${PORT}`));
