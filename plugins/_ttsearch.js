/**
  • Fitur   : TikTok Search (Send Video + Next Video Quick Reply)
  • Type    : Plugin ESM
  • API     : https://api-faa.my.id
  • Author : Hilman + Tombol Next Video
**/

import fetch from 'node-fetch'

let handler = async (m, { text, usedPrefix, command, conn, _p }) => {
  try {
    await m.react('✨')

    if (!text) {
      return m.reply(
        `Contoh:\n` +
        `${usedPrefix + command} erine jkt48 edit\n` +
        `${usedPrefix + command} anime edit`
      )
    }

    const query = text.trim()
    if (!query) return m.reply('❌ Kata kunci kosong.')

    // Cari TikTok
    const res = await (
      await fetch(`https://api-faa.my.id/faa/tiktok-search?q=${encodeURIComponent(query)}`)
    ).json()

    if (!res?.status || !Array.isArray(res.result) || res.result.length === 0) {
      return m.reply(`❌ Tidak ada hasil untuk "${query}"`)
    }

    // Pilih video random
    const pick = res.result[Math.floor(Math.random() * res.result.length)]

    // Kirim video dengan tombol Quick Reply Next Video
await conn.sendButton(
  m.chat,
  {
    video: { url: pick.url_nowm },
    caption:
      `# *TIKTOK SEARCH*\n\n` +
      `> *Query*: ${query}\n` +
      `> *Judul*: ${pick.title || '-'}\n` +
      `> *Uploader*: ${pick.author?.nickname || pick.author?.username || '-'}\n` +
      `> *Durasi*: ${pick.duration}\n` +
      `> *Views*: ${pick.stats?.views || '-'}`,
    footer: global.namebot,
    buttons: [
      {
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: '🎥 Next Video',
          id: `${usedPrefix}${command} ${query}`
        })
      }
    ]
  },
  { quoted: m }
)
  } catch (e) {
    console.error(e)
    m.reply('❌ Terjadi kesalahan.')
  }
}

handler.help = ['ttsearch', 'tiktoksearch']
handler.tags = ['search']
handler.command = /^(ttsearch|tiktoksearch)$/i
handler.limit = true

export default handler