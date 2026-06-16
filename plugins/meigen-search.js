import fetch from 'node-fetch'
 
const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `Gunakan: ${usedPrefix}${command} <kata kunci>`, m)
  }
 
  try {
    const res = await fetch(`https://www.meigen.ai/api/search?q=${encodeURIComponent(text)}`)
    const json = await res.json()
 
    if (!json.success || !json.data?.length) {
      return conn.reply(m.chat, 'Prompt tidak ditemukan', m)
    }
 
    const data = json.data[Math.floor(Math.random() * json.data.length)]
 
    let caption = `— meigen search —
 
❀ Query: ${text}
❀ Author: ${data.author_display_name}
❀ Username: @${data.author_username}
❀ Model: ${data.model}
 
❀ Stats
• Likes: ${data.likes}
• Views: ${data.views}
• Favorites: ${data.favorites_count}
 
❀ Prompt
${data.text.length > 1500 ? data.text.slice(0, 1500) + '...' : data.text}`
 
    await conn.sendFile(
      m.chat,
      data.thumbnail_url,
      'meigen.jpg',
      caption,
      m,
      false,
      {
        mentions: [`${data.author_username}@s.whatsapp.net`]
      }
    )
  } catch (error) {
    return conn.reply(m.chat, `Error: ${error.message}`, m)
  }
}
 
handler.help = ['meigen <query>']
handler.tags = ['search']
handler.command = /^meigen$/i
 
export default handler