import { Sticker } from 'wa-sticker-formatter'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'
import { tmpdir } from 'os'
import { join } from 'path'
import fs from 'fs'

ffmpeg.setFfmpegPath(ffmpegPath)

// 🔥 fungsi auto compress video
const compressVideo = (inputBuffer) => {
  return new Promise((resolve, reject) => {
    const inputPath = join(tmpdir(), `input_${Date.now()}.mp4`)
    const outputPath = join(tmpdir(), `output_${Date.now()}.mp4`)

    fs.writeFileSync(inputPath, inputBuffer)

    ffmpeg(inputPath)
      .outputOptions([
        '-vf scale=512:512:force_original_aspect_ratio=decrease',
        '-vf pad=512:512:(ow-iw)/2:(oh-ih)/2',
        '-r 15',          // fps biar ringan & support WA
        '-t 6',           // max 6 detik
        '-preset ultrafast',
        '-crf 32'         // compress kuat
      ])
      .save(outputPath)
      .on('end', () => {
        const buffer = fs.readFileSync(outputPath)
        fs.unlinkSync(inputPath)
        fs.unlinkSync(outputPath)
        resolve(buffer)
      })
      .on('error', (err) => {
        fs.unlinkSync(inputPath)
        reject(err)
      })
  })
}

let handler = async (m, { conn }) => {
  let quoted = m.quoted ? m.quoted : m
  let mime = (quoted.msg || quoted).mimetype || ''

  if (!/image|video|gif/.test(mime)) {
    return m.reply('Reply/kirim gambar, video, atau gif!')
  }

  let isAnimated = /video|gif/.test(mime)

  try {
    let media = await quoted.download()

    // 🔥 AUTO COMPRESS kalau video/gif
    if (isAnimated) {
      media = await compressVideo(media)
    }

    let sticker = new Sticker(media, {
      pack: 'MyBot',
      author: 'Agyss',
      type: 'full',
      quality: 100,

      // 🔥 biar selalu gerak
      animated: isAnimated,
      fps: 15,
      loop: 0
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
