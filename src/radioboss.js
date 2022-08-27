const fetch = require('node-fetch')

class RadioBOSS {
	constructor(config) {
		const apiHost = config.host
		const apiPort = config.port
		const password = config.password

		this.baseUrl = `http://${apiHost}:${apiPort}/?pass=${password}&`

		this.requestOptions = {
			method: 'GET',
			timeout: 10000,
		}
	}

	async sendRequest(cmd) {
		let requestUrl = this.baseUrl + encodeURIComponent(cmd);
		try {
			const response = await fetch(requestUrl, this.requestOptions)
			if (!response.ok) {
				return {
					status: 'failed',
				}
			}
			return {
				status: 'success',
				response: await response,
			}
		} catch (err) {
			return {
				status: 'failed',
			}
		}

	}
}

module.exports = RadioBOSS;