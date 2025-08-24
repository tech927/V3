const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys')
const pino = require('pino')
const fs = require('fs')
const path = require('path')
const messageHandler = require('./messageHandler')

const activeSessions = new Map()

async function createSession(phoneNumber, sessionDir) {
    try {
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir)
        const { version } = await fetchLatestBaileysVersion()

        const sock = makeWASocket({
            logger: pino({ level: 'silent' }),
            auth: state,
            version,
            printQRInTerminal: false
        })

        sock.ev.on('creds.update', saveCreds)

        sock.ev.on('connection.update', (update) => {
            const { connection } = update
            if (connection === 'open') {
                console.log(`✅ Sous-bot connecté pour ${phoneNumber}`)
                
                // Envoyer un message au propriétaire
                sock.sendMessage(phoneNumber + '@s.whatsapp.net', { 
                    text: '✅ Votre bot personnel est en ligne !\nVous êtes défini comme propriétaire.' 
                })
            }
        })

        // Initialiser le handler de messages pour cette session
        sock.ev.on('messages.upsert', async (messageInfo) => {
            await messageHandler(sock, messageInfo, phoneNumber)
        })

        activeSessions.set(phoneNumber, sock)
        return sock

    } catch (error) {
        console.error(`❌ Erreur lors de la création de la session pour ${phoneNumber}:`, error)
        throw error
    }
}

function getSession(phoneNumber) {
    return activeSessions.get(phoneNumber)
}

function getAllSessions() {
    return Array.from(activeSessions.keys())
}

function removeSession(phoneNumber) {
    const session = activeSessions.get(phoneNumber)
    if (session) {
        session.ws.close()
        activeSessions.delete(phoneNumber)
    }
}

module.exports = {
    createSession,
    getSession,
    getAllSessions,
    removeSession
          }
