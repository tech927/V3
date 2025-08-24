const commandHandler = require('./commandHandler')
require('dotenv').config()

module.exports = async (sock, messageInfo, ownerNumber = null) => {
    try {
        const message = messageInfo.messages[0]
        if (!message || message.key.fromMe) return

        const isGroup = message.key.remoteJid.endsWith('@g.us')
        const from = isGroup ? message.key.participant : message.key.remoteJid
        const sender = from.split('@')[0]
        
        // Déterminer le propriétaire
        const actualOwner = ownerNumber || process.env.OWNER_NUMBER
        
        // Vérifier si le message est une commande
        const body = message.message?.conversation || 
                    message.message?.extendedTextMessage?.text || 
                    message.message?.imageMessage?.caption || ''
        
        const prefix = process.env.PREFIX || '.'
        
        if (body.startsWith(prefix)) {
            const command = body.slice(prefix.length).trim().split(' ')[0].toLowerCase()
            const args = body.slice(prefix.length + command.length).trim().split(' ')
            
            await commandHandler(sock, message, {
                command,
                args,
                isGroup,
                sender,
                owner: actualOwner,
                body
            })
        }
    } catch (error) {
        console.error('❌ Erreur dans le messageHandler:', error)
    }
}
