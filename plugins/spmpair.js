import * as baileys from 'baileys'
import Pino from 'pino'
import NodeCache from 'node-cache'

const {
  makeWASocket,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  delay,
  fetchLatestBaileysVersion
} = baileys

let handler = async (m, { text }) => {
  if (!text) throw 'Masukkan nomor! contoh: .pair 628xxx 100'

  await m.react('🔥')

  let [nomor, jumlah] = text.split(" ")
  jumlah = Math.min(+jumlah || 1, 100) // 🔥 max 100

  if (!nomor.startsWith('62')) {
    return m.reply('Gunakan format 62xxxx')
  }

  let sessionPath = `./session/pair-${m.sender.split("@")[0]}`
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
  const cache = new NodeCache()

  const { version } = await fetchLatestBaileysVersion()

  m.reply(`🚀 Start Pairing
- Number: ${nomor}
- Total: ${jumlah}
- Mode: Slow Safe`)

  const sock = makeWASocket({
    version,
    logger: Pino({ level: "silent" }),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "silent" }))
    },
    browser: ["Ubuntu", "Chrome", "120.0.0.0"],
    markOnlineOnConnect: true,
    msgRetryCounterCache: cache
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async (update) => {
    const { connection } = update

    if (connection === 'open') {
      console.log('✅ Connected')

      for (let i = 0; i < jumlah; i++) {
        try {
          let pairing = await sock.requestPairingCode(nomor)

          let code = pairing?.match(/.{1,4}/g)?.join('-') || pairing

          console.log(`PAIR ${i + 1}:`, code)

          // kirim tiap 5 biar ga spam chat
          if (i % 5 === 0) {
            m.reply(`Pair ${i + 1}/${jumlah}\n${code}`)
          }

          await delay(15000) // 🔥 WAJIB 15 detik (kunci utama)
        } catch (e) {
          console.error('❌ Stop karena limit:', e)
          m.reply(`❌ Stop di ${i} (kena limit WA)`)
          break
        }
      }

      m.reply('✅ Selesai pairing')
    }

    if (connection === 'close') {
      console.log('❌ Connection closed (normal kalau limit)')
    }
  })
}

handler.help = ['pair']
handler.tags = ['owner']
handler.command = /^pair$/i

export default handler
