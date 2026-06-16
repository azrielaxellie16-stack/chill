/**
 * Sonu AI Music
 * -----------------------------
 * Type    : Plugins ESM
 * Creator : Hilman
 * Channel : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
 * API     : https://omegatech-api.dixonomega.tech
 */

import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Masukkan prompt!\nContoh: ${usedPrefix + command} A woman running`

  m.reply('Sedang memproses, mohon tunggu beberapa menit...')

  try {
    let res = await fetch(`https://omegatech-api.dixonomega.tech/api/ai/sonu3?action=full&prompt=${encodeURIComponent(text)}`)
    let json = await res.json()

    if (!json.success) throw 'Gagal mengambil data dari API'

    let { title, tags, duration, thumbnail, url, lyrics } = json

    let caption = `— sonu ai music —\n\n`
    caption += `❀ tags : ${tags}\n`
    caption += `❀ duration : ${duration} seconds\n\n`
    caption += `❀ title : ${title}\n\n`
    caption += `❀ lyrics :\n${lyrics}`

    await conn.sendMessage(
      m.chat,
      {
        image: { url: thumbnail },
        caption
      },
      { quoted: m }
    )

    await conn.sendMessage(
      m.chat,
      {
        audio: { url: url },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
        ptt: false
      },
      { quoted: m }
    )

  } catch (e) {
    throw 'Terjadi kesalahan sistem'
  }
}

handler.help = ['sonu']
handler.tags = ['ai']
handler.command = /^(sonu)$/i
handler.limit = true
handler.register = true

export default handler