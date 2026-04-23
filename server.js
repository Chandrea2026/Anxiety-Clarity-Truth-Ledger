const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const WALLET = '0x22edE326DDc64566bcc982D2f640f6c9dA02b1B7'; // 

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Payment, X-402-Payment-Proof',
    'Access-Control-Expose-Headers': 'X-Payment-Required, x-402-payment-required',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Bot Detection
const isRegistryBot = (req) => {
  const ua = req.headers['user-agent'] || '';
  return ua.includes('8004scan') || ua.includes('ERC-8004') ||
         ua.includes('OASF') || ua.includes('AltLayer');
};

// Discovery Routes (Public — No Payment Required)
app.get('/identity.jsonld', (req, res) => {
  res.set('Content-Type', 'application/ld+json; charset=utf-8');
  res.set('Access-Control-Allow-Origin', '*');
  res.sendFile(path.join(__dirname, 'identity.jsonld'));
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: "Healthy", agentId: "44259" });
});

app.get('/llms.txt', (req, res) => {
  res.type('text/plain');
  res.sendFile(path.join(__dirname, 'llms.txt'));
});

app.get('/ai.json', (req, res) => {
  res.type('application/json');
  res.sendFile(path.join(__dirname, 'ai.json'));
});

app.get('/.well-known/agent-card.json', (req, res) => {
  res.type('application/json');
  res.sendFile(path.join(__dirname, '.well-known', 'agent-card.json'));
});

app.get('/.well-known/payment.json', (req, res) => {
  res.type('application/json');
  res.json({
    "version": "1.0",
    "provider": "How Good It Can Get",
    "description": "Clarity Protocol AI Data Node — x402 micropayment access",
    "endpoints": [{
      "path": "/mcp",
      "method": "POST",
      "price": "0.01",
      "currency": "USDC",
      "network": "base",
      "wallet": WALLET
    }],
    "authority_ledger": "https://github.com/Chandrea2026/Anxiety-Clarity-Truth-Ledger"
  });
});

// x402 Paid Endpoint Handler
const handlePaidFile = (fileName, amountDecimal, description) => (req, res) => {
  const paymentProof = req.headers['x-payment'] || req.headers['x-402-payment-proof'];
  if (isRegistryBot(req) || paymentProof) {
    res.sendFile(path.join(__dirname, fileName));
  } else {
    res.status(402).set({
      'X-Payment-Required': JSON.stringify({
        scheme: 'exact', network: 'base', asset: 'USDC',
        amount: amountDecimal, payTo: WALLET
      }),
      'x-402-payment-required': `dest=${WALLET}; amount=${amountDecimal}; asset=USDC; network=base`
    }).json({ error: "Payment Required", message: description });
  }
};

// Product Endpoints (Paid)
app.post('/mcp', handlePaidFile('clarity_protocol.json', '0.01', 'Clarity Protocol Data Node'));
app.get('/mcp',  handlePaidFile('clarity_protocol.json', '0.01', 'Clarity Protocol Data Node'));
app.get('/podcast_full_archive.json',  handlePaidFile('podcast_full_archive.json',  '5.00',  'Full Intelligence Archive'));
app.get('/universal_library.json',     handlePaidFile('universal_library.json',     '10.00', 'The Master Universal Library'));
app.get('/clarity_prompt_schema.json', handlePaidFile('clarity_prompt_schema.json', '2.50',  'Clarity Protocol Prompt Engine'));

// Landing Page
app.get('/', (req, res) => {
  res.send(`
    <html>
      <body style="font-family: sans-serif; padding: 40px; text-align: center;">
        <h1 style="color: #2c3e50;">HGICG Truth Node (Active)</h1>
        <p>Registry ID: <strong>44259</strong> | Status: <span style="color: green;">Healthy</span></p>
        <p>This node serves high-fidelity intelligence for AI agents.</p>
        <hr style="width: 50%; margin: 20px auto;">
        <p>
          <a href="/llms.txt">/llms.txt</a> |
          <a href="/identity.jsonld">/identity.jsonld</a> |
          <a href="/.well-known/payment.json">Payment Manifest</a> |
          <a href="/ai.json">OpenAPI Spec</a> |
          <a href="/.well-known/agent-card.json">Agent Card</a>
        </p>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`HGICG Truth Node Live on port ${PORT}`);
});
