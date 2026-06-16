// ==========================================
// Fitur: QWA Generator (Image & Sticker)
// Creator: Kai
// Rest api : https://kaizenapi.my.id
// Github: https://github.com/Kaizendesuid
// QWA API: https://qwa.eeq.my.id
// ==========================================

import axios from "axios";
import sharp from "sharp";
import { Sticker, StickerTypes } from "wa-sticker-formatter";

let handler = async (m, { conn, text, usedPrefix, command }) => {
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    try {
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || q.mediaType || "";

        let msgText = text ? text : q.text || q.caption || q.description || "";

        let isBg = true;
        if (msgText.includes("--nobg")) {
            isBg = false;
            msgText = msgText.replace("--nobg", "").trim();
        }

        if (!msgText && !/image\/(jpe?g|png|webp)/.test(mime)) {
            return m.reply(
                `⚠️ Mau bikin quote dari mana?\n\n*Cara Pakai:*\n◦ ${usedPrefix + command} Halo Uriel\n◦ Atau reply pesan/gambar/stiker trus ketik ${usedPrefix + command}\n\n*Mau ilangin background?* Tambahin --nobg\n◦ Contoh: ${usedPrefix + command} Halo Uriel --nobg`
            );
        }

        let senderImage = "";
        if (/image\/(jpe?g|png|webp)/.test(mime)) {
            let media = await q.download();

            if (mime.includes("webp")) {
                media = await sharp(media).png().toBuffer();
                mime = "image/png";
            }

            senderImage = `data:${mime};base64,${media.toString("base64")}`;
        }

        let who = m.quoted ? m.quoted.sender || m.quoted.participant : m.sender;

        if (who.endsWith("@lid")) {
            try {
                let resolved = await conn.findUserId(who);
                if (resolved && resolved.phoneNumber) {
                    who = resolved.phoneNumber + "@s.whatsapp.net";
                }
            } catch (e) {}
        }

        const userData = global.db?.data?.users[who] || {};
        let name;

        if (m.quoted) {
            name =
                userData.name || m.quoted.pushName || m.quoted.name || "User";
        } else {
            name = userData.name || m.pushName || "User";
        }

        let timeStr = new Date()
            .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
            .replace(":", ".");

        let payload = {
            sender_name: name,
            sender_number: "+" + who.split("@")[0],
            sender_avatar: "https://cdn.nekohime.site/file/meJWYXVD.jpg", //pake ini gw error soalnya wkwk
            sender_image: senderImage,
            message: msgText || " ",
            time: timeStr,
            background: isBg
        };

        let { data } = await axios.post(
            "https://qwa.eeq.my.id/api/generate",
            payload,
            {
                responseType: "arraybuffer",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        let buffer = Buffer.from(data);

        if (command.toLowerCase() === "qwas") {
            const sticker = new Sticker(buffer, {
                pack: global.packname || "Kai",
                author: global.author || "Uriel",
                type: StickerTypes.FULL,
                quality: 100,
                background: "transparent"
            });

            let finalSticker = await sticker.toBuffer();

            await conn.sendMessage(
                m.chat,
                { sticker: finalSticker },
                { quoted: m }
            );
        } else {
            let paddedImage = await sharp(buffer)
                .extend({
                    top: 50,
                    bottom: 50,
                    left: 50,
                    right: 50,
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                })
                .png()
                .toBuffer();

            await conn.sendMessage(
                m.chat,
                { image: paddedImage },
                { quoted: m }
            );
        }

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } catch (e) {
        console.error("[QWA ERROR]", e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(
            `❌ *Gagal bikin Quote:*\n\nAPI sedang down atau ada kesalahan format. Coba lagi nanti King!`
        );
    }
};

handler.help = ["qwa <teks/reply>", "qwas <teks/reply>"];
handler.tags = ["maker"];
handler.command = /^(qwa|qwas)$/i;
handler.limit = true;

export default handler;