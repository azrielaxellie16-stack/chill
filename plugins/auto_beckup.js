import fs from 'fs'
import path from 'path'
import AdmZip from 'adm-zip'

global.autoBackup ??= {}

async function createBackup(conn, jid) {
  try {
    const zip = new AdmZip()

    const ignore = [
      'node_modules',
      '.git',
      '.cache',
      'tmp',
      'temp',
      'session',
      'sessions',
      'backup',
      '.npm'
    ]

    function addFolder(dir) {
      const files = fs.readdirSync(dir)

      for (const file of files) {
        const full = path.join(dir, file)
        const relative = path.relative(
          process.cwd(),
          full
        )

        if (
          ignore.some(v =>
            relative.startsWith(v)
          )
        )
          continue

        const stat = fs.statSync(full)

        if (stat.isDirectory()) {
          addFolder(full)
        } else {
          if (
            file.endsWith('.zip')
          )
            continue

          zip.addLocalFile(full)
        }
      }
    }

    addFolder(process.cwd())

    const fileName =
      `backup-${Date.now()}.zip`

    zip.writeZip(fileName)

    await conn.sendMessage(jid, {
      document: fs.readFileSync(
        fileName
      ),
      mimetype: 'application/zip',
      fileName,
      caption:
        '✅ Backup SC berhasil dibuat.'
    })

    fs.unlinkSync(fileName)

    return true
  } catch (e) {
    console.error(e)
    return false
  }
}

let handler = async (
  m,
  {
    conn,
    command,
    args,
    isOwner
  }
) => {
  if (!isOwner)
    return m.reply(
      '❌ Khusus Owner.'
    )

  switch (command) {
    case 'backupsc': {
      await m.reply(
        '📦 Membuat backup...'
      )

      const ok =
        await createBackup(
          conn,
          m.sender
        )

      if (!ok)
        return m.reply(
          '❌ Gagal membuat backup.'
        )

      break
    }

    case 'autobackup': {
      if (!args[0]) {
        return m.reply(
          'Gunakan:\n.autobackup on\n.autobackup off'
        )
      }

      if (args[0] === 'on') {
        if (
          global.autoBackup[
            m.sender
          ]
        ) {
          return m.reply(
            '✅ Auto backup sudah aktif.'
          )
        }

        global.autoBackup[
          m.sender
        ] = setInterval(
          async () => {
            try {
              await createBackup(
                conn,
                m.sender
              )
            } catch (e) {
              console.error(e)
            }
          },
          24 *
            60 *
            60 *
            1000
        )

        return m.reply(
          '✅ Auto backup setiap 24 jam diaktifkan.'
        )
      }

      if (args[0] === 'off') {
        if (
          !global.autoBackup[
            m.sender
          ]
        ) {
          return m.reply(
            '❌ Auto backup belum aktif.'
          )
        }

        clearInterval(
          global.autoBackup[
            m.sender
          ]
        )

        delete global.autoBackup[
          m.sender
        ]

        return m.reply(
          '✅ Auto backup dimatikan.'
        )
      }
    }
  }
}

handler.help = [
  'backupsc',
  'autobackup on',
  'autobackup off'
]

handler.tags = ['owner']
handler.owner = true

handler.command =
  /^(backupsc|autobackup)$/i

export default handler
