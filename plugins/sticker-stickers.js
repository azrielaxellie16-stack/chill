import { Sticker } from 'wa-sticker-formatter'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'

// penting biar ffmpeg kebaca di Node 24 / Railway
ffmpeg.setFfmpegPath(ffmpegPath)

let handler = async (m, { conn }) => {
  let quoted = m.quoted ? m.quoted : m
  let mime = (quoted.msg || quoted).mimetype || ''

  if (!/image|video|gif/.test(mime)) {
    return m.reply('Reply/kirim gambar, video, atau gif!')
  }

  // limit biar ga berat & error
  if (/video|gif/.test(mime)) {
    if ((quoted.seconds || 0) > 10) {
      return m.reply('Max video 10 detik!')
    }
  }

  try {
    let media = await quoted.download()

    let sticker = new Sticker(media, {
      pack: 'MyBot',
      author: 'Agyss',
      type: 'full',
      quality: 100,
      animated: /video|gif/.test(mime)
    })

    let buffer = await sticker.toBuffer()

    await conn.sendMessage(
      m.chat,
      { sticker: buffer },
      { quoted: m }
    )

  } catch (err) {
    console.error(err)
    m.reply('Gagal buat sticker!')
  }
}

handler.help = ['sticker', 's']
handler.tags = ['tools']
handler.command = /^(sticker|s|stiker)$/i

export default handler
