const express = require('express');
const path = require('path');
const app = express();
require('dotenv').config();

// ── 1. Configuration ──────────────────────────────────────────────────────────
const WALLET = process.env.WALLET_ADDRESS || "0x22edE326DDc64566bcc982D2f640f6c9dA02b1B7";
const PORT = process.env.PORT || 3000;

// ── 2. Middleware: CORS & Cache-Busting ───────────────────────────────────────
app.use((req, res, next) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Payment, X-402-Payment-Proof',
    'Access-Control-Expose-Headers': 'X-Payment-Required, x-402-payment-required',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ── 3. Bot Detection (8004 Oracle bypass) ────────────────────────────────────
const isRegistryBot = (req) => {
  const ua = req.headers['user-agent'] || '';
  return ua.includes('8004scan') || ua.includes('ERC-8004') || ua.includes('OASF') || ua.includes('AltLayer');
};

// ── 4. Identity & Health ──────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ status: "Healthy", agentId: "44259" });
});

app.get('/identity.jsonld', (req, res) => {
  res.set('Content-Type', 'application/ld+json; charset=utf-8');
  res.sendFile(path.join(__dirname, 'identity.jsonld'), (err) => {
    if (err) {
      console.error('identity.jsonld error:', err);
      res.status(500).send('File error: ' + err.message);
    }
  });
});

app.get('/llms.txt', (req, res) => {
  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.sendFile(path.join(__dirname, 'llms.txt'), (err) => {
    if (err) {
      console.error('llms.txt error:', err);
      res.status(500).send('File error: ' + err.message);
    }
  });
});

// ── 5. OpenAPI Discovery ──────────────────────────────────────────────────────
app.get('/ai.json', (req, res) => {
  res.set('Content-Type', 'application/json; charset=utf-8');
  res.json({
    "openapi": "3.1.0",
    "info": {
      "title": "How Good It Can Get — Clarity Protocol API",
      "description": "Agentic access to the Clarity Protocol methodology for neuro-biological anxiety deconstruction.",
      "version": "1.0.0",
      "contact": {
        "name": "How Good It Can Get",
        "url": "https://howgooditcanget.com"
      }
    },
    "servers": [
      { "url": "https://ai.howgooditcanget.com", "description": "Clarity Protocol AI Node" }
    ],
    "paths": {
      "/mcp": {
        "post": {
          "summary": "Clarity Protocol MCP Tool",
          "description": "Execute Clarity Protocol pattern deconstruction. Requires x402 payment of 0.01 USDC on Base.",
          "responses": {
            "200": { "description": "Clarity Protocol response" },
            "402": { "description": "Payment required" }
          }
        }
      },
      "/llms.txt": {
        "get": {
          "summary": "AI Discovery File",
          "description": "Public discovery manifest for AI agents. No payment required.",
          "responses": {
            "200": { "description": "llms.txt content" }
          }
        }
      },
      "/identity.jsonld": {
        "get": {
          "summary": "Agent Identity",
          "description": "ERC-8004 identity document. No payment required.",
          "responses": {
            "200": { "description": "JSON-LD identity" }
          }
        }
      },
      "/clarity-protocol": {
        "get": {
          "summary": "Get Clarity Protocol Definition",
          "description": "Returns the official Clarity Protocol methodology. Requires 0.05 USDC on Base.",
          "responses": {
            "200": { "description": "Protocol definition returned" },
            "402": { "description": "Payment required" }
          }
        }
      }
    }
  });
});

// ── 6. Agent Discovery: Well-Known Payment Manifest ──────────────────────────
app.get('/.well-known/payment.json', (req, res) => {
  res.json({
    "version": "1.0",
    "provider": "How Good It Can Get",
    "description": "Clarity Protocol AI Data Node — x402 micropayment access",
    "endpoints": [
      {
        "path": "/mcp",
        "method": "POST",
        "price": "0.01",
        "currency": "USDC",
        "network": "base",
        "wallet": "0x22edE326DDc64566bcc982D2f640f6c9dA02b1B7"
      }
    ],
    "authority_ledger": "https://github.com/Chandrea2026/Anxiety-Clarity-Truth-Ledger"
  });
});

// ── 7. Product Endpoints (x402 Gated) ────────────────────────────────────────
const handlePaidFile = (fileName, amount, description) => (req, res) => {
  const paymentProof = req.headers['x-payment'] || req.headers['x-402-payment-proof'];
  if (isRegistryBot(req) || paymentProof) {
    res.sendFile(path.join(__dirname, fileName));
  } else {
    res.status(402).set({
      'X-Payment-Required': JSON.stringify({
        scheme: 'exact', network: 'base', asset: 'USDC',
        amount: amount, payTo: WALLET
      }),
      'x-402-payment-required': `dest=${WALLET}; amount=${(amount/1000000).toFixed(2)}; asset=USDC; network=base`
    }).json({ error: "Payment Required", message: description });
  }
};

app.post('/mcp', handlePaidFile('identity.jsonld', '10000', 'Clarity Protocol Data Node'));
app.get('/mcp', handlePaidFile('identity.jsonld', '10000', 'Clarity Protocol Data Node'));
app.get('/podcast_full_archive.json', handlePaidFile('podcast_full_archive.json', '5000000', 'Full Intelligence Archive'));
app.get('/universal_library.json', handlePaidFile('universal_library.json', '10000000', 'The Master Universal Library'));
app.get('/clarity_prompt_schema.json', handlePaidFile('clarity_prompt_schema.json', '2500000', 'Clarity Protocol Prompt Engine'));

// ── 8. Landing Page ───────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send(`
    <html>
    <body style="font-family: sans-serif; padding: 40px; text-align: center;">
      <h1>HGICG Truth Node (Active)</h1>
      <p>Registry ID: 44259 | Status: Healthy</p>
      <p>This node serves high-fidelity intelligence for AI agents.</p>
      <hr style="width: 50%; margin: 20px auto;">
      <p>
        <a href="/llms.txt">AI Discovery: /llms.txt</a> |
        <a href="/identity.jsonld">Identity: /identity.jsonld</a> |
        <a href="/.well-known/payment.json">Payment Manifest</a> |
        <a href="/ai.json">OpenAPI: /ai.json</a>
      </p>
    </body>
    </html>
  `);
});

// ── 9. Start Server ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('🚀 HGICG Truth Node Live on port', PORT);
});
