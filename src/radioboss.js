// node-fetch v2 sets __esModule:true, which webpack treats as an ES module and
// wraps in a namespace object.  Unwrap .default so fetch is always the function.
const _nodeFetch = require('node-fetch')
const fetch = typeof _nodeFetch === 'function' ? _nodeFetch : _nodeFetch.default

class RadioBOSS {
	constructor(config) {
		const apiHost = config.host
		const apiPort = config.port
		const apiPath = config.apiPath || '/api/'
		const password = config.password

		const normalizedPath = apiPath.startsWith('/') ? apiPath : `/${apiPath}`
		this.baseUrl = `http://${apiHost}:${apiPort}${normalizedPath.endsWith('/') ? normalizedPath : `${normalizedPath}/`}`
		this.password = password

		this.requestOptions = {
			method: 'GET',
			headers: {
				connection: 'close',
			},
			timeout: 10000,
		}
	}

	async sendRequest(cmd, uriEncode) {
		const requestUrl = new URL(this.baseUrl)
		const query = [`pass=${encodeURIComponent(this.password ?? '')}`]

		for (const param of String(cmd ?? '').split('&')) {
			const separatorIndex = param.indexOf('=')

			if (separatorIndex === -1) {
				continue
			}

			const key = param.slice(0, separatorIndex)
			const value = param.slice(separatorIndex + 1)

			query.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
		}

		requestUrl.search = query.join('&')
		
		try {
			const response = await fetch(requestUrl.toString(), this.requestOptions)
			if (!response.ok) {
				return {
					status: 'failed',
					statusCode: response.status,
				}
			}
			return {
				status: 'success',
				response,
			}
		} catch (err) {
			return {
				status: 'failed',
				error: err,
			}
		}
	}
}

module.exports = RadioBOSS;
