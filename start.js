const { spawn } = require('child_process')

function startBot() {
    const bot = spawn('node', ['index.js'], { stdio: 'inherit' })
    bot.on('close', () => {
        console.log('Bot stopped. Restarting...')
        startBot()
    })
}

startBot()
