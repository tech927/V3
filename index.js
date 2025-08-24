const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys')
const pino = require('pino')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

// Charger les handlers
const mainHandler = require('./handlers/mainHandler')

async function startBot() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState('./auth_info')
        const { version } = await fetchLatestBaileysVersion()

        const sock = makeWASocket({
            logger: pino({ level: 'silent' }),
            auth: state,
            version,
            printQRInTerminal: true
        })

        sock.ev.on('creds.update', saveCreds)

        sock.ev.on('connection.update', (update) => {
            const { connection, qr } = update
            if (connection === 'open') {
                console.log("✅ Bot principal connecté avec succès!")
            }
            if (qr) {
                console.log("📱 Scannez le QR Code pour connecter le bot principal")
            }
        })

        // Initialiser le handler principal
        mainHandler(sock)

    } catch (error) {
        console.error('❌ Erreur lors du démarrage du bot:', error)
        process.exit(1)
    }
}

startBot()
