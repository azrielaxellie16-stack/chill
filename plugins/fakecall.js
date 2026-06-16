import axios from 'axios'
import FormData from 'form-data'

async function uguu(buffer) {
  try {
    const form = new FormData()
    form.append('files[]', buffer, {
      filename: 'image.jpg',
      contentType: 'image/jpeg'
    })

    const res = await axios.post(
      'https://uguu.se/upload.php',
      form,
      { headers: form.getHeaders() }
    )

    return res.data?.files?.[0]?.url || null
  } catch (e) {
    console.log(e)
    return null
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''

  if (!text) {
    throw `Contoh:
${usedPrefix + command} url|nama|durasi
Reply gambar:
${usedPrefix + command} nama|durasi`
  }

  await m.react('🕒')

  try {
    let avatar, nama, durasi
    let args = text.split('|').map(v => v?.trim())

    if (args.length === 3) {
      ;[avatar, nama, durasi] = args
    } else if (args.length === 2) {
      if (!/image/.test(mime)) {
        throw 'Reply gambar untuk avatar.'
      }

      let media = await q.download()
      if (!media) throw 'Gagal mengambil gambar.'

      avatar = await uguu(media)
      if (!avatar) throw 'Gagal upload gambar.'

      ;[nama, durasi] = args
    } else {
      throw 'Format salah.'
    }

    let api = `https://api.cuki.biz.id/api/canvas/fakecall?apikey=cuki-x&nama=${encodeURIComponent(nama)}&durasi=${encodeURIComponent(durasi)}&avatar=${encodeURIComponent(avatar)}`

    let res = await fetch(api)
    let buffer = Buffer.from(await res.arrayBuffer())

    await conn.sendMessage(m.chat, {
      image: buffer
    }, { quoted: global.fstatus })

  } catch (e) {
    m.reply(typeof e === 'string' ? e : '❌ Gagal membuat fake call.')
  }
}

handler.help = ['fakecall']
handler.tags = ['maker']
handler.command = /^fakecall$/i
handler.limit = true

export default handler