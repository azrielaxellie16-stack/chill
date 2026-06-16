import axios from 'axios'
import * as cheerio from 'cheerio'

let handler = async (m, { conn, command, usedPrefix }) => {
    if (command === 'randomgore') {
        try {
            const result = await randomVideo()

            if (!result.videoUrl) {
                return m.reply('Video tidak ditemukan')
            }

// ...

await conn.sendButton(
    m.chat,
    {
        video: { url: result.videoUrl },
        caption: result.title || 'Random Video',
        footer: global.namebot,
        buttons: [
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: '🎥 Next Video',
                    id: `${usedPrefix}${command}`
                })
            }
        ]
    },
    { quoted: m }
)



        } catch (e) {
            console.error(e)
            m.reply(`Gagal mengambil video\n${e.message}`)
        }
    }
}

handler.help = ['randomvideo']
handler.tags = ['downloader']
handler.command = ['randomvideo', 'randomgore']

export default handler

const sentVideos = new Set()

async function randomVideo() {
    const baseUrl = 'https://seegore.com/gore'

    const { data } = await axios.get(baseUrl + '/gore')
    const $ = cheerio.load(data)

    const posts = []

    $('article a').each((_, el) => {
        const href = $(el).attr('href')

        if (!href) return

        try {
            const fullLink = new URL(href, baseUrl).href

            if (!posts.includes(fullLink)) {
                posts.push(fullLink)
            }
        } catch {}
    })

    if (!posts.length) {
        throw new Error('Tidak ada post ditemukan')
    }

    const shuffled = [...posts].sort(() => Math.random() - 0.5)

    for (const postUrl of shuffled) {
        try {
            const { data: detailData } = await axios.get(postUrl, {
                timeout: 15000
            })

            const $$ = cheerio.load(detailData)

            const videoSrc =
                $$('video source').attr('src') ||
                $$('video').attr('src') ||
                $$('source[type="video/mp4"]').attr('src')

            if (!videoSrc) continue

            const videoUrl = new URL(videoSrc, postUrl).href

            // Skip jika pernah dikirim
            if (sentVideos.has(videoUrl)) {
                console.log('Skip video lama:', videoUrl)
                continue
            }

            sentVideos.add(videoUrl)

            return {
                title:
                    $$('h1').first().text().trim() ||
                    'Random Video',
                videoUrl
            }

        } catch {
            continue
        }
    }

    throw new Error('Tidak ada video baru yang tersedia')
}

/*async function randomVideo() {
    const baseUrl = 'https://seegore.com/gore'

    const { data } = await axios.get(baseUrl + '/gore')
    const $ = cheerio.load(data)

    const posts = []

    $('article a').each((_, el) => {
        const href = $(el).attr('href')

        if (!href) return

        try {
            const fullLink = new URL(href, baseUrl).href

            if (!posts.includes(fullLink)) {
                posts.push(fullLink)
            }
        } catch {}
    })

    if (!posts.length) {
        throw new Error('Tidak ada post ditemukan')
    }

    // Acak urutan link
    const shuffled = posts.sort(() => Math.random() - 0.5)

    for (const postUrl of shuffled) {
        try {
            console.log('Mencoba:', postUrl)

            const { data: detailData } = await axios.get(postUrl, {
                timeout: 15000
            })

            const $$ = cheerio.load(detailData)

            const videoSrc =
                $$('video source').attr('src') ||
                $$('video').attr('src') ||
                $$('source[type="video/mp4"]').attr('src')

            if (!videoSrc) {
                console.log('Skip: video tidak ditemukan')
                continue
            }

            const videoUrl = new URL(videoSrc, postUrl).href

            return {
                title:
                    $$('h1').first().text().trim() ||
                    'Random Video',
                videoUrl
            }
        } catch (err) {
            console.log(
                `Skip ${postUrl}:`,
                err.message
            )
            continue
        }
    }

    throw new Error(
        'Semua link gagal atau tidak memiliki video'
    )
}*/

/*async function randomVideo() {
    const baseUrl = 'https://seegore.com/'

    console.log('Mengambil daftar video...')

    const { data } = await axios.get(baseUrl + '/gore')

    const $ = cheerio.load(data)
    const posts = []

    $('article a').each((_, el) => {
        const href = $(el).attr('href')

        if (href) {
            try {
                posts.push(new URL(href, baseUrl).href)
            } catch (err) {
                console.log('URL Error:', href)
            }
        }
    })

    console.log('Total post:', posts.length)

    if (!posts.length) {
        throw new Error('Tidak ada post ditemukan')
    }

    const randomLink =
        posts[Math.floor(Math.random() * posts.length)]

    console.log('Random link:', randomLink)

    const detail = await axios.get(randomLink)

    const $$ = cheerio.load(detail.data)

    const videoSrc =
        $$('video source').attr('src') ||
        $$('video').attr('src') ||
        $$('source[type="video/mp4"]').attr('src')

    console.log('Video src:', videoSrc)

    if (!videoSrc) {
        throw new Error('Video source tidak ditemukan')
    }

    return {
        title: $$('h1').first().text().trim(),
        videoUrl: new URL(videoSrc, randomLink).href
    }
}*/
