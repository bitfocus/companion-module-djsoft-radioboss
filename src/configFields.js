module.exports = {
	config_fields() {
		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This module controls DJ Soft\'s Radio BOSS software.  <a href="http://www.djsoft.net" target="_new">DJ Soft Website</a>'
			},
			{
				type: 'static-text',
				id: 'info1',
				label: 'Enable API',
				width: 12,
				value: `
					<div class="alert alert-info">
						<strong>Please read:</strong>
						<br>
						<strong>The Remote Control API must be enabled in the Radio BOSS software.</strong>
						<img src='settings.png' />
						<br>
					</div>
				`
			},
			{
				type: 'textinput',
				id: 'host',
				width: 8,
				label: 'Target IP',
				default: '127.0.0.1',
				regex: this.REGEX_IP
			},
			{
				type: 'number',
				id: 'port',
				width: 6,
				label: 'Target Port',
				default: 9000,
				min: 1,
				max: 65535,
			},
			{
				type: 'textinput',
				id: 'apiPath',
				width: 6,
				label: 'API Path',
				default: '/api/',
				tooltip: 'RadioBOSS usually uses /api/. Older setups may use /.',
			},
			{
				type: 'textinput',
				id: 'password',
				width: 8,
				default: '',
				label: 'Password'
			},
			{
				type: 'static-text',
				id: 'dummy1',
				width: 12,
				label: ' ',
				value: ' ',
			},
			{
				type: 'static-text',
				id: 'info2',
				label: 'Polling',
				width: 12,
				value: `
					<div class="alert alert-warning">
						<strong>Please read:</strong>
						<br>
						Enabling polling unlocks these features:
						<br><br>
						<ul>
							<li>Changes made in the software outside of this module</li>
							<li>Currently selected file, etc.</li>
						</ul>
						Enabling polling will send a request to the Device at a continuous interval.
						<br>
						<strong>This could have an undesired performance effect on your Device, depending on the polling rate.</strong>
						<br>
					</div>
				`
			},
			{
				type: 'checkbox',
				id: 'polling',
				label: 'Enable Polling (necessary for feedbacks and variables)',
				default: false,
				width: 9
			},
			{
				type: 'number',
				id: 'pollingrate',
				label: 'Polling Rate (in ms)',
				default: 1000,
				min: 250,
				max: 60000,
				width: 3,
				isVisible: (configValues) => configValues.polling === true,
			},
			{
				type: 'static-text',
				id: 'dummy2',
				width: 12,
				label: ' ',
				value: ' ',
			},
			{
				type: 'checkbox',
				id: 'verbose',
				label: 'Enable Verbose Logging',
				default: false
			},
		]
	},
}
