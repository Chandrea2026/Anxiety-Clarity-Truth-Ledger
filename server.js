const express = require('express');
const path = require('path');
const app = express();
require('dotenv').config();

// ── 1. Configuration ─────────────────────────────────────────────────────────
const WALLET = process.env.WALLET_ADDRESS || "0x22edE326DDc64566bcc982D2f640f6c9dA02b1B7";
const PORT = process.env.PORT || 3000;

// ── 2. Middleware: CORS & Bot Detection ──────────────────────────────────────
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

/**
 * Compliance Shield: Detects the 8004 Oracle so it can verify your offers
 * without paying, while still charging everyone else.
 */
const isRegistryBot = (req) => {
    const ua = req.headers['user-agent'] || '';
    return ua.includes('8004scan') || ua.includes('ERC-8004') || ua.includes('OASF');
};

// ── 3. Identity & Health (The Compliance Fixes) ──────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ status: "Healthy", agentId: "44259" });
});

app.get('/identity.jsonld', (req, res) => {
  res.sendFile(path.join(__dirname, 'identity.jsonld'));
});

app.get('/llms.txt', (req, res) => {
  res.sendFile(path.join(__dirname, 'llms.txt'));
});

// ── 4. Product Endpoints (With Bot Bypass for Compliance) ────────────────────

const handlePaidFile = (fileName, amount, description) => (req, res) => {
  const paymentProof = req.headers['x-payment'] || req.headers['x-402-payment-proof'];
  
  if (isRegistryBot(req) || paymentProof) {
    res.sendFile(path.join(__dirname, fileName));
  } else {
    res.status(402).set({
      'X-Payment-Required': JSON.stringify({
        scheme: 'exact', network: 'base', asset: 'USDC',
        amount: amount, payTo: WALLET
      })
    }).json({ error: "Payment Required", message: description });
  }
};

// USDC Math: $1.00 = 1,000,000 units
app.get('/mcp', handlePaidFile('identity.jsonld', '10000', 'Clarity Protocol Data Node')); // $0.01
app.get('/podcast_full_archive.json', handlePaidFile('podcast_full_archive.json', '5000000', 'Full Intelligence Archive')); // $5.00
app.get('/universal_library.json', handlePaidFile('universal_library.json', '10000000', 'The Master Universal Library')); // $10.00
app.get('/clarity_prompt_schema.json', handlePaidFile('clarity_prompt_schema.json', '2500000', 'Clarity Protocol Prompt Engine')); // $2.50

// ── 5. Landing Page ──────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send(`
    <html>
      <body style="font-family: sans-serif; padding: 40px; text-align: center;">
        <h1 style="color: #2c3e50;">HGICG Truth Node (Active)</h1>
        <p>Registry ID: <strong>44259</strong> | Status: <span style="color: green;">Healthy</span></p>
        <p>This node serves high-fidelity intelligence for AI agents.</p>
        <hr style="width: 50%; margin: 20px auto;">
        <p>AI Discovery: <a href="/llms.txt">/llms.txt</a> | Identity: <a href="/identity.jsonld">/identity.jsonld</a></p>
      </body>
    </html>
  `);
});

// ── 6. Start Server ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('🚀 HGICG Truth Node Live');
});
