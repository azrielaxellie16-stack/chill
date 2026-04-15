let handler = async (m, { text, usedPrefix, command }) => {
	const input = m.quoted ? m.quoted.text : text;
	if (!input) throw `Masukkan pertanyaan atau perintah!\n\nContoh:\n${usedPrefix + command} apa itu AI`;

	if (!conn.glm) conn.glm = {};
	if (!conn.glm[m.sender]) conn.glm[m.sender] = [];
	conn.glm[m.sender].push({ role: 'user', content: input });

	try {
		const res = await deepinfra('zai-org/GLM-4.7-Flash', conn.glm[m.sender]);
		conn.glm[m.sender].push({ role: 'assistant', content: res });
		m.reply(res);
	} catch (err) {
		m.reply('Terjadi Kesalahan');
		console.error(err);
	}
};

handler.help = ['glm'];
handler.tags = ['ai'];
handler.command = /^glm$/i;
handler.register = true;
handler.limit = true;

export default handler;

export async function deepinfra(model, history) {
	try {
		const res = await fetch('https://api.deepinfra.com/v1/openai/chat/completions', {
			method: 'POST',
			headers: {
				'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				model,
				messages: history,
			}),
		});
		if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
		const data = await res.json();

		let teks = [];
		for (let out of data?.choices || []) {
			if (out.message?.content) teks.push(out.message.content);
		}

		return teks.join('\n');
	} catch (e) {
		throw new Error('Error' + e?.message);
	}
}
