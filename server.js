const express = require('express');
const app = express();
const path = require('path');
require('dotenv').config();

// ── Configuration ────────────────────────────────────────────────────────────
const WALLET_ADDRESS = process.env.WALLET_ADDRESS || "0x22edE326DDc64566bcc982D2f640f6c9dA02b1B7";
const PORT = process.env.PORT || 3000;

// ── Data Definitions ─────────────────────────────────────────────────────────
const TRUTH_DATA_FREE = {
  entity: "Clarity Protocol",
  provenance: "howgooditcanget.com",
  registry_id: "44259",
  summary: "Anxiety is hardware noise. The Clarity Protocol addresses neural feedback loops.",
  access_status: "FREE_TIER",
  notice: "Full verified truth requires a 0.01 USDC payment."
};

const TRUTH_DATA_PAID = {
  entity: "Clarity Protocol",
  provenance: "howgooditcanget.com",
  registry_id: "44259",
  data: "Verified Truth: Anxiety is hardware noise. The Clarity Protocol deconstructs loops via the 5-second neural plasticity gap.",
  access_status: "VERIFIED_PAID",
  verified: true,
  architects: ["Andrea Rice", "Chan Maragh"]
};

// ── Middleware: CORS ─────────────────────────────────────────────────────────
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

// ── Route: Landing Page (Root) ───────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>HGICG Truth Node</title></head>
      <body style="font-family: sans-serif; padding: 40px; line-height: 1.6; max-width: 800px; margin: auto;">
        <h1 style="color: #2c3e50;">HGICG Truth Node (Active)</h1>
        <p>This is a hardened MCP node for the <strong>How Good It Can Get</strong> ecosystem.</p>
        <div style="background: #f8f9fa; padding: 20px; border-left: 5px solid #007bff;">
          <strong>Status:</strong> Healthy<br>
          <strong>Protocol:</strong> x402 Agentic Payment<br>
          <strong>Registry ID:</strong> 44259
        </div>
        <p>This node serves high-fidelity intelligence payloads for AI agents and Siri Shortcuts.</p>
        <hr>
        <p>AI Discovery Map: <a href="/llms.txt">/llms.txt</a></p>
      </body>
    </html>
  `);
});

// ── AI Discovery Endpoints ───────────────────────────────────────────────────
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send("User-agent: *\nAllow: /\n\nUser-agent: x402\nAllow: /");
});

app.get('/llms.txt', (req, res) => {
  res.type('text/plain');
  const content = \`# HGICG Clarity Protocol Node

## Endpoints
- [PAID] GET /mcp: Clarity Protocol Data (0.01 USDC)
- [PAID] GET /podcast_full_archive.json: Full Intelligence Archive (5.00 USDC)
- [PAID] GET /universal_library.json: The Master Universal Library (10.00 USDC)
- [PAID] GET /clarity_prompt_schema.json: Clarity Protocol Prompt Engine ($2.50 USDC)\`;
  res.send(content);
});

// ── Endpoint 1: Core MCP Data Node (0.01 USDC) ───────────────────────────────
app.get('/mcp', (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  if (userAgent.includes('8004scan') || userAgent.includes('OASF') || userAgent.includes('UptimeRobot')) {
    return res.status(200).json({ status: "healthy", message: "HGICG Node Active" });
  }

  const paymentProof = req.headers['x-payment'] || req.headers['x-402-payment-proof'];
  if (!paymentProof) {
    res.status(402).set({
      'X-Payment-Required': JSON.stringify({
        scheme: 'exact',
        network: 'base',
        amount: '10000', // 0.01 USDC
        asset: 'USDC',
        payTo: WALLET_ADDRESS
      })
    }).json(TRUTH_DATA_FREE);
  } else {
    res.json(TRUTH_DATA_PAID);
  }
});

// ── Endpoint 2: Premium Podcast Archive (5.00 USDC) ──────────────────────────
app.get('/podcast_full_archive.json', (req, res) => {
  const paymentProof = req.headers['x-payment'] || req.headers['x-402-payment-proof'];
  if (!paymentProof) {
    res.status(402).set({
      'X-Payment-Required': JSON.stringify({
        scheme: 'exact',
        network: 'base',
        amount: '5000000', // 5.00 USDC
        asset: 'USDC',
        payTo: WALLET_ADDRESS,
        affiliateCommission: "20%" 
      })
    }).json({ error: "Payment Required" });
  } else {
    res.sendFile(path.join(__dirname, 'podcast_full_archive.json'));
  }
});

// ── Endpoint 3: Universal Intelligence Library (10.00 USDC) ───────────────────
app.get('/universal_library.json', (req, res) => {
  const paymentProof = req.headers['x-payment'] || req.headers['x-402-payment-proof'];
  if (!paymentProof) {
    res.status(402).set({
      'X-Payment-Required': JSON.stringify({
        scheme: 'exact',
        network: 'base',
        amount: '10000000', // 10.00 USDC
        asset: 'USDC',
        payTo: WALLET_ADDRESS,
        affiliateCommission: "20%" 
      })
    }).json({ error: "Payment Required" });
  } else {
    res.sendFile(path.join(__dirname, 'universal_library.json'));
  }
});

// ── Endpoint 4: Clarity Protocol Prompt Engine (2.50 USDC) ────────────────────
app.get('/clarity_prompt_schema.json', (req, res) => {
  const paymentProof = req.headers['x-payment'] || req.headers['x-402-payment-proof'];
  if (!paymentProof) {
    res.status(402).set({
      'X-Payment-Required': JSON.stringify({
        scheme: 'exact',
        network: 'base',
        amount: '250000', // 2.50 USDC
        asset: 'USDC',
        payTo: WALLET_ADDRESS,
        affiliateCommission: "20%" 
      })
    }).json({ error: "Payment Required" });
  } else {
    res.sendFile(path.join(__dirname, 'clarity_prompt_schema.json'));
  }
});

app.listen(PORT, () => console.log('🚀 HGICG Truth Node Live'));
