const { isArray } = require("lodash");

module.exports = {
	updateVariableDefinitions() {
		let variables = [
			{ label: 'Module State', 					name: 'module_state'},

			{ label: 'Version', 					name: 'version'},
			{ label: 'Uptime', 						name: 'uptime'},

			{ label: 'Mic Status', 					name: 'mic_status'},
			{ label: 'Stream Archive Status', 		name: 'streamarchive_status'},

			{ label: 'Playback State', 				name: 'playback_state'},

			{ label: 'Current Track Artist', 		name: 'current_track_artist'},
			{ label: 'Current Track Title', 		name: 'current_track_title'},
			{ label: 'Current Track Album',			name: 'current_track_album'},
			{ label: 'Current Track Year', 			name: 'current_track_year'},
			{ label: 'Current Track Genre', 		name: 'current_track_genre'},
			{ label: 'Current Track Comment', 		name: 'current_track_comment'},
			{ label: 'Current Track Duration', 		name: 'current_track_duration'},
			{ label: 'Current Track Play Count', 	name: 'current_track_playcount'},
			{ label: 'Current Track Last Played', 	name: 'current_track_lastplayed'},

			{ label: 'Previous Track Artist', 		name: 'previous_track_artist'},
			{ label: 'Previous Track Title', 		name: 'previous_track_title'},
			{ label: 'Previous Track Album', 		name: 'previous_track_album'},
			{ label: 'Previous Track Year', 		name: 'previous_track_year'},
			{ label: 'Previous Track Genre', 		name: 'previous_track_genre'},
			{ label: 'Previous Track Comment', 		name: 'previous_track_comment'},
			{ label: 'Previous Track Duration', 	name: 'previous_track_duration'},
			{ label: 'Previous Track Play Count', 	name: 'previous_track_playcount'},
			{ label: 'Previous Track Last Played', 	name: 'previous_track_lastplayed'},

			{ label: 'Next Track Artist', 			name: 'next_track_artist'},
			{ label: 'Next Track Title',			name: 'next_track_title'},
			{ label: 'Next Track Album', 			name: 'next_track_album'},
			{ label: 'Next Track Year', 			name: 'next_track_year'},
			{ label: 'Next Track Genre', 			name: 'next_track_genre'},
			{ label: 'Next Track Comment', 			name: 'next_track_comment'},
			{ label: 'Next Track Duration', 		name: 'next_track_duration'},
			{ label: 'Next Track Play Count', 		name: 'next_track_playcount'},
			{ label: 'Next Track Last Played', 		name: 'next_track_lastplayed'},

			{ label: 'Scheduler', 					name: 'scheduler'},
			{ label: 'Shuffle', 					name: 'shuffle'},
			{ label: 'Repeat Track', 				name: 'repeat_track'},
			{ label: 'Repeat List', 				name: 'repeat_list'},
			{ label: 'Break', 						name: 'break'},
			//{ label: 'Automatic Volume Control', 	name: 'autoamp'},
			//{ label: 'HTTP Request', 				name: 'http_request'},
			{ label: 'Scheduler Manual Mode', 		name: 'manual'},
			{ label: 'Auto Intro', 					name: 'autointro'},

			{ label: 'Streaming Listeners', 		name: 'streaming_listeners'},
		]

		if (isArray(self.STATUS.encoders)) {
			for (let i = 0; i < self.STATUS.encoders.length; i++) {
				variables.push( { label: `Encoder ${(i+1)} Index`, name: `encoder_${(i+1)}_index`});
				variables.push( { label: `Encoder ${(i+1)} Name`, name: `encoder_${(i+1)}_name`});
				variables.push( { label: `Encoder ${(i+1)} Status`, name: `encoder_${(i+1)}_status`});
				variables.push( { label: `Encoder ${(i+1)} Error`, name: `encoder_${(i+1)}_error`});
				variables.push( { label: `Encoder ${(i+1)} Listeners`, name: `encoder_${(i+1)}_listeners`});
			}
		}

		this.setVariableDefinitions(variables);
	},

	checkVariables() {
		try {
			this.setVariable('version', 					this.STATUS.version);
			this.setVariable('uptime',						this.STATUS.uptime);

			this.setVariable('mic_status',					this.STATUS.micStatus ? 'On' : 'Off');
			this.setVariable('streamarchive_status',		this.STATUS.streamarchiveStatus ? 'On' : 'Off');

			this.setVariable('playback_state',				this.STATUS.playbackState);

			this.setVariable('current_track_artist',		this.STATUS.currentTrack.artist);
			this.setVariable('current_track_title',			this.STATUS.currentTrack.title);
			this.setVariable('current_track_album',			this.STATUS.currentTrack.album);
			this.setVariable('current_track_year',			this.STATUS.currentTrack.year);
			this.setVariable('current_track_genre',			this.STATUS.currentTrack.genre);
			this.setVariable('current_track_comment',		this.STATUS.currentTrack.comment);
			this.setVariable('current_track_duration',		this.STATUS.currentTrack.duration);
			this.setVariable('current_track_playcount',		this.STATUS.currentTrack.playcount);
			this.setVariable('current_track_lastplayed',	this.STATUS.currentTrack.lastplayed);

			this.setVariable('previous_track_artist',		this.STATUS.previousTrack.artist);
			this.setVariable('previous_track_title',		this.STATUS.previousTrack.title);
			this.setVariable('previous_track_album',		this.STATUS.previousTrack.album);
			this.setVariable('previous_track_year',			this.STATUS.previousTrack.year);
			this.setVariable('previous_track_genre',		this.STATUS.previousTrack.genre);
			this.setVariable('previous_track_comment',		this.STATUS.previousTrack.comment);
			this.setVariable('previous_track_duration',		this.STATUS.previousTrack.duration);
			this.setVariable('previous_track_playcount',	this.STATUS.previousTrack.playcount);
			this.setVariable('previous_track_lastplayed',	this.STATUS.previousTrack.lastplayed);

			this.setVariable('next_track_artist',			this.STATUS.nextTrack.artist);
			this.setVariable('next_track_title',			this.STATUS.nextTrack.title);
			this.setVariable('next_track_album',			this.STATUS.nextTrack.album);
			this.setVariable('next_track_year',				this.STATUS.nextTrack.year);
			this.setVariable('next_track_genre',			this.STATUS.nextTrack.genre);
			this.setVariable('next_track_comment',			this.STATUS.nextTrack.comment);
			this.setVariable('next_track_duration',			this.STATUS.nextTrack.duration);
			this.setVariable('next_track_playcount',		this.STATUS.nextTrack.playcount);
			this.setVariable('next_track_lastplayed',		this.STATUS.nextTrack.lastplayed);

			this.setVariable('scheduler',					this.STATUS.scheduler ? 'On' : 'Off');
			this.setVariable('shuffle',						this.STATUS.shuffle ? 'On' : 'Off');
			this.setVariable('repeat_track',				this.STATUS.repeatTrack ? 'On' : 'Off');
			this.setVariable('repeat_list',					this.STATUS.repeatList ? 'On' : 'Off');
			this.setVariable('break',						this.STATUS.break ? 'On' : 'Off');
			//this.setVariable('autoamp',						this.STATUS.autoamp ? 'On' : 'Off');
			//this.setVariable('http_request',				this.STATUS.httpRequest ? 'On' : 'Off');
			this.setVariable('manual',						this.STATUS.manual ? 'On' : 'Off');
			this.setVariable('autointro',					this.STATUS.autointro ? 'On' : 'Off');

			this.setVariable('streaming_listeners',			this.STATUS.streamingListeners);

			if (isArray(self.STATUS.encoders)) {
				for (let i = 0; i < self.STATUS.encoders.length; i++) {
					this.setVariable(`encoder_${(i+1)}_index`, this.STATUS.encoders[i].index);
					this.setVariable(`encoder_${(i+1)}_name`, this.STATUS.encoders[i].name);
					this.setVariable(`encoder_${(i+1)}_status`, this.STATUS.encoders[i].status);
					this.setVariable(`encoder_${(i+1)}_error`, this.STATUS.encoders[i].error);
					this.setVariable(`encoder_${(i+1)}_listeners`, this.STATUS.encoders[i].listeners);
				}
			}
		}
		catch(error) {
			//do something with that error
			if (this.config.verbose) {
				this.log('debug', 'Error Updating Variables: ' + error);
			}
		}
	}
}