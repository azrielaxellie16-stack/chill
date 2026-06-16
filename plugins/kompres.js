import axios from 'axios'

async function kompresBuffer(imageBuffer, contentType) {
  const storeRes = await axios.post('https://tinypng.com/backend/opt/store', imageBuffer, {
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/octet-stream',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  })

  const { key, size: originalSize } = storeRes.data

  const processRes = await axios.post('https://tinypng.com/backend/opt/process', {
    key,
    originalType: contentType,
    originalSize
  }, {
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  })

  return { originalSize, ...processRes.data }
}

let handler = async (m, { conn, usedPrefix, command }) => {
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''

  if (!/image/.test(mime)) return m.reply(`Kirim atau balas gambar dengan *${usedPrefix + command}*`)

  await m.react('⏳')

  try {
    const img = await q.download()
    const result = await kompresBuffer(img, mime)

    const fmt = b => b < 1024 ? `${b} B` : b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 * 1024)).toFixed(2)} MB`
    const hemat = (((result.originalSize - result.size) / result.originalSize) * 100).toFixed(1)

    const tanggal = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })

    const caption =
      `*≡ K O M P R E S - G A M B A R ≡*\n\n` +
      `      Raw  : ${fmt(result.originalSize)}\n` +
      `      New  : ${fmt(result.size)}\n` +
      `      Hemat: ${hemat}%\n` +
      `      Size : ${result.width}x${result.height}` 

    const { data: resultBuf } = await axios.get(result.url, { responseType: 'arraybuffer' })

    await conn.sendMessage(m.chat, { image: Buffer.from(resultBuf), caption }, { quoted: m })
    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply('❌ Gagal kompres gambar')
  }
}

handler.help = ['kompres', 'compress']
handler.tags = ['tools']
handler.command = /^(kompres|compress)$/i
handler.limit = true

export default handler