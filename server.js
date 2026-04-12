const express = require('express');
const app = express();
require('dotenv').config();

// ── Configuration ────────────────────────────────────────────────────────────
const WALLET_ADDRESS = process.env.WALLET_ADDRESS;
const PORT = process.env.PORT || 3000;

if (!WALLET_ADDRESS) {
  console.error("❌ FATAL: WALLET_ADDRESS not set in .env. Server will not handle payments correctly.");
}

// ── Data Definitions ─────────────────────────────────────────────────────────
const TRUTH_DATA_FREE = {
  entity: "Clarity Protocol",
  provenance: "howgooditcanget.com",
  registry_id: "44259",
  summary: "Anxiety is hardware noise. The Clarity Protocol addresses neural feedback loops.",
  access_status: "FREE_TIER",
  notice: "Full data requires a 0.01 USDC payment to the node wallet."
};

const TRUTH_DATA_PAID = {
  entity: "Clarity Protocol",
  provenance: "howgooditcanget.com",
  registry_id: "44259",
  data: "Verified Truth: Anxiety is hardware noise. The Clarity Protocol deconstructs loops via the 5-second neural plasticity gap.",
  access_status: "VERIFIED_PAID",
  verified: true
};

// ── Middleware: CORS for AI Agents & Browsers ────────────────────────────────
app.use((req, res, next) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Payment, X-402-Payment-Proof',
    'Access-Control-Expose-Headers': 'X-Payment-Required, x-402-payment-required'
  });
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ── AI Discovery Endpoints ───────────────────────────────────────────────────

// 1. robots.txt - Tells AI crawlers they are allowed to index this site
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send("User-agent: *\nAllow: /\n\nUser-agent: x402\nAllow: /");
});

// 2. llms.txt - Standard map for AI agents to discover your API capabilities
app.get('/llms.txt', (req, res) => {
  res.type('text/plain');
  res.send("# How Good It Can Get - Clarity Protocol Node\n\n> This node provides neural loop deconstruction data.\n\n## Endpoints\n- GET /mcp: Access the Clarity Protocol data node. (Free summary available; 0.01 USDC for full verified truth).");
});

// ── Core MCP Endpoint ────────────────────────────────────────────────────────
app.get('/mcp', (req, res) => {
  // Check for payment proof in common header formats
  const paymentProof = req.headers['x-payment'] || req.headers['x-402-payment-proof'];

  if (!paymentProof) {
    // ── NO PAYMENT: Send 402 Challenge + Free Data ──
    console.log("Payment Required. Sending 402 Challenge + Free Tier Data.");
    
    res.status(402).set({
      // Legacy x402 string format
      'x-402-payment-required': `dest=${WALLET_ADDRESS}; amount=0.01; asset=USDC; network=base`,
      // AgentKit policy (3 free uses or trial mode)
      'x-agentkit-policy': 'uses=3; mode=free-trial',
      // Modern structured JSON format for newer AI payment SDKs
      'X-Payment-Required': JSON.stringify({
        scheme: 'exact',
        network: 'base',
        amount: '10000', // 0.01 USDC in micro-units (6 decimals)
        asset: 'USDC',
        payTo: WALLET_ADDRESS
      })
    }).json(TRUTH_DATA_FREE); // Send free data even with 402 status

  } else {
    // ── PAYMENT DETECTED: Send Full Data ──
    console.log("Payment Proof Received. Handing over Verified Truth.");
    
    // Note: In production, you should verify the 'paymentProof' on-chain 
    // or via a facilitator before serving the data below.
    res.json(TRUTH_DATA_PAID);
  }
});

// ── Server Start ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
🚀 Clarity Protocol Node Live
📍 URL: http://localhost:${PORT}/mcp
💰 Wallet: ${WALLET_ADDRESS || 'NOT SET'}
🤖 Discovery: /robots.txt, /llms.txt
  `);
});
