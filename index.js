var InstanceSkel = require('../../instance_skel');

const configFields = require('./src/configFields');
const variables = require('./src/variables');
const polling = require('./src/polling');
const actions = require('./src/actions');
const presets = require('./src/presets');
const feedbacks = require('./src/feedbacks');


class RadioBOSSInstance extends InstanceSkel {
	constructor(system, id, config) {
		super(system, id, config)

		this.config = config
		this.pollingInterval = undefined

		this.errorCount = 0;

		this.STATUS = {
			micStatus: false,
			streamarchiveStatus: false,
			version: '',
			uptime: '',
			currentTrack: {
				artist: '',
				title: '',
				album: '',
				year: '',
				genre: '',
				comment: '',
				duration: '',
				playcount: '',
				lastplayed: ''
			},
			previousTrack: {
				artist: '',
				title: '',
				album: '',
				year: '',
				genre: '',
				comment: '',
				duration: '',
				playcount: '',
				lastplayed: ''
			},
			nextTrack: {
				artist: '',
				title: '',
				album: '',
				year: '',
				genre: '',
				comment: '',
				duration: '',
				playcount: '',
				lastplayed: ''
			},
			playbackState: '',
			scheduler: false,
			shuffle: false,
			repeatTrack: false,
			repeatList: false,
			break: false,
			autoamp: false,
			httpRequest: false,
			manual: false,
			autointro: false,
			streamingListeners: '',
			encoders: []
		};

		// Assign the methods from the listed files to this class
		Object.assign(this, {
			...configFields,
			...variables,
			...polling,
			...actions,
			...presets,
			...feedbacks,
		})
	}

	init() {
		this.status(this.STATUS_UNKNOWN);

		// Update the config
		this.updateConfig()
	}

	updateConfig(config) {
		if (config) {
			this.config = config
		}

		// Quickly check if certain config values are present and continue setup
		if (this.config.host) {
			// Update the actions
			this.actions()

			this.feedbacks()

			// Update Variables
			this.updateVariableDefinitions();
			this.setVariable('module_state', 'OK');
			this.checkVariables();

			// Init the presets
			this.presets()

			// Start polling for updates
			this.initPolling()

			// Set status to OK
			//this.status(this.STATUS_OK)
		}
	}

	destroy() {
		// Cleanup polling
		if (this.pollingInterval) {
			clearInterval(this.pollingInterval)
		}

		this.debug('destroy', this.id);
	}
}

module.exports = RadioBOSSInstance;