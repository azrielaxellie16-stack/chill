import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text) throw 'Input URL Telegram Sticker!\nExample: ' + usedPrefix + command + ' https://t.me/addstickers/Hlmn4'
let res = await fetch('https://api.nexray.eu.cc/tools/telegram-sticker?url=' + encodeURIComponent(text))
let json = await res.json()
if (!json.status) throw 'Failed to fetch stickers'
let stickers = json.result.sticker
for (let i = 0; i < stickers.length; i++) {
await conn.sendFile(m.chat, stickers[i].url, 'sticker.webp', '', m, false, { asSticker: true })
}
}

handler.help = ['telesticker']
handler.tags = ['tools']
handler.command = /^(telesticker|tgsticker)$/i

export default handler