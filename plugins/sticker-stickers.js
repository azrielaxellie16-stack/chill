import fs from "fs-extra";
import path from "path";
import os from "os";
import sharp from "sharp";
import gifFrames from "gif-frames";
import { Image } from "node-webpmux";
import ffmpeg from "fluent-ffmpeg";

let hasFFmpeg = true;
try {
  ffmpeg.setFfmpegPath("ffmpeg");
} catch (e) {
  hasFFmpeg = false;
}

let handler = async (m, { conn, quoted }) => {
  try {
    const msg = quoted || m;
    const mime = (msg.msg || msg).mimetype || "";

    if (!mime) return m.reply("Reply media (image/gif/video)");

    let buffer = await conn.downloadMediaMessage(msg);

    let input = path.join(os.tmpdir(), `${Date.now()}`);
    fs.writeFileSync(input, buffer);

    // =========================
    // IMAGE → STICKER (NO FF)
    // =========================
    if (/image/.test(mime)) {
      let out = input + ".webp";

      await sharp(input)
        .resize(512, 512, { fit: "inside" })
        .webp({ quality: 80 })
        .toFile(out);

      await conn.sendMessage(m.chat, {
        sticker: fs.readFileSync(out)
      }, { quoted: m });

      fs.unlinkSync(input);
      fs.unlinkSync(out);
      return;
    }

    // =========================
    // GIF → ANIMATED STICKER (NO FF)
    // =========================
    if (/gif/.test(mime)) {
      let output = input + ".webp";

      const frames = await gifFrames({
        url: input,
        frames: "all",
        outputType: "png",
        cumulative: true
      });

      let webpFrames = [];

      for (let frame of frames) {
        let stream = frame.getImage();
        let chunks = [];
        for await (const c of stream) chunks.push(c);

        let buf = Buffer.concat(chunks);

        let webp = await sharp(buf)
          .resize(512, 512, { fit: "inside" })
          .webp({ quality: 80 })
          .toBuffer();

        webpFrames.push(webp);
      }

      const anim = new Image();
      await anim.load(webpFrames[0]);

      for (let i = 1; i < webpFrames.length; i++) {
        await anim.appendFrame(webpFrames[i]);
      }

      let final = await anim.save(null);
      fs.writeFileSync(output, final);

      await conn.sendMessage(m.chat, {
        sticker: fs.readFileSync(output)
      }, { quoted: m });

      fs.unlinkSync(input);
      fs.unlinkSync(output);
      return;
    }

    // =========================
    // VIDEO → FFmpeg (OPTIONAL)
    // =========================
    if (/video/.test(mime)) {
      if (!hasFFmpeg) {
        return m.reply("Video tidak bisa diproses karena FFmpeg tidak tersedia di server ini.");
      }

      let output = input + ".webp";

      await new Promise((resolve, reject) => {
        ffmpeg(input)
          .outputOptions([
            "-vcodec libwebp",
            "-vf scale=512:512:force_original_aspect_ratio=decrease,fps=15",
            "-loop 0",
            "-q:v 80"
          ])
          .toFormat("webp")
          .save(output)
          .on("end", resolve)
          .on("error", reject);
      });

      await conn.sendMessage(m.chat, {
        sticker: fs.readFileSync(output)
      }, { quoted: m });

      fs.unlinkSync(input);
      fs.unlinkSync(output);
    }

  } catch (e) {
    console.log(e);
    m.reply("Gagal membuat sticker");
  }
};

handler.help = ["sticker", "s"];
handler.tags = ["sticker"];
handler.command = /^stic?ker|s$/i;

export default handler;
