const RadioBOSS = require('./radioboss')

module.exports = {
	async sendCommand(cmd, uriEncode) {
		if (cmd !== undefined) {
			try {
				const connection = new RadioBOSS(this.config)

				if (this.config.verbose) {
					this.log('debug', `Sending command: ${cmd}`);
				}

				const result = await connection.sendRequest(cmd, uriEncode)
				this.debug('info', result)

				if (result.status === 'success') {
					this.status(this.STATUS_OK);
				} else {
					this.status(this.STATUS_ERROR);
					this.log('error', result.status);
					this.setVariable('module_state', 'Error - See Log');
				}
			} catch (error) {
				this.status(this.STATUS_ERROR);
				this.setVariable('module_state', 'Error - See Log');

				let errorText = String(error);

				if (errorText.match('ECONNREFUSED')) {
					this.log('error', 'Unable to connect to the server.')
				}
				else if (errorText.match('ETIMEDOUT') || errorText.match('ENOTFOUND')) {
					this.log('error', 'Connection to server has timed out.')
				}
				else {
					this.log('error', `An error has occurred: ${errorText}`);
				}
			}
		}
	},

	actions() {
		let self = this; // required to have reference to outer `this`
		let actionsArr = {};

		actionsArr.play = {
			label: 'Play Track Number in Playlist',
			options: [
				{
					type: 'number',
					label: 'Track Number',
					id: 'track',
					default: 1,
					required: true
				}
			],
			callback: function (action, bank) {
				let cmd = 'cmd=play ' + action.options.track;
				self.sendCommand(cmd);
			}
		};

		actionsArr.stop = {
			label: 'Stop Playback',
			callback: function (action, bank) {
				let cmd = 'cmd=stop';
				self.sendCommand(cmd);
			}
		};

		actionsArr.pause = {
			label: 'Pause Playback',
			callback: function (action, bank) {
				let cmd = 'cmd=pause';
				self.sendCommand(cmd);
			}
		};

		actionsArr.next = {
			label: 'Go to Next Track',
			options: [
				{
					type: 'checkbox',
					label: 'Fade Out',
					id: 'fadeout',
					default: false
				},
				{
					type: 'number',
					label: 'Fade Out Duration (in ms)',
					id: 'duration',
					default: 2000,
					isVisible: (action) => action.options.fadeout === true,
				}
			],
			callback: function (action, bank) {
				let cmd = 'cmd=next';

				if (action.options.fadeout) {
					cmd += ' ' + action.options.duration;
				}

				self.sendCommand(cmd);
			}
		};

		actionsArr.setVol = {
			label: 'Set Volume',
			options: [
				{
					type: 'number',
					label: 'Volume',
					id: 'volume',
					tooltip: 'Sets the volume percent (0-100)',
					min: 0,
					max: 100,
					default: 50,
					step: 1,
					required: true,
					range: true
				},
				{
					type: 'checkbox',
					label: 'Specify Duration',
					id: 'specifyduration',
					default: false
				},
				{
					type: 'number',
					label: 'Duration to reach Volume (in ms)',
					id: 'duration',
					default: 2000,
					isVisible: (action) => action.options.specifyduration === true,
				}
			],
			callback: function (action, bank) {
				let cmd = 'cmd=setvol ' + action.options.volume;

				if (action.options.specifyduration) {
					cmd += ' ' + action.options.duration;
				}

				self.sendCommand(cmd);
			}
		};

		actionsArr.clearPlaylist = {
			label: 'Clear Playlist',
			options: [
				{
					type: 'dropdown',
					label: 'Clear Direction',
					id: 'direction',
					default: 'all',
					choices: [
					  { id: 'all', label: 'All' },
					  { id: 'up', label: 'Up' },
					  { id: 'down', label: 'Down' }
					],
					minChoicesForSearch: 0
				  }
			],
			callback: function (action, bank) {
				let cmd = 'cmd=clearplaylist';
				if (action.options.direction !== 'all') {
					cmd += ' ' + action.options.direction;
				}
				self.sendCommand(cmd);
			}
		};

		actionsArr.reboot = {
			label: 'Reboot',
			callback: function (action, bank) {
				let cmd = 'cmd=reboot';
				self.sendCommand(cmd);
			}
		};

		actionsArr.powerOff = {
			label: 'Power Off',
			callback: function (action, bank) {
				let cmd = 'cmd=poweroff';
				self.sendCommand(cmd);
			}
		};

		actionsArr.connect = {
			label: 'Connect to Broadcasting Server',
			options: [
				{
					type: 'number',
					label: 'Server Number',
					id: 'server',
					default: 1,
					required: true,
					range: false
				}
			],			
			callback: function (action, bank) {
				let cmd = 'cmd=connect ' + action.options.server;
				self.sendCommand(cmd);
			}
		};

		actionsArr.disconnect = {
			label: 'Disconnect from Broadcasting Server',
			options: [
				{
					type: 'number',
					label: 'Server Number',
					id: 'server',
					default: 1,
					required: true,
					range: false
				}
			],			
			callback: function (action, bank) {
				let cmd = 'cmd=disconnect ' + action.options.server;
				self.sendCommand(cmd);
			}
		};

		actionsArr.schedulerOn = {
			label: 'Turn Scheduler On',
			callback: function (action, bank) {
				let cmd = 'cmd=scheduler on';
				self.sendCommand(cmd);
			}
		};

		actionsArr.schedulerOff = {
			label: 'Turn Scheduler Off',
			callback: function (action, bank) {
				let cmd = 'cmd=scheduler off';
				self.sendCommand(cmd);
			}
		};

		actionsArr.shuffleOn = {
			label: 'Turn Shuffle On',
			callback: function (action, bank) {
				let cmd = 'cmd=set shuffle on';
				self.sendCommand(cmd);
			}
		};

		actionsArr.shuffleOff = {
			label: 'Turn Shuffle Off',
			callback: function (action, bank) {
				let cmd = 'cmd=set shuffle off';
				self.sendCommand(cmd);
			}
		};

		actionsArr.repeatTrackOn = {
			label: 'Turn Repeat Track On',
			callback: function (action, bank) {
				let cmd = 'cmd=set repeat_track on';
				self.sendCommand(cmd);
			}
		};

		actionsArr.repeatTrackOff = {
			label: 'Turn Repeat Track Off',
			callback: function (action, bank) {
				let cmd = 'cmd=set repeat_track off';
				self.sendCommand(cmd);
			}
		};

		actionsArr.repeatListOn = {
			label: 'Turn Repeat List On',
			callback: function (action, bank) {
				let cmd = 'cmd=set repeat_list on';
				self.sendCommand(cmd);
			}
		};

		actionsArr.repeatListOff = {
			label: 'Turn Repeat List Off',
			callback: function (action, bank) {
				let cmd = 'cmd=set repeat_list off';
				self.sendCommand(cmd);
			}
		};

		actionsArr.breakOn = {
			label: 'Turn Break On',
			callback: function (action, bank) {
				let cmd = 'cmd=set break on';
				self.sendCommand(cmd);
			}
		};

		actionsArr.breakOff = {
			label: 'Turn Break Off',
			callback: function (action, bank) {
				let cmd = 'cmd=set break off';
				self.sendCommand(cmd);
			}
		};

		actionsArr.autoampOn = {
			label: 'Turn Automatic Volume Control On',
			callback: function (action, bank) {
				let cmd = 'cmd=set autoamp on';
				self.sendCommand(cmd);
			}
		};

		actionsArr.autoampOff = {
			label: 'Turn Automatic Volume Control Off',
			callback: function (action, bank) {
				let cmd = 'cmd=set autoamp off';
				self.sendCommand(cmd);
			}
		};

		actionsArr.httpRequestOn = {
			label: 'Turn HTTP Request On',
			callback: function (action, bank) {
				let cmd = 'cmd=set http_request on';
				self.sendCommand(cmd);
			}
		};

		actionsArr.httpRequestOff = {
			label: 'Turn HTTP Request Off',
			callback: function (action, bank) {
				let cmd = 'cmd=set http_request off';
				self.sendCommand(cmd);
			}
		};

		actionsArr.schedulerManualOn = {
			label: 'Turn Scheduler Manual Mode On',
			callback: function (action, bank) {
				let cmd = 'cmd=set manual on';
				self.sendCommand(cmd);
			}
		};

		actionsArr.schedulerManualOff = {
			label: 'Turn Scheduler Manual Mode Off',
			callback: function (action, bank) {
				let cmd = 'cmd=set manual off';
				self.sendCommand(cmd);
			}
		};

		actionsArr.autoIntroOn = {
			label: 'Turn Auto Intro On',
			callback: function (action, bank) {
				let cmd = 'cmd=set autointro on';
				self.sendCommand(cmd);
			}
		};

		actionsArr.autoIntroOff = {
			label: 'Turn Auto Intro Off',
			callback: function (action, bank) {
				let cmd = 'cmd=set autointro off';
				self.sendCommand(cmd);
			}
		};

		actionsArr.setVariableValue = {
			label: 'Set Variable Value',
			options: [
				{
					type: 'textinput',
					label: 'Variable Name (with % percent)',
					id: 'variable',
					default: '%showname'
				},
				{
					type: 'textinput',
					label: 'Variable Value',
					id: 'value',
					default: 'TEXT'
				}
			],			
			callback: function (action, bank) {
				let cmd = 'cmd=set ' + action.options.variable + '=' + action.options.value;
				self.sendCommand(cmd);
			}
		};

		actionsArr.silenceDetectorOn = {
			label: 'Turn Silence Detector On',
			callback: function (action, bank) {
				let cmd = 'cmd=silencedetector on';
				self.sendCommand(cmd);
			}
		};

		actionsArr.silenceDetectorOff = {
			label: 'Turn Silence Detector Off',
			callback: function (action, bank) {
				let cmd = 'cmd=silencedetector off';
				self.sendCommand(cmd);
			}
		};

		actionsArr.playRequestedSong = {
			label: 'Play Requested Song',
			options: [
				{
					type: 'checkbox',
					label: 'Delay Request',
					id: 'delay',
					default: false
				},
				{
					type: 'number',
					label: 'Minimum Delay Duration Before Playing (in minutes)',
					id: 'duration',
					default: 30,
					isVisible: (action) => action.options.delay === true,
				}
			],
			callback: function (action, bank) {
				let cmd = 'cmd=playrequestedsong';

				if (action.options.delay) {
					cmd += ' ' + action.options.duration;
				}

				self.sendCommand(cmd);
			}
		};

		actionsArr.weather = {
			label: 'Set Weather City, Country',
			options: [
				{
					type: 'textinput',
					label: 'Weather City',
					id: 'city',
					default: 'New York'
				},
				{
					type: 'textinput',
					label: 'Country',
					id: 'country',
					default: 'US'
				}
			],			
			callback: function (action, bank) {
				let cmd = 'cmd=weather ' + action.options.city + ', ' + action.options.country;
				self.sendCommand(cmd);
			}
		};

		actionsArr.micOn = {
			label: 'Turn Mic On',
			callback: function (action, bank) {
				let cmd = 'action=mic&on=1';
				self.sendCommand(cmd, false);
			}
		};

		actionsArr.micOff = {
			label: 'Turn Mic Off',
			callback: function (action, bank) {
				let cmd = 'action=mic&on=0';
				self.sendCommand(cmd, false);
			}
		};

		this.setActions(actionsArr);
	},
}
