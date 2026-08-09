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
					this.setVariable('module_state', 'Error - See Log');
					const errMsg = result.error?.code ?? result.error?.message ?? String(result.error ?? result.statusCode ?? 'unknown')
					if (errMsg.includes('ECONNREFUSED')) {
						this.log('error', 'Unable to connect to RadioBOSS. Check that it is running and the Remote Control API is enabled.')
					} else if (errMsg.includes('ETIMEDOUT') || errMsg.includes('ENOTFOUND')) {
						this.log('error', 'Connection to RadioBOSS timed out. Check the host and port settings.')
					} else if (result.statusCode) {
						this.log('error', `RadioBOSS returned HTTP ${result.statusCode}.`)
					} else {
						this.log('error', `RadioBOSS command failed: ${errMsg}`)
					}
				}
			} catch (error) {
				this.status(this.STATUS_ERROR);
				this.setVariable('module_state', 'Error - See Log');
				this.log('error', `An unexpected error has occurred: ${error}`);
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

		actionsArr.streamArchiveOn = {
			label: 'Turn Stream Archive Recording On',
			callback: function (action, bank) {
				self.STATUS.streamarchiveStatus = true
				self.sendCommand('cmd=streamarchive on');
				self.checkFeedbacks('recordIsOn')
			}
		};

		actionsArr.streamArchiveOff = {
			label: 'Turn Stream Archive Recording Off',
			callback: function (action, bank) {
				self.STATUS.streamarchiveStatus = false
				self.sendCommand('cmd=streamarchive off');
				self.checkFeedbacks('recordIsOn')
			}
		};

		actionsArr.streamArchiveAutoToggle = {
			label: 'Record Auto Toggle (ON if off, OFF if on)',
			callback: function () {
				self.STATUS.streamarchiveStatus = !self.STATUS.streamarchiveStatus
				self.sendCommand(self.STATUS.streamarchiveStatus ? 'cmd=streamarchive on' : 'cmd=streamarchive off')
				self.checkFeedbacks('recordIsOn')
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

		/*actionsArr.playRequestedSong = {
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
		};*/

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

		// ── State-aware auto toggle actions ──────────────────────────────────────
		// Each action reads the current live STATUS and sends the correct on/off
		// command at press time, so the button is always in sync even if RadioBOSS
		// was controlled manually outside Companion.

		actionsArr.micAutoToggle = {
			label: 'Mic Auto Toggle (ON if off, OFF if on)',
			callback: function () {
				self.sendCommand(self.STATUS.micStatus ? 'action=mic&on=0' : 'action=mic&on=1', false)
			}
		};

		actionsArr.schedulerAutoToggle = {
			label: 'Scheduler Auto Toggle (ON if off, OFF if on)',
			callback: function () {
				self.sendCommand(self.STATUS.scheduler ? 'cmd=scheduler off' : 'cmd=scheduler on')
			}
		};

		actionsArr.shuffleAutoToggle = {
			label: 'Shuffle Auto Toggle (ON if off, OFF if on)',
			callback: function () {
				self.sendCommand(self.STATUS.shuffle ? 'cmd=set shuffle off' : 'cmd=set shuffle on')
			}
		};

		actionsArr.repeatTrackAutoToggle = {
			label: 'Repeat Track Auto Toggle (ON if off, OFF if on)',
			callback: function () {
				self.sendCommand(self.STATUS.repeatTrack ? 'cmd=set repeat_track off' : 'cmd=set repeat_track on')
			}
		};

		actionsArr.repeatListAutoToggle = {
			label: 'Repeat List Auto Toggle (ON if off, OFF if on)',
			callback: function () {
				self.sendCommand(self.STATUS.repeatList ? 'cmd=set repeat_list off' : 'cmd=set repeat_list on')
			}
		};

		actionsArr.breakAutoToggle = {
			label: 'Break Auto Toggle (ON if off, OFF if on)',
			callback: function () {
				self.sendCommand(self.STATUS.break ? 'cmd=set break off' : 'cmd=set break on')
			}
		};

		actionsArr.encoderAutoToggle = {
			label: 'Encoder Auto Toggle (connect if off, disconnect if active — state-aware)',
			options: [
				{
					type: 'number',
					label: 'Server Number',
					id: 'server',
					default: 1,
					min: 1,
					max: 16,
				}
			],
			callback: function (action) {
				const serverNum = parseInt(action.options.server ?? 1)
				const encoder   = self.STATUS.encoders[serverNum - 1]
				const statusStr = (encoder?.status ?? '').toString().toLowerCase()
				const isActive  = statusStr === 'active' || statusStr === 'connected' || statusStr === '1'
				self.sendCommand(isActive ? `cmd=disconnect ${serverNum}` : `cmd=connect ${serverNum}`)
			}
		};

		// Smart Conn/Disc action — first press arms confirm mode (5 s window),
		// second press within 5 s executes connect or disconnect based on live state.
		// Timer expiry resets to normal without executing anything.
		actionsArr.encoderConfirmToggle = {
			label: 'Encoder Conn/Disc (Smart Confirm — 5 s window)',
			options: [
				{
					type: 'number',
					label: 'Server Number',
					id: 'server',
					default: 1,
					min: 1,
					max: 16,
				}
			],
			callback: function (action) {
				const serverNum = parseInt(action.options.server ?? 1)
				const server    = String(serverNum)

				if (!self._encoderConfirmState)  self._encoderConfirmState  = {}
				if (!self._encoderConfirmTimers) self._encoderConfirmTimers = {}

				if (self._encoderConfirmState[server]) {
					// Second press — execute and cancel timer
					clearTimeout(self._encoderConfirmTimers[server])
					self._encoderConfirmState[server]  = false
					self._encoderConfirmTimers[server] = undefined

					// Encoders array is 0-based; server option is 1-based
					const encoder    = self.STATUS.encoders[serverNum - 1]
					const statusStr  = (encoder?.status ?? '').toString().toLowerCase()
					const isActive   = statusStr === 'active' || statusStr === 'connected' || statusStr === '1'
					self.log('debug', `[encoderConfirmToggle] server=${serverNum} status="${statusStr}" isActive=${isActive} → ${isActive ? 'disconnect' : 'connect'}`)
					self.sendCommand(isActive ? `cmd=disconnect ${serverNum}` : `cmd=connect ${serverNum}`)
					self.checkFeedbacks('encoderConfirmFlash')
				} else {
					// First press — enter confirm mode, start 5 s auto-reset timer
					self._encoderConfirmState[server]  = true
					self._encoderConfirmTimers[server] = setTimeout(() => {
						self._encoderConfirmState[server]  = false
						self._encoderConfirmTimers[server] = undefined
						self.checkFeedbacks('encoderConfirmFlash')
					}, 5000)
					self.checkFeedbacks('encoderConfirmFlash')
				}
			}
		};

		// ── Schedule Events ──────────────────────────────────────────────────────

		actionsArr.scheduleRunEvent = {
			label: 'Run Schedule Event',
			options: [
				{
					type: 'dropdown',
					label: 'Event (from RadioBOSS schedule list)',
					id: 'eventIdDropdown',
					default: self.STATUS.scheduleEvents[0]?.id ?? '',
					choices: self.STATUS.scheduleEvents.length > 0
						? self.STATUS.scheduleEvents
						: [{ id: '', label: '(No events loaded — press Refresh Events button first)' }],
				},
				{
					type: 'checkbox',
					label: 'Use manual Event ID instead',
					id: 'useManualId',
					default: false,
				},
				{
					type: 'textinput',
					label: 'Manual Event ID',
					id: 'id',
					default: '',
					tooltip: 'Find IDs by opening in a browser: http://HOST:PORT/API_PATH?pass=PASSWORD&action=schedule&type=list',
					isVisible: (options) => options.useManualId === true,
				},
				{
					type: 'checkbox',
					label: 'Skip next (run immediately without waiting for current track)',
					id: 'skipnext',
					default: false,
				}
			],
			callback: function (action) {
				const id = action.options.useManualId
					? (action.options.id ?? '')
					: (action.options.eventIdDropdown ?? '')
				if (!id) {
					self.log('warn', 'Run Schedule Event: no event selected or Event ID configured')
					return
				}
				let cmd = `action=schedule&type=run&id=${id}`
				if (action.options.skipnext) cmd += '&skipnext=1'
				self.sendCommand(cmd)
			}
		};

		actionsArr.scheduleRefreshEvents = {
			label: 'Refresh Schedule Events List',
			callback: function () {
				self.fetchScheduleEvents()
			}
		};

		this.setActions(actionsArr);
	},
}
