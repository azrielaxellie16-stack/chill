import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'
import { tmpdir } from 'os'
import { join } from 'path'
import fs from 'fs'

ffmpeg.setFfmpegPath(ffmpegPath)

const toWebp = (buffer, isAnimated) => {
  return new Promise((resolve, reject) => {
    const input = join(tmpdir(), `in_${Date.now()}.mp4`)
    const output = join(tmpdir(), `out_${Date.now()}.webp`)

    fs.writeFileSync(input, buffer)

    let cmd = ffmpeg(input)

    if (isAnimated) {
      cmd.outputOptions([
        '-vcodec libwebp',

        // 🔥 NO GEPENG + AUTO FIT + TRANSPARENT
        '-vf scale=512:512:force_original_aspect_ratio=decrease,fps=12,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0.0',

        '-loop 0',
        '-t 5',
        '-preset default',
        '-an',
        '-vsync 0'
      ])
    } else {
      cmd.outputOptions([
        '-vcodec libwebp',

        // 🔥 IMAGE JUGA NO GEPENG
        '-vf scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2',

        '-qscale 70'
      ])
    }

    cmd.save(output)
      .on('end', () => {
        let res = fs.readFileSync(output)
        fs.unlinkSync(input)
        fs.unlinkSync(output)
        resolve(res)
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
    let webp = await toWebp(media, isAnimated)

    await conn.sendMessage(m.chat, { sticker: webp }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('Gagal buat sticker!')
  }
}

handler.help = ['sticker', 's']
handler.tags = ['tools']
handler.command = /^(s|sticker)$/i
handler.limit = false

export default handler
