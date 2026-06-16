import { igdl } from 'ruhend-scraper'
import axios from 'axios'

const cooldown = new Map()

export async function before(m, { conn }) {
    try {
        if (!m.text) return false
        if (m.fromMe) return false

        const url = m.text.match(/https?:\/\/[^\s]+/i)?.[0]
        if (!url) return false

        const user = m.sender
        const now = Date.now()

        if (cooldown.has(user)) {
            const last = cooldown.get(user)
            if (now - last < 10000) return true
        }

        cooldown.set(user, now)

        // TikTok
        if (/tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com/i.test(url)) {
            await autoTikTok(m, conn, url)
            return true
        }

        // Instagram
        if (/instagram\.com/i.test(url)) {
            await autoInstagram(m, conn, url)
            return true
        }

        // Facebook
        if (/facebook\.com|fb\.watch/i.test(url)) {
            await autoFacebook(m, conn, url)
            return true
        }

    } catch (e) {
        console.error(e)
    }

    return false
}

async function autoInstagram(m, conn, url) {
    await m.react('⏳')

    const res = await igdl(url)

    if (!res?.data?.length) throw 'Media tidak ditemukan'

    for (const media of res.data) {
        const ext = media.url.includes('.mp4') ? 'mp4' : 'jpg'

        await conn.sendFile(
            m.chat,
            media.url,
            `instagram.${ext}`,
            '',
            m
        )
    }

    await m.react('✅')
}

async function autoTikTok(m, conn, url) {
    await m.react('⏳')

    let res = await (
        await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`)
    ).json()

    if (!res?.data) throw 'Video tidak ditemukan'

    let data = res.data

    if (data.images?.length) {
        for (const img of data.images) {
            await conn.sendFile(m.chat, img, '', '', m)
        }
    } else {
        await conn.sendFile(
            m.chat,
            data.play,
            'tiktok.mp4',
            '',
            m
        )
    }

    await m.react('✅')
}

async function getToken() {
    const { data: html } = await axios.get(
        'https://fbdownloader.to/id'
    )

    const match = html.match(
        /k_exp="(.*?)".*?k_token="(.*?)"/s
    )

    if (!match) throw 'Token gagal'

    return {
        k_exp: match[1],
        k_token: match[2]
    }
}

async function fbDownloader(url) {
    const { k_exp, k_token } = await getToken()

    const payload = new URLSearchParams({
        k_exp,
        k_token,
        p: 'home',
        q: url,
        lang: 'id',
        v: 'v2',
        W: ''
    })

    const { data } = await axios.post(
        'https://fbdownloader.to/api/ajaxSearch',
        payload
    )

    const html = data.data

    const results = []

    const regex =
        /<td class="video-quality">(.*?)<\/td>[\s\S]*?(?:href="(.*?)"|data-videourl="(.*?)")/g

    let match

    while ((match = regex.exec(html)) !== null) {
        const quality = match[1].trim()
        const link = match[2] || match[3]

        if (quality && link) {
            results.push({
                quality,
                url: link
            })
        }
    }

    return results
}

async function autoFacebook(m, conn, url) {
    await m.react('⏳')

    const results = await fbDownloader(url)

    if (!results.length)
        throw 'Video tidak ditemukan'

    await conn.sendFile(
        m.chat,
        results[0].url,
        'facebook.mp4',
        '',
        m
    )

    await m.react('✅')
}