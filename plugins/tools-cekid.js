const handler = async (m, { conn, text, command }) => {
  try {
    await m.react('🆔')

    if (/^(cekidgc|cekidgrup)$/i.test(command)) {
      if (!m.isGroup) return m.reply('❌ Fitur ini hanya bisa dipakai di grup.')

      let teks = `
— cek id —

❀ id grup :
${m.chat}
`

      return await conn.sendMessage(m.chat, {
        text: teks
      }, { quoted: m })
    }

    if (/^(cekidch|idch)$/i.test(command)) {
      if (!text) {
        return m.reply('❌ Masukkan link channel WhatsApp.')
      }

      if (!text.includes('https://whatsapp.com/channel/')) {
        return m.reply('❌ Link channel tidak valid.')
      }

      let result = text.split('https://whatsapp.com/channel/')[1].split('?')[0].trim()

      let res = await conn.newsletterMetadata('invite', result).catch(() => null)

      let id = res?.id || result + '@newsletter'

      let teks = `
— cek id —

❀ id saluran :
${id}
`

      return await conn.sendMessage(m.chat, {
        text: teks
      }, { quoted: m })
    }

  } catch (e) {
    console.log(e)
    m.reply('❌ Terjadi kesalahan.')
  }
}

handler.help = ['cekidgc', 'cekidgrup', 'cekidch', 'idch']
handler.tags = ['tools']
handler.command = /^(cekidgc|cekidgrup|cekidch|idch)$/i

export default handler