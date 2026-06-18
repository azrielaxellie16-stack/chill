console.log('PAIR PLUGIN MASUK')

import * as baileys from 'baileys'
import Pino from 'pino'
import NodeCache from 'node-cache'

const {
  makeWASocket,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  delay
} = baileys

let handler = async (m, { conn, text }) => {
  if (!text) throw 'Masukkan nomornya'

  await m.react('✨')

  let [nomor, jumlah] = text.split(" ");
  let ajng = "start/session/spams/" + m.sender.split("@")[0];

  const { state } = await useMultiFileAuthState(ajng);
  const cache = new NodeCache();

  m.reply(`Process Request :
- Number : ${nomor}
- Total : ${jumlah || 2}`);

  const sock = makeWASocket({
    logger: Pino({ level: "fatal" }),
    printQRInTerminal: false,
    mobile: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "fatal" }))
    },
    version: [2, 3000, 1015901307],
    browser: ["Ubuntu", "Edge", "110.0.1587.56"],
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
    msgRetryCounterCache: cache
  });

  sock.ev.on('connection.update', async (update) => {
  const { connection } = update

  if (connection === 'open') {
    console.log('✅ Connected, mulai pairing...')

    for (let i = 0; i < (+jumlah || 2); i++) {
      try {
        let pairing = await sock.requestPairingCode(nomor)

        let code = pairing?.match(/.{1,4}/g)?.join("-") || pairing
        console.log("😜 Pairing Code:", code)

        m.reply(`Pairing Code:\n${code}`)

        await delay(8000) // biar aman
      } catch (e) {
        console.error('❌ Gagal pairing:', e)
        m.reply('Gagal ambil pairing code')
        break
      }
    }
  }

  if (connection === 'close') {
    console.log('❌ Connection closed')
  }
})
};

handler.help = ["pair"];
handler.tags = ["owner"];
handler.command = /^pair$/i;

export default handler;
