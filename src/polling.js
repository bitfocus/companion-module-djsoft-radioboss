const RadioBOSS = require('./radioboss')
const {parseString} = require('xml2js');

async function getData(type, cmd) {
	let self = this;

	const connection = new RadioBOSS(self.config);

	const result = await connection.sendRequest(cmd);

	//do something with xml
	try {
		if (result && result.response && result.response.body) {
			let readable = result.response.body;
			const chunks = [];
		
			readable.on('readable', () => {
				let chunk;
				while (null !== (chunk = readable.read())) {
					chunks.push(chunk);
				}
			});
		
			readable.on('end', () => {
				const xmlContent = chunks.join('');
				try {	
					if (type == 'status') {
						parseString(xmlContent, function (err, result) {
							try {
									if (result.Status && result.Status.Player)
									{
										self.STATUS.version = result.Status.Player[0]['$']['version'];
										let uptime = parseInt(result.Status.Player[0]['$']['uptime']);
										let uptimeHours = Math.floor(uptime / 3600);
										uptime = uptime - (uptimeHours * 3600);
										let uptimeMinutes = Math.floor(uptime / 60);
										let uptimeSeconds = uptime % 60;
										self.STATUS.uptime = uptimeHours +'h' + uptimeMinutes + 'm' + uptimeSeconds + 's';
									}
								
								self.checkVariables();
								self.checkFeedbacks();
							}
							catch(error) {
								if (this.config.verbose) {
									this.log('error', `Error Getting ${type} Data: ${error}`);
								}
								this.status(this.STATUS_ERROR);
							}
						});
					}
		
					if (type == 'playbackinfo') {
						parseString(xmlContent, function (err, result) {
							try {
									if (result.Info)
									{
										if (result.Info.CurrentTrack) {
											self.STATUS.currentTrack.artist 		= result.Info.CurrentTrack[0]['TRACK'][0]['$']['ARTIST'];
											self.STATUS.currentTrack.title 			= result.Info.CurrentTrack[0]['TRACK'][0]['$']['TITLE'];
											self.STATUS.currentTrack.album 			= result.Info.CurrentTrack[0]['TRACK'][0]['$']['ALBUM'];
											self.STATUS.currentTrack.year 			= result.Info.CurrentTrack[0]['TRACK'][0]['$']['YEAR'];
											self.STATUS.currentTrack.genre 			= result.Info.CurrentTrack[0]['TRACK'][0]['$']['GENRE'];
											self.STATUS.currentTrack.comment 		= result.Info.CurrentTrack[0]['TRACK'][0]['$']['COMMENT'];
											self.STATUS.currentTrack.duration 		= result.Info.CurrentTrack[0]['TRACK'][0]['$']['DURATION'];
											self.STATUS.currentTrack.playcount 		= result.Info.CurrentTrack[0]['TRACK'][0]['$']['PLAYCOUNT'];
											self.STATUS.currentTrack.lastplaye 		= result.Info.CurrentTrack[0]['TRACK'][0]['$']['LASTPLAYED'];
										}
		
										if (result.Info.PreviousTrack) {
											self.STATUS.previousTrack.artist 		= result.Info.PreviousTrack[0]['TRACK'][0]['$']['ARTIST'];
											self.STATUS.previousTrack.title 		= result.Info.PreviousTrack[0]['TRACK'][0]['$']['TITLE'];
											self.STATUS.previousTrack.album 		= result.Info.PreviousTrack[0]['TRACK'][0]['$']['ALBUM'];
											self.STATUS.previousTrack.year 			= result.Info.PreviousTrack[0]['TRACK'][0]['$']['YEAR'];
											self.STATUS.previousTrack.genre 		= result.Info.PreviousTrack[0]['TRACK'][0]['$']['GENRE'];
											self.STATUS.previousTrack.comment 		= result.Info.PreviousTrack[0]['TRACK'][0]['$']['COMMENT'];
											self.STATUS.previousTrack.duration 		= result.Info.PreviousTrack[0]['TRACK'][0]['$']['DURATION'];
											self.STATUS.previousTrack.playcount 	= result.Info.PreviousTrack[0]['TRACK'][0]['$']['PLAYCOUNT'];
											self.STATUS.previousTrack.lastplaye 	= result.Info.PreviousTrack[0]['TRACK'][0]['$']['LASTPLAYED'];
										}
		
										if (result.Info.NextTrack) {
											self.STATUS.nextTrack.artist 			= result.Info.NextTrack[0]['TRACK'][0]['$']['ARTIST'];
											self.STATUS.nextTrack.title 			= result.Info.NextTrack[0]['TRACK'][0]['$']['TITLE'];
											self.STATUS.nextTrack.album 			= result.Info.NextTrack[0]['TRACK'][0]['$']['ALBUM'];
											self.STATUS.nextTrack.year 				= result.Info.NextTrack[0]['TRACK'][0]['$']['YEAR'];
											self.STATUS.nextTrack.genre 			= result.Info.NextTrack[0]['TRACK'][0]['$']['GENRE'];
											self.STATUS.nextTrack.comment 			= result.Info.NextTrack[0]['TRACK'][0]['$']['COMMENT'];
											self.STATUS.nextTrack.duration 			= result.Info.NextTrack[0]['TRACK'][0]['$']['DURATION'];
											self.STATUS.nextTrack.playcount 		= result.Info.NextTrack[0]['TRACK'][0]['$']['PLAYCOUNT'];
											self.STATUS.nextTrack.lastplaye 		= result.Info.NextTrack[0]['TRACK'][0]['$']['LASTPLAYED'];
										}
		
										if (result.Info.Playback) {
											self.STATUS.playbackState				= result.Info.Playback[0]['$']['state'];
										}
		
										if (result.Info.Options) {
											if (result.Info.Options[0]['$']['repeat_track']) {
												self.STATUS.repeatTrack = Boolean(parseInt(result.Info.Options[0]['$']['repeat_track']));
											}
											else {
												self.STATUS.repeatTrack = false;
											}

											if (result.Info.Options[0]['$']['repeat_list']) {
												self.STATUS.repeatList = Boolean(parseInt(result.Info.Options[0]['$']['repeat_list']));
											}
											else {
												self.STATUS.repeatList = false;
											}

											if (result.Info.Options[0]['$']['shuffle']) {
												self.STATUS.shuffle = Boolean(parseInt(result.Info.Options[0]['$']['shuffle']));
											}
											else {
												self.STATUS.shuffle = false;
											}
										}
		
										if (result.Info.Features) {
											if (result.Info.Features[0]['$']['scheduler']) {
												self.STATUS.scheduler = Boolean(parseInt(result.Info.Features[0]['$']['scheduler']));
											}
											else {
												self.STATUS.scheduler = false;
											}
										}
		
										if (result.Info.Streaming) {
											self.STATUS.streamingListeners			= result.Info.Streaming[0]['$']['listeners'];
										}
									}
								
								self.checkVariables();
								self.checkFeedbacks();
							}
							catch(error) {
								if (this.config.verbose) {
									this.log('error', `Error Getting ${type} Data: ${error}`);
								}
								this.status(this.STATUS_ERROR);
							}
						});
					}
		
					if (type == 'mic') {
						self.STATUS.micStatus = Boolean(parseInt(xmlContent));
						self.checkVariables();
						self.checkFeedbacks();
					}
		
					if (type == 'encoderstatus') {
						parseString(xmlContent, function (err, result) {
							let resultString =  JSON.stringify(result);
							if (self.lastEncoderContent !== resultString) { //keep it from showing up in the log a million times
								self.log('debug', resultString);
								self.lastEncoderContent = resultString;
							}
						});
					}
		
					if (type == 'streamarchivestatus') {
						self.STATUS.streamarchiveStatus = Boolean(parseInt(xmlContent));
						self.checkVariables();
						self.checkFeedbacks();
					}
				}
				catch(error) {
					if (this.config.verbose) {
						this.log('error', `Error Getting ${type} Data: ${error}`);
					}
					this.status(this.STATUS_ERROR);
				}
			});
		}
		else {
			if (!this.errorCount) {
				if (this.config.verbose) {
					this.log('error', `Error Getting ${type} Data: No response received from server. Is the Server Online?`);
				}
				this.status(this.STATUS_ERROR);
				this.setVariable('module_state', 'Error - See Log');
			}
			
			// Cleanup polling
			if (this.pollingInterval) {
				this.log('debug', 'Stopping polling.');
				clearInterval(this.pollingInterval);
				this.pollingInterval = null;
			}

			this.errorCount++;
		}	
	}
	catch(error) {
		if (this.config.verbose) {
			this.log('error', `Error Getting ${type} Data: ${error}`);
		}
		this.status(this.STATUS_ERROR);
		this.setVariable('module_state', 'Error - See Log');
		// Cleanup polling
		if (this.pollingInterval) {
			clearInterval(this.pollingInterval);
			this.pollingInterval = null;
		}
	}	
}

module.exports = {
	/**
	 * Inits the polling logic
	 */
	initPolling() {
		let self = this;

		// Cleanup old interval
		if (this.pollingInterval) {
			clearInterval(this.pollingInterval)
		}

		// Setup polling if enabled and host is set
		if (this.config.polling && this.config.host) {
			this.log('debug', `Polling started. Requesting new data from server every ${this.config.pollingrate}ms`);

			//const connection = new RadioBOSS(this.config)
			this.pollingInterval = setInterval(async () => {
				this.status(this.STATUS_OK);

				getData.bind(self)('status', 'action=status');
				getData.bind(self)('playbackinfo', 'action=playbackinfo');
				getData.bind(self)('mic', 'action=mic');
				getData.bind(self)('encoderstatus', 'action=encoderstatus');
				getData.bind(self)('streamarchivestatus', 'action=streamarchivestatus');
			}, this.config.pollingrate)
		}
	},
}
