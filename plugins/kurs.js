// Cr Api https://kaizenapi.my.id
// Type : Plugin (ESM)
// Uriel

import axios from "axios";

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (args.length < 3) {
        let text = `*💸 CURRENCY CONVERTER*\n\n`;
        text += `*Cara Penggunaan:*\n${usedPrefix + command} <jumlah> <dari> <ke>\n\n`;
        text += `*Contoh:*\n`;
        text += `◦ ${usedPrefix + command} 1000 eur idr\n`;
        text += `◦ ${usedPrefix + command} 50 usd myr\n\n`;
        text += `_Catatan: Gunakan kode mata uang internasional 3 huruf (IDR, USD, EUR, JPY, dll)._`;
        return m.reply(text);
    }

    let amount = args[0];
    let from = args[1].toLowerCase();
    let to = args[2].toLowerCase();

    if (isNaN(amount)) {
        return m.reply("⚠️ Jumlah yang dimasukkan harus berupa angka King!");
    }

    try {
        let apiUrl = `https://kaizenapi.my.id/tools/currency?from=${from}&to=${to}&amount=${amount}`;
        let { data } = await axios.get(apiUrl);

        if (!data.status || !data.result)
            throw "Mata uang tidak valid atau API sedang down.";

        let res = data.result;

        let caption = `*💱 C U R R E N C Y  C O N V E R T E R*\n\n`;

        caption += `╭───「 *HASIL KONVERSI* 」\n`;
        caption += `│ 🪙 *Dari:* ${res.konversi.dari}\n`;
        caption += `│ 💱 *Ke:* ${res.konversi.ke}\n`;
        caption += `│ 💵 *Jumlah Awal:* ${res.konversi.jumlah_awal} ${res.konversi.dari}\n`;
        caption += `│ 💰 *Hasil Akhir:* *${res.konversi.hasil_konversi} ${res.konversi.ke}*\n`;
        caption += `╰───────────────\n\n`;

        caption += `╭───「 *INFORMASI KURS* 」\n`;
        caption += `│ 📈 *Kurs Saat Ini:* \n`;
        caption += `│ ${res.info.kurs_saat_ini}\n`;
        caption += `│ 🗓️ *Update Terakhir:* ${res.info.tanggal_update}\n`;
        caption += `╰───────────────\n\n`;

        caption += `> _Data ini diambil secara real-time berdasarkan market valas global._`;

        await conn.sendMessage(m.chat, { text: caption }, { quoted: m });
    } catch (e) {
        console.error("Currency Error:", e);
        m.reply(
            `❌ *Gagal Konversi!*\nPastikan kode mata uang yang lu masukin udah bener (contoh: USD, IDR, EUR, JPY).`
        );
    }
};

handler.help = ["kurs <jumlah> <dari> <ke>"];
handler.tags = ["tools"];
handler.command = /^(kurs|currency|konversi)$/i;
handler.limit = true;

export default handler;