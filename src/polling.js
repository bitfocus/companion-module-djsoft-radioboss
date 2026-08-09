const RadioBOSS = require('./radioboss')
const {parseString} = require('xml2js');
const { isArray } = require('lodash');

async function getData(type, cmd) {
	let self = this;

	const connection = new RadioBOSS(self.config);

	const result = await connection.sendRequest(cmd);

	//do something with xml
	try {
		if (result && result.response && result.response.body) {
			self.errorCount = 0;
			self.status(self.STATUS_OK);
			self.setVariable('module_state', 'OK');
			let readable = result.response.body;
			const chunks = [];
		
			await new Promise((resolve) => {
				readable.on('readable', () => {
					let chunk;
					while (null !== (chunk = readable.read())) {
						chunks.push(chunk);
					}
				});

				readable.on('error', () => resolve());
			
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
								if (self.config.verbose) {
									self.log('error', `Error Getting ${type} Data: ${error}`);
								}
								self.status(self.STATUS_ERROR);
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
											self.STATUS.currentTrack.lastplayed 	= result.Info.CurrentTrack[0]['TRACK'][0]['$']['LASTPLAYED'];
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
											self.STATUS.previousTrack.lastplayed 	= result.Info.PreviousTrack[0]['TRACK'][0]['$']['LASTPLAYED'];
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
											self.STATUS.nextTrack.lastplayed 		= result.Info.NextTrack[0]['TRACK'][0]['$']['LASTPLAYED'];

											if (self.STATUS.nextTrack.artist == '') {
												self.STATUS.break = true;
											}
											else {
												self.STATUS.break = false;
											}
										}
		
										if (result.Info.Playback) {
											self.STATUS.playbackState = result.Info.Playback[0]['$']['state'];
										}
		
										if (result.Info.Options) {
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

											if (result.Info.Options[0]['$']['scheduler']) {
												self.STATUS.scheduler = Boolean(parseInt(result.Info.Options[0]['$']['scheduler']));
											}
											else {
												self.STATUS.scheduler = false;
											}											

											/*if (result.Info.Options[0]['$']['repeat_track']) {
												self.STATUS.repeatTrack = Boolean(parseInt(result.Info.Options[0]['$']['repeat_track']));
											}
											else {
												self.STATUS.repeatTrack = false;
											}*/								
										}
		
										if (result.Info.Features) {
											if (result.Info.Features[0]['$']['scheduler']) {
												self.STATUS.scheduler = Boolean(parseInt(result.Info.Features[0]['$']['scheduler']));
											}
											else {
												self.STATUS.scheduler = false;
											}

											/*if (result.Info.Features[0]['$']['autoamp']) {
												self.STATUS.autoamp = Boolean(parseInt(result.Info.Features[0]['$']['autoamp']));
											}
											else {
												self.STATUS.autoamp = false;
											}*/

											/*if (result.Info.Features[0]['$']['http_request']) {
												self.STATUS.httpRequest = Boolean(parseInt(result.Info.Features[0]['$']['http_request']));
											}
											else {
												self.STATUS.httpRequest = false;
											}*/

											/*if (result.Info.Features[0]['$']['manual']) {
												self.STATUS.manual = Boolean(parseInt(result.Info.Features[0]['$']['manual']));
											}
											else {
												self.STATUS.manual = false;
											}*/

											/*if (result.Info.Features[0]['$']['autointro']) {
												self.STATUS.autoIntro = Boolean(parseInt(result.Info.Features[0]['$']['autointro']));
											}
											else {
												self.STATUS.autoIntro = false;
											}*/
										}
		
										if (result.Info.Streaming) {
											self.STATUS.streamingListeners = result.Info.Streaming[0]['$']['listeners'];
										}
									}
								
								self.checkVariables();
								self.checkFeedbacks();
							}
							catch(error) {
								if (self.config.verbose) {
									self.log('error', `Error Getting ${type} Data: ${error}`);
								}
								self.status(self.STATUS_ERROR);
							}
						});
					}

					if (type == 'mic') {
						self.STATUS.micStatus = Boolean(parseInt(xmlContent));
						self.checkVariables();
						self.checkFeedbacks();
					}
		
					if (type == 'streamarchivestatus') {
						self.STATUS.streamarchiveStatus = Boolean(parseInt(xmlContent));
						self.checkVariables();
						self.checkFeedbacks();
					}

					if (type == 'encoderstatus') {
						parseString(xmlContent, function (err, result) {
							try {
								let encoderArray = result['Encoders']['Encoder'];
								if (isArray(encoderArray)) {
									let strEncoders = JSON.stringify(self.STATUS.encoders); //store the existing value as a string for comparison later

									self.STATUS.encoders = [];
									for (let i = 0; i < encoderArray.length; i++) {
										let encoder = encoderArray[i]['$'];
										let encoderObj = {};
										encoderObj.index = encoder['index'];
										encoderObj.status = encoder['status'];
										encoderObj.error = encoder['error'];
										encoderObj.name = encoder['name'];
										encoderObj.listeners = encoder['listeners'];

										//for UI dropdowns
										encoderObj.id = encoderObj['index'];
										encoderObj.label = encoderObj['name'];

										self.STATUS.encoders.push(encoderObj);
									}

									if (strEncoders !== JSON.stringify(self.STATUS.encoders)) {
										self.updateVariableDefinitions();
										self.feedbacks();
									}

									self.checkVariables();
									self.checkFeedbacks();
								}
							}
							catch(error) {
								//error processing encoders
								self.log('debug', 'Error processing encoders: ' + error);
							}
						});
					}
		
				}
				catch(error) {
					if (this.config.verbose) {
						this.log('error', `Error Getting ${type} Data: ${error}`);
					}
					this.status(this.STATUS_ERROR);
				}
				resolve();
			});
			});
		}
		else {
			self.errorCount++;
			if (self.errorCount === 1 || self.errorCount % 15 === 0) {
				const detail = result?.statusCode
					? ` HTTP ${result.statusCode}.`
					: result?.error
					? ` ${result.error.code ?? result.error.message ?? result.error}`
					: ''
				self.log('error', `RadioBOSS unreachable (${type}).${detail} Check host/port and that the Remote Control API is enabled in RadioBOSS settings.`)
				self.status(self.STATUS_ERROR);
				self.setVariable('module_state', 'Error - See Log');
			}
		}
	}
	catch(error) {
		self.errorCount++;
		if (self.errorCount === 1 || self.errorCount % 15 === 0) {
			self.log('error', `Error getting ${type} data: ${error}`);
			self.status(self.STATUS_ERROR);
			self.setVariable('module_state', 'Error - See Log');
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

			// TODO: Investigate reported disconnects after a few polling cycles.
			//const connection = new RadioBOSS(this.config)
			let pollInProgress = false;
			this.pollingInterval = setInterval(async () => {
				if (pollInProgress) {
					return;
				}

				pollInProgress = true;

				try {
					await getData.bind(self)('status', 'action=status');
					await getData.bind(self)('playbackinfo', 'action=playbackinfo');
					await getData.bind(self)('mic', 'action=mic');
					await getData.bind(self)('encoderstatus', 'action=encoderstatus');
					await getData.bind(self)('streamarchivestatus', 'action=streamarchivestatus');
				}
				finally {
					pollInProgress = false;
				}
			}, this.config.pollingrate)
		}
	},
}
