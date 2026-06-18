import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'
import { tmpdir } from 'os'
import { join } from 'path'
import fs from 'fs'

ffmpeg.setFfmpegPath(ffmpegPath)

// 🔥 CONVERT LANGSUNG KE WEBP (LEBIH STABIL)
const toWebp = (buffer, isAnimated) => {
  return new Promise((resolve, reject) => {
    const input = join(tmpdir(), `in_${Date.now()}.mp4`)
    const output = join(tmpdir(), `out_${Date.now()}.webp`)

    fs.writeFileSync(input, buffer)

    let command = ffmpeg(input)

    if (isAnimated) {
      command.outputOptions([
        // 🔥 FULL OPTIMIZE
        '-vcodec libwebp',
        '-vf scale=512:512:force_original_aspect_ratio=decrease,fps=12,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0.0',
        '-loop 0',
        '-ss 0',
        '-t 5',
        '-preset default',
        '-an',
        '-vsync 0'
      ])
    } else {
      command.outputOptions([
        '-vcodec libwebp',
        '-vf scale=512:512:force_original_aspect_ratio=decrease',
        '-lossless 0',
        '-qscale 75'
      ])
    }

    command
      .save(output)
      .on('end', () => {
        let result = fs.readFileSync(output)

        fs.unlinkSync(input)
        fs.unlinkSync(output)

        resolve(result)
      })
      .on('error', (err) => {
        try { fs.unlinkSync(input) } catch {}
        reject(err)
      })
  })
}

let handler = async (m, { conn }) => {
  let quoted = m.quoted ? m.quoted : m
  let mime = (quoted.msg || quoted).mimetype || ''

  if (!/image|video|gif/.test(mime)) {
    return m.reply('Reply gambar/video/gif!')
  }

  let isAnimated = /video|gif/.test(mime)

  try {
    let media = await quoted.download()

    // 🔥 LANGSUNG CONVERT KE WEBP (BYPASS FORMATTER)
    let webp = await toWebp(media, isAnimated)

    await conn.sendMessage(
      m.chat,
      { sticker: webp },
      { quoted: m }
    )

  } catch (e) {
    console.error(e)
    m.reply('Gagal convert sticker!')
  }
}

handler.help = ['sticker', 's']
handler.tags = ['tools']
handler.command = /^(s|sticker)$/i
handler.limit = false

export default handler
