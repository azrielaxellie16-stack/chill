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

  setTimeout(async () => {
    for (let i = 0; i < (+jumlah || 2); i++) {
      let pairing = await sock.requestPairingCode(nomor);
      await delay(5000);

      let code = pairing?.match(/.{1,4}/g)?.join("-") || pairing;
      console.log("😜 Kode pairing anda : " + code);
    }
  }, 1000);
};

handler.help = ["pair"];
handler.tags = ["owner"];
handler.command = /^pair$/i;

export default handler;
