import { igdl } from 'ruhend-scraper';

const emoji = '📥';
const rwait = '⏳';
const done = '✅';
const error = '❌';
const msm = '⚠️';

const handler = async (m, { args, conn }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `${emoji} Masukkan link Instagram!`, m);
  }

  try {
    await m.react(rwait);

    const res = await igdl(args[0]);

    if (!res || !res.data || res.data.length === 0) {
      throw new Error('No media found');
    }

    for (let media of res.data) {
      let ext = media.url.includes('.mp4') ? 'mp4' : 'jpg';

      await conn.sendFile(
        m.chat,
        media.url,
        `instagram.${ext}`,
        `${emoji} Nih hasilnya 👇`,
        m
      );
    }

    await m.react(done);

  } catch (e) {
    console.log(e);
    await m.react(error);
    return conn.reply(m.chat, `${msm} Gagal download, mungkin video Private atau batasan usia.`, m);
  }
};

handler.command = ['instagram', 'ig'];
handler.tags = ['downloader'];
handler.help = ['instagram <url>'];


export default handler;