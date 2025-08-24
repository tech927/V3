const messageHandler = require('./messageHandler')

module.exports = (sock) => {
    console.log('🔄 Handler principal initialisé')

    // Rediriger les messages vers le messageHandler
    sock.ev.on('messages.upsert', async (messageInfo) => {
        await messageHandler(sock, messageInfo)
    })
}
