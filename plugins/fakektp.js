import axios from 'axios'
import FormData from 'form-data'

async function uguu(buffer) {
  const form = new FormData()
  form.append('files[]', buffer, 'ktp.jpg')

  const { data } = await axios.post('https://uguu.se/upload', form, {
    headers: form.getHeaders()
  })

  return data.files[0].url
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  await m.react('🪪')

  if (!text) {
    return conn.sendMessage(m.chat, {
      text: `🪪 *FAKE KTP GENERATOR*

📌 *Cara pakai:*
Reply foto lalu ketik:
${usedPrefix + command} nama|nik|provinsi|kota|ttl|jk|alamat|rt/rw|kel|kec|agama|status|pekerjaan|negara|masa|terbuat

📌 *Contoh:*
${usedPrefix + command} Ytta Acumalaka|3241211234010001|JAWA BARAT|CIREBON|Cirebon, 01-01-2000|Laki-laki|Jl. Mawar No.1|001/002|Kejaksan|Kejaksan|Islam|Belum Kawin|Pelajar|WNI|Seumur Hidup|Cirebon

💡 Pastikan reply *foto wajah* ya`
    }, { quoted: global.fstatus })
  }

  let q = m.quoted
  if (!q) {
    return conn.sendMessage(m.chat, {
      text: '⚠️ Reply fotonya dulu buat dijadiin KTP.'
    }, { quoted: global.fstatus })
  }

  let mime = (q.msg || q).mimetype || ''
  if (!mime.startsWith('image/')) {
    return conn.sendMessage(m.chat, {
      text: '⚠️ Yang direply harus gambar.'
    }, { quoted: global.fstatus })
  }

  try {
    let [
      nama, nik, provinsi, kota, ttl, jk, alamat,
      rt_rw, kel, kec, agama, status, pekerjaan,
      negara, masa, terbuat
    ] = text.split('|')

    if (!nama || !nik) throw 'input kurang'

    let buffer = await q.download()
    let url = await uguu(buffer)

    await new Promise(r => setTimeout(r, 1200))

    const apiUrl = `https://api.zenzxz.my.id/maker/fakektp?` +
      `provinsi=${encodeURIComponent(provinsi)}` +
      `&kota=${encodeURIComponent(kota)}` +
      `&nik=${encodeURIComponent(nik)}` +
      `&nama=${encodeURIComponent(nama)}` +
      `&ttl=${encodeURIComponent(ttl)}` +
      `&jenis_kelamin=${encodeURIComponent(jk)}` +
      `&golongan_darah=${encodeURIComponent('-')}` +
      `&alamat=${encodeURIComponent(alamat)}` +
      `&rt_rw=${encodeURIComponent(rt_rw)}` +
      `&kel_desa=${encodeURIComponent(kel)}` +
      `&kecamatan=${encodeURIComponent(kec)}` +
      `&agama=${encodeURIComponent(agama)}` +
      `&status=${encodeURIComponent(status)}` +
      `&pekerjaan=${encodeURIComponent(pekerjaan)}` +
      `&kewarganegaraan=${encodeURIComponent(negara)}` +
      `&masa_berlaku=${encodeURIComponent(masa)}` +
      `&terbuat=${encodeURIComponent(terbuat)}` +
      `&url=${encodeURIComponent(url)}`

    const res = await axios.get(apiUrl, {
      responseType: 'arraybuffer',
      headers: { Accept: 'image/*' },
      timeout: 20000
    })

    if (!res.headers['content-type']?.startsWith('image/')) throw 'invalid'

    await conn.sendMessage(m.chat, {
      image: res.data,
      caption: '🪪 Fake KTP berhasil dibuat'
    }, { quoted: global.fstatus })

  } catch (e) {
    console.error(e)
    conn.sendMessage(m.chat, {
      text: '❌ Yahh Error, cek format inputnya ya'
    }, { quoted: global.fstatus })
  }
}

handler.help = ['fakektp']
handler.tags = ['maker']
handler.command = /^fakektp$/i


export default handler