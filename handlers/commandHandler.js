const fs = require('fs')
const path = require('path')

const commandCache = new Map()

function loadCommands() {
    const commandsDir = path.join(__dirname, '..', 'inconnu', 'command')
    const commands = {}
    
    try {
        const files = fs.readdirSync(commandsDir)
        
        for (const file of files) {
            if (file.endsWith('.js')) {
                const commandName = file.slice(0, -3)
                try {
                    const commandModule = require(path.join(commandsDir, file))
                    commands[commandName] = commandModule
                } catch (error) {
                    console.error(`❌ Erreur lors du chargement de la commande ${file}:`, error)
                }
            }
        }
        
        return commands
    } catch (error) {
        console.error('❌ Erreur lors de la lecture du dossier des commandes:', error)
        return {}
    }
}

module.exports = async (sock, message, context) => {
    const { command, args, isGroup, sender, owner, body } = context
    
    // Charger les commandes si nécessaire
    if (commandCache.size === 0) {
        const commands = loadCommands()
        for (const [name, module] of Object.entries(commands)) {
            commandCache.set(name, module)
        }
    }
    
    // Exécuter la commande si elle existe
    if (commandCache.has(command)) {
        try {
            await commandCache.get(command).execute(sock, message, {
                args,
                isGroup,
                sender,
                owner,
                body
            })
        } catch (error) {
            console.error(`❌ Erreur lors de l'exécution de la commande ${command}:`, error)
            
            // Envoyer un message d'erreur
            await sock.sendMessage(message.key.remoteJid, { 
                text: '❌ Une erreur s\'est produite lors de l\'exécution de cette commande.' 
            }, { quoted: message })
        }
    }
}
