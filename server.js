const express = require("express")
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys")
const pino = require("pino")
const fs = require("fs")
const path = require("path")

require("dotenv").config()
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.get("/", (req, res) => {
  res.send("✅ WhatsApp Pair Code Server is Running!")
})

app.get("/pair", async (req, res) => {
  const phoneNumber = req.query.number
  if (!phoneNumber) {
    return res.status(400).json({ error: "⚠️ Please provide ?number=225XXXXXXXXX" })
  }

  try {
    const sessionDir = path.join(__dirname, "sessions", phoneNumber)
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true })
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir)
    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
      logger: pino({ level: "silent" }),
      auth: state,
      version,
    })

    sock.ev.on("creds.update", saveCreds)

    // Request pair code
    const code = await sock.requestPairingCode(phoneNumber)
    console.log("📌 Pair Code for", phoneNumber, "is:", code)

    res.json({ number: phoneNumber, pairCode: code })
  } catch (err) {
    console.error("❌ Error generating pair code:", err.message)
    res.status(500).json({ error: "Failed to generate pair code", details: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
