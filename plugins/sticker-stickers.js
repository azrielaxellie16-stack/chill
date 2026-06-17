import fs from "fs-extra";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import os from "os";

let handler = async (m, { conn, quoted, mime, command }) => {
  try {
    const media = quoted?.message?.imageMessage ||
                  quoted?.message?.videoMessage;

    if (!media) return m.reply("Reply image/video untuk jadi sticker!");

    let stream = await conn.downloadMediaMessage(quoted);
    let fileIn = path.join(os.tmpdir(), "input_" + Date.now());
    let fileOut = path.join(os.tmpdir(), "sticker_" + Date.now() + ".webp");

    fs.writeFileSync(fileIn, stream);

    await new Promise((resolve, reject) => {
      ffmpeg(fileIn)
        .outputOptions([
          "-vcodec",
          "libwebp",
          "-vf",
          "scale=512:512:force_original_aspect_ratio=decrease,fps=15",
          "-loop",
          "0",
          "-q:v",
          "80",
          "-preset",
          "default"
        ])
        .toFormat("webp")
        .save(fileOut)
        .on("end", resolve)
        .on("error", reject);
    });

    await conn.sendMessage(m.chat, {
      sticker: fs.readFileSync(fileOut)
    }, { quoted: m });

    fs.unlinkSync(fileIn);
    fs.unlinkSync(fileOut);

  } catch (e) {
    console.log(e);
    m.reply("Error saat convert sticker");
  }
};

handler.help = ["sticker", "s"];
handler.tags = ["sticker"];
handler.command = /^stic?ker|s$/i;

export default handler;
