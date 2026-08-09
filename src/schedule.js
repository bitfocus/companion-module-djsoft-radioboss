const RadioBOSS = require('./radioboss')
const { parseString } = require('xml2js')

module.exports = {
	async fetchScheduleEvents() {
		const self = this
		if (!self.config.host) return

		try {
			const connection = new RadioBOSS(self.config)
			const result = await connection.sendRequest('action=schedule&type=list')

			if (!result || result.status !== 'success' || !result.response?.body) return

			const chunks = []
			const readable = result.response.body

			await new Promise((resolve) => {
				readable.on('readable', () => {
					let chunk
					while (null !== (chunk = readable.read())) chunks.push(chunk)
				})
				readable.on('error', () => resolve())
				readable.on('end', () => {
					const xml = chunks.join('')
					parseString(xml, (err, parsed) => {
						try {
							if (parsed?.Events?.item) {
								const prev = JSON.stringify(self.STATUS.scheduleEvents)
								self.STATUS.scheduleEvents = parsed.Events.item.map(item => {
									const a = item['$']
									const label = (a.TaskName && a.TaskName.trim())
										|| a.FileName
										|| a.Id
										|| '(unnamed)'
									return { id: a.Id, label }
								})
								if (prev !== JSON.stringify(self.STATUS.scheduleEvents)) {
									self.actions()
								}
							}
						} catch (_) {
							// ignore parse errors — schedule list is optional
						}
						resolve()
					})
				})
			})
		} catch (_) {
			// ignore fetch errors — schedule list is optional
		}
	},
}
