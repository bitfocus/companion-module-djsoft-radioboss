const {
	InstanceBase,
	InstanceStatus,
	Regex,
	combineRgb,
	runEntrypoint,
} = require('@companion-module/base')

const configFields = require('./src/configFields')
const variables = require('./src/variables')
const polling = require('./src/polling')
const actions = require('./src/actions')
const presets = require('./src/presets')
const feedbacks = require('./src/feedbacks')
const schedule = require('./src/schedule')

function createInitialStatus() {
	return {
		micStatus: false,
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
			lastplayed: '',
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
			lastplayed: '',
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
			lastplayed: '',
		},
		playbackState: '',
		scheduler: false,
		shuffle: false,
		repeatTrack: false,
		repeatList: false,
		break: false,
		streamingListeners: '',
		streamarchiveStatus: false,
		encoders: [{ id: '-1', label: 'No Encoders Loaded.' }],
		scheduleEvents: [],
	}
}

function normalizeActionDefinitions(definitions) {
	return Object.fromEntries(
		Object.entries(definitions ?? {}).map(([id, definition]) => [
			id,
			{
				...definition,
				name: definition.name ?? definition.label ?? id,
				options: definition.options ?? [],
			},
		])
	)
}

function normalizeFeedbackDefinitions(definitions) {
	return Object.fromEntries(
		Object.entries(definitions ?? {}).map(([id, definition]) => {
			const normalized = {
				...definition,
				name: definition.name ?? definition.label ?? id,
				options: definition.options ?? [],
			}

			if (normalized.type === 'boolean' && definition.style && !definition.defaultStyle) {
				normalized.defaultStyle = definition.style
			}

			delete normalized.label
			delete normalized.style

			return [id, normalized]
		})
	)
}

function normalizePresetDefinitions(definitions) {
	if (!Array.isArray(definitions)) {
		return definitions ?? {}
	}

	return Object.fromEntries(
		definitions.map((definition, index) => [
			definition.id ?? `preset_${index + 1}`,
			{
				...definition,
				type: definition.type ?? 'button',
				name: definition.name ?? definition.label ?? `Preset ${index + 1}`,
				options: definition.options ?? {},
				style: definition.style ?? definition.bank ?? {},
				feedbacks: definition.feedbacks ?? [],
				steps: definition.steps ?? [],
			},
		])
	)
}

function normalizeVariableDefinitions(definitions) {
	return (definitions ?? []).map((definition) => ({
		variableId: definition.variableId ?? definition.name ?? definition.id,
		name: definition.label ?? definition.name ?? definition.variableId ?? definition.id,
	}))
}

function normalizeLogMessage(message) {
	if (message === undefined || message === null) {
		return ''
	}

	return typeof message === 'string' ? message : JSON.stringify(message)
}

class RadioBOSSInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

		this.config = {}
		this.pollingInterval = undefined
		this.errorCount = 0
		this._animFeedbackSubscribers = 0
		this._animInterval = undefined
		this._encoderConfirmState  = {}
		this._encoderConfirmTimers = {}

		// Compatibility shims for the legacy source files.
		this.REGEX_IP = Regex.IP
		this.REGEX_PORT = Regex.PORT
		this.STATUS_OK = InstanceStatus.Ok
		this.STATUS_ERROR = InstanceStatus.ConnectionFailure
		this.STATUS_UNKNOWN = InstanceStatus.UnknownWarning
		this.STATUS = createInitialStatus()

		Object.assign(this, {
			...configFields,
			...variables,
			...polling,
			...actions,
			...presets,
			...feedbacks,
			...schedule,
		})
	}

	rgb(red, green, blue) {
		return combineRgb(red, green, blue)
	}

	debug(level, message) {
		this.log(level === 'info' ? 'debug' : level, normalizeLogMessage(message))
	}

	status(status, message) {
		this.updateStatus(status ?? InstanceStatus.UnknownWarning, message)
	}

	setVariable(variableId, value) {
		this.setVariableValues({
			[variableId]: value ?? '',
		})
	}

	setActions(definitions) {
		this.setActionDefinitions(normalizeActionDefinitions(definitions))
	}

	setFeedbackDefinitions(definitions) {
		super.setFeedbackDefinitions(normalizeFeedbackDefinitions(definitions))
	}

	setPresetDefinitions(definitions) {
		super.setPresetDefinitions(normalizePresetDefinitions(definitions))
	}

	setVariableDefinitions(definitions) {
		super.setVariableDefinitions(normalizeVariableDefinitions(definitions))
	}

	getConfigFields() {
		return this.config_fields()
	}

	async init(config) {
		this.config = config
		await this.rebuildModuleState()
	}

	async configUpdated(config) {
		this.config = config
		await this.rebuildModuleState()
	}

	async rebuildModuleState() {
		this.actions()
		this.feedbacks()
		this.updateVariableDefinitions()
		this.presets()
		this.checkVariables()

		if (!this.config.host) {
			this.setVariable('module_state', 'Not Configured')
			this.updateStatus(InstanceStatus.BadConfig, 'Host is required')
			if (this.pollingInterval) {
				clearInterval(this.pollingInterval)
				this.pollingInterval = undefined
			}
			return
		}

		this.setVariable('module_state', 'OK')
		this.updateStatus(InstanceStatus.Ok)
		this.initPolling()
		this.fetchScheduleEvents()
	}

	async destroy() {
		if (this.pollingInterval) {
			clearInterval(this.pollingInterval)
			this.pollingInterval = undefined
		}

		if (this._animInterval) {
			clearInterval(this._animInterval)
			this._animInterval = undefined
		}

		Object.values(this._encoderConfirmTimers ?? {}).forEach(t => clearTimeout(t))

		this.log('debug', `destroy ${this.id}`)
	}
}

runEntrypoint(RadioBOSSInstance, [])
