import fetch from 'node-fetch'
 
let handler = async (m, { conn, text }) => {
  if (!text) throw 'Masukkan judul lagu!'
 
  await m.react('🕒')
 
  try {
    let res = await fetch(
      `https://kaizenapi.my.id/search/geniuslirik?q=${encodeURIComponent(text)}`
    )
 
    let json = await res.json()
 
    if (!json.status) throw 'Yahh error.'
 
    let data = json.result
 
    let lyrics = data.lyrics || '-'
 
    if (lyrics.length > 4000) {
      lyrics = lyrics.slice(0, 4000) + '\n\n...'
    }
 
    let caption = `LIRIK LAGU
 
❀ Judul : ${data.title}
 
${lyrics}`
 
    await conn.sendMessage(
      m.chat,
      {
        image: { url: data.thumbnail },
        caption
      },
      { quoted: m }
    )
 
  } catch (e) {
    throw 'Yahh error.'
  }
}
 
handler.help = ['lirik <judul lagu>']
handler.tags = ['internet']
handler.command = /^(lirik|lyrics)$/i
handler.limit = true
 
export default handler