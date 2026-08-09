const { isArray } = require('lodash')

module.exports = {
	feedbacks() {
		let self = this
		const feedbacks = {}

		// Clear any stale animation interval from a previous init.
		// Companion re-issues subscribe callbacks for all live buttons after
		// setFeedbackDefinitions, which restarts the timer correctly.
		clearInterval(self._animInterval)
		self._animInterval = undefined
		self._animFeedbackSubscribers = 0

		// ── Color palette ────────────────────────────────────────────────────────
		const white      = self.rgb(255, 255, 255)
		const black      = self.rgb(0,   0,   0  )
		const red        = self.rgb(255, 0,   0  )
		const darkRed    = self.rgb(90,  0,   0  )
		const green      = self.rgb(0,   255, 0  )
		const darkGreen  = self.rgb(0,   60,  0  )
		const blue       = self.rgb(0,   80,  200)
		const darkBlue   = self.rgb(0,   20,  80 )
		const orange     = self.rgb(255, 102, 0  )
		const darkOrange = self.rgb(80,  30,  0  )

		// ── Helpers ──────────────────────────────────────────────────────────────

		// Shared animation timer — started when the first animated feedback is placed
		// on a button, stopped when the last one is removed.  Runs at 100 ms so that
		// any configured flash speed (including 250 ms) renders smoothly.
		function subscribeAnim() {
			self._animFeedbackSubscribers = (self._animFeedbackSubscribers || 0) + 1
			if (self._animFeedbackSubscribers === 1) {
				self._animInterval = setInterval(() => self.checkFeedbacks(), 100)
			}
		}
		function unsubscribeAnim() {
			self._animFeedbackSubscribers = Math.max(0, (self._animFeedbackSubscribers || 0) - 1)
			if (self._animFeedbackSubscribers === 0 && self._animInterval) {
				clearInterval(self._animInterval)
				self._animInterval = undefined
			}
		}

		// Used by legacy micActiveFlash / encoderActiveFlash (1 Hz, active-only).
		function flashStyle(active, color, altColor, activeText) {
			if (!active) return {}
			const on = Math.floor(Date.now() / 1000) % 2 === 0
			const style = { color: white, bgcolor: on ? color : altColor }
			if (activeText) style.text = on ? activeText : 'ACTIVE'
			return style
		}

		function isEncoderActive(encoder) {
			return encoder && encoder.status && encoder.status.toString().toLowerCase() === 'active'
		}

		// Builds the 10-option set shown in the Companion feedback editor.
		// `d` supplies the default values that are pre-filled for each feedback type.
		function buildToggleOptions(d) {
			const speedChoices = [
				{ id: '0',    label: 'No Flash   (solid color)' },
				{ id: '250',  label: 'Very Fast  (250 ms)' },
				{ id: '500',  label: 'Fast       (500 ms)' },
				{ id: '750',  label: 'Medium     (750 ms)' },
				{ id: '1000', label: 'Slow       (1 s)'    },
				{ id: '1500', label: 'Slow Pulse (1.5 s)'  },
				{ id: '2000', label: 'Very Slow  (2 s)'    },
			]
			return [
				// ── Active state (feature is ON / live) ──────────────────────────
				{
					type: 'textinput', label: 'Active — Label',
					id: 'activeText', default: d.activeText,
				},
				{
					type: 'colorpicker', label: 'Active — Text Color',
					id: 'activeTextColor', default: white,
				},
				{
					type: 'colorpicker', label: 'Active — Blink ON Color',
					id: 'activeColorOn', default: d.activeColorOn,
				},
				{
					type: 'colorpicker', label: 'Active — Blink OFF Color',
					id: 'activeColorOff', default: d.activeColorOff,
				},
				{
					type: 'dropdown', label: 'Active — Flash Speed',
					id: 'activeSpeed', default: '500', choices: speedChoices,
				},
				// ── Inactive state (feature is OFF) ──────────────────────────────
				{
					type: 'textinput', label: 'Inactive — Label',
					id: 'inactiveText', default: d.inactiveText,
				},
				{
					type: 'colorpicker', label: 'Inactive — Text Color',
					id: 'inactiveTextColor', default: white,
				},
				{
					type: 'colorpicker', label: 'Inactive — Blink ON Color',
					id: 'inactiveColorOn', default: d.inactiveColorOn,
				},
				{
					type: 'colorpicker', label: 'Inactive — Blink OFF Color',
					id: 'inactiveColorOff', default: d.inactiveColorOff,
				},
				{
					type: 'dropdown', label: 'Inactive — Flash Speed',
					id: 'inactiveSpeed', default: '1500', choices: speedChoices,
				},
			]
		}

		// Computes the button style for a toggle feedback.
		// `opt` = live feedback.options (may be empty if preset was never opened).
		// `fb`  = per-feedback hardcoded fallback values.
		function evalToggleFlash(active, opt, fb) {
			const now = Date.now()
			if (active) {
				const raw    = parseInt(opt.activeSpeed)
				const period = Number.isFinite(raw) ? raw : (fb.activeSpeed ?? 500)
				const on     = period === 0 ? true : Math.floor(now / period) % 2 === 0
				return {
					color:   opt.activeTextColor  ?? white,
					bgcolor: on
						? (opt.activeColorOn  ?? fb.activeColorOn)
						: (opt.activeColorOff ?? fb.activeColorOff),
					text: opt.activeText !== undefined ? opt.activeText : fb.activeText,
				}
			} else {
				const raw    = parseInt(opt.inactiveSpeed)
				const period = Number.isFinite(raw) ? raw : (fb.inactiveSpeed ?? 1500)
				const on     = period === 0 ? true : Math.floor(now / period) % 2 === 0
				return {
					color:   opt.inactiveTextColor ?? white,
					bgcolor: on
						? (opt.inactiveColorOn  ?? fb.inactiveColorOn)
						: (opt.inactiveColorOff ?? fb.inactiveColorOff),
					text: opt.inactiveText !== undefined ? opt.inactiveText : fb.inactiveText,
				}
			}
		}

		// ── Boolean feedbacks ────────────────────────────────────────────────────

		feedbacks['micStatus'] = {
			type: 'boolean',
			label: 'Mic — Is ON / OFF',
			description: 'Changes button style when Mic is in the selected state. Use "Change style properties" to set colours and PNG.',
			style: { color: white, bgcolor: red },
			options: [
				{
					type: 'dropdown', label: 'Indicate in X Status', id: 'status', default: 'true',
					choices: [{ id: 'false', label: 'Off' }, { id: 'true', label: 'On' }],
				},
			],
			callback: function (feedback) {
				return self.STATUS.micStatus.toString() === feedback.options.status.toString()
			},
		}

		feedbacks['scheduler'] = {
			type: 'boolean',
			label: 'Scheduler — Is ON / OFF',
			description: 'Changes button style when Scheduler is in the selected state. Use "Change style properties" to set colours and PNG.',
			style: { color: white, bgcolor: green },
			options: [
				{
					type: 'dropdown', label: 'Indicate in X Status', id: 'status', default: 'true',
					choices: [{ id: 'false', label: 'Off' }, { id: 'true', label: 'On' }],
				},
			],
			callback: function (feedback) {
				return self.STATUS.scheduler.toString() === feedback.options.status.toString()
			},
		}

		feedbacks['shuffle'] = {
			type: 'boolean',
			label: 'Shuffle — Is ON / OFF',
			description: 'Changes button style when Shuffle is in the selected state. Use "Change style properties" to set colours and PNG.',
			style: { color: white, bgcolor: green },
			options: [
				{
					type: 'dropdown', label: 'Indicate in X Status', id: 'status', default: 'true',
					choices: [{ id: 'false', label: 'Off' }, { id: 'true', label: 'On' }],
				},
			],
			callback: function (feedback) {
				return self.STATUS.shuffle.toString() === feedback.options.status.toString()
			},
		}

		feedbacks['repeat_track'] = {
			type: 'boolean',
			label: 'Repeat Track — Is ON / OFF',
			description: 'Changes button style when Repeat Track is in the selected state. Use "Change style properties" to set colours and PNG.',
			style: { color: white, bgcolor: blue },
			options: [
				{
					type: 'dropdown', label: 'Indicate in X Status', id: 'status', default: 'true',
					choices: [{ id: 'false', label: 'Off' }, { id: 'true', label: 'On' }],
				},
			],
			callback: function (feedback) {
				return self.STATUS.repeatTrack.toString() === feedback.options.status.toString()
			},
		}

		feedbacks['repeat_list'] = {
			type: 'boolean',
			label: 'Repeat List — Is ON / OFF',
			description: 'Changes button style when Repeat List is in the selected state. Use "Change style properties" to set colours and PNG.',
			style: { color: white, bgcolor: blue },
			options: [
				{
					type: 'dropdown', label: 'Indicate in X Status', id: 'status', default: 'true',
					choices: [{ id: 'false', label: 'Off' }, { id: 'true', label: 'On' }],
				},
			],
			callback: function (feedback) {
				return self.STATUS.repeatList.toString() === feedback.options.status.toString()
			},
		}

		feedbacks['break'] = {
			type: 'boolean',
			label: 'Break — Is ON / OFF',
			description: 'Changes button style when Break is in the selected state. Use "Change style properties" to set colours and PNG.',
			style: { color: white, bgcolor: orange },
			options: [
				{
					type: 'dropdown', label: 'Indicate in X Status', id: 'status', default: 'true',
					choices: [{ id: 'false', label: 'Off' }, { id: 'true', label: 'On' }],
				},
			],
			callback: function (feedback) {
				return self.STATUS.break.toString() === feedback.options.status.toString()
			},
		}

		feedbacks['encoder'] = {
			type: 'boolean',
			label: 'Encoder — Is Active / Offline',
			description: 'Changes button style when the selected encoder is in the chosen state. Use "Change style properties" to set colours and PNG.',
			style: { color: white, bgcolor: orange },
			options: [
				{
					type: 'dropdown', label: 'Encoder', id: 'encoder', default: '-1',
					choices: self.STATUS.encoders,
				},
				{
					type: 'dropdown', label: 'Indicate in X Status', id: 'status', default: 'active',
					choices: [{ id: 'active', label: 'Active (Online)' }, { id: 'off', label: 'Offline' }],
				},
			],
			callback: function (feedback) {
				const encoder = self.STATUS.encoders.find((enc) => enc.id === feedback.options.encoder)
				if (!encoder) return false
				return encoder.status.toString() === feedback.options.status.toString()
			},
		}

		feedbacks['recordIsOn'] = {
			type: 'boolean',
			label: 'Record — Is ON / OFF',
			description: 'Changes button style based on live stream archive recording state (polled from RadioBOSS). Use "Change style properties" to set colours and PNG.',
			style: { color: white, bgcolor: red },
			options: [
				{
					type: 'dropdown', label: 'Indicate in X Status', id: 'status', default: 'true',
					choices: [{ id: 'false', label: 'Off (not recording)' }, { id: 'true', label: 'On (recording)' }],
				},
			],
			callback: function (feedback) {
				return (self.STATUS.streamarchiveStatus === true).toString() === feedback.options.status.toString()
			},
		}

		// ── Legacy flash feedbacks (kept for back-compatibility) ─────────────────

		feedbacks['micActiveFlash'] = {
			type: 'advanced',
			label: 'Flash Button When Mic Is Active',
			description: 'Flashes while the mic is live. Requires polling.',
			options: [],
			subscribe: subscribeAnim,
			unsubscribe: unsubscribeAnim,
			callback: function () {
				return flashStyle(self.STATUS.micStatus === true, red, black, 'MIC\\nLIVE')
			},
		}

		feedbacks['encoderActiveFlash'] = {
			type: 'advanced',
			label: 'Flash Button When Any Encoder Is Active',
			description: 'Flashes while any encoder reports active. Requires polling.',
			options: [],
			subscribe: subscribeAnim,
			unsubscribe: unsubscribeAnim,
			callback: function () {
				const active = isArray(self.STATUS.encoders) && self.STATUS.encoders.some(isEncoderActive)
				return flashStyle(active, orange, black, 'ENCODER\\nLIVE')
			},
		}

		// ── Toggle flash feedbacks — fully configurable ──────────────────────────
		//
		// Each feedback drives a SINGLE toggle button: it handles both the action
		// (two-step: ON on press 1, OFF on press 2) and the visual animation.
		//
		// Options let you customise label, text colour, blink-ON colour,
		// blink-OFF colour, and flash speed independently for the active and
		// inactive states.  When options are empty (e.g. freshly dropped preset)
		// the hardcoded fallback values inside evalToggleFlash() are used.

		feedbacks['micToggleFlash'] = {
			type: 'advanced',
			label: 'Mic Toggle — Configurable Animated Toggle Button',
			description: 'Same button toggles mic ON↔OFF and shows live state. Fast flash when live, slow pulse when off. All colours, labels, and speeds are customisable. Requires polling.',
			options: buildToggleOptions({
				activeText:      'MIC\\nLIVE', activeColorOn:   red,       activeColorOff:   black,
				inactiveText:    'MIC\\nOFF',  inactiveColorOn: darkRed,   inactiveColorOff: black,
			}),
			subscribe: subscribeAnim,
			unsubscribe: unsubscribeAnim,
			callback: function (feedback) {
				return evalToggleFlash(self.STATUS.micStatus === true, feedback.options, {
					activeText: 'MIC\\nLIVE', activeSpeed: 500,  activeColorOn: red,       activeColorOff: black,
					inactiveText: 'MIC\\nOFF', inactiveSpeed: 1500, inactiveColorOn: darkRed, inactiveColorOff: black,
				})
			},
		}

		feedbacks['schedulerToggleFlash'] = {
			type: 'advanced',
			label: 'Scheduler Toggle — Configurable Animated Toggle Button',
			description: 'Same button toggles scheduler ON↔OFF and shows live state. Fast green flash when on, slow dim pulse when off. Fully customisable. Requires polling.',
			options: buildToggleOptions({
				activeText:      'SCHED\\nON',  activeColorOn:   green,     activeColorOff:   black,
				inactiveText:    'SCHED\\nOFF', inactiveColorOn: darkGreen, inactiveColorOff: black,
			}),
			subscribe: subscribeAnim,
			unsubscribe: unsubscribeAnim,
			callback: function (feedback) {
				return evalToggleFlash(self.STATUS.scheduler === true, feedback.options, {
					activeText: 'SCHED\\nON', activeSpeed: 500, activeColorOn: green, activeColorOff: black,
					inactiveText: 'SCHED\\nOFF', inactiveSpeed: 1500, inactiveColorOn: darkGreen, inactiveColorOff: black,
				})
			},
		}

		feedbacks['shuffleToggleFlash'] = {
			type: 'advanced',
			label: 'Shuffle Toggle — Configurable Animated Toggle Button',
			description: 'Same button toggles shuffle ON↔OFF and shows live state. Fast green flash when on, slow dim pulse when off. Fully customisable. Requires polling.',
			options: buildToggleOptions({
				activeText:      'SHUFFLE\\nON',  activeColorOn:   green,     activeColorOff:   black,
				inactiveText:    'SHUFFLE\\nOFF', inactiveColorOn: darkGreen, inactiveColorOff: black,
			}),
			subscribe: subscribeAnim,
			unsubscribe: unsubscribeAnim,
			callback: function (feedback) {
				return evalToggleFlash(self.STATUS.shuffle === true, feedback.options, {
					activeText: 'SHUFFLE\\nON', activeSpeed: 500, activeColorOn: green, activeColorOff: black,
					inactiveText: 'SHUFFLE\\nOFF', inactiveSpeed: 1500, inactiveColorOn: darkGreen, inactiveColorOff: black,
				})
			},
		}

		feedbacks['repeatTrackToggleFlash'] = {
			type: 'advanced',
			label: 'Repeat Track Toggle — Configurable Animated Toggle Button',
			description: 'Same button toggles repeat track ON↔OFF and shows live state. Fast blue flash when on, slow dim pulse when off. Fully customisable. Requires polling.',
			options: buildToggleOptions({
				activeText:      'RPT TRK\\nON',  activeColorOn:   blue,     activeColorOff:   black,
				inactiveText:    'RPT TRK\\nOFF', inactiveColorOn: darkBlue, inactiveColorOff: black,
			}),
			subscribe: subscribeAnim,
			unsubscribe: unsubscribeAnim,
			callback: function (feedback) {
				return evalToggleFlash(self.STATUS.repeatTrack === true, feedback.options, {
					activeText: 'RPT TRK\\nON', activeSpeed: 500, activeColorOn: blue, activeColorOff: black,
					inactiveText: 'RPT TRK\\nOFF', inactiveSpeed: 1500, inactiveColorOn: darkBlue, inactiveColorOff: black,
				})
			},
		}

		feedbacks['repeatListToggleFlash'] = {
			type: 'advanced',
			label: 'Repeat List Toggle — Configurable Animated Toggle Button',
			description: 'Same button toggles repeat list ON↔OFF and shows live state. Fast blue flash when on, slow dim pulse when off. Fully customisable. Requires polling.',
			options: buildToggleOptions({
				activeText:      'RPT LST\\nON',  activeColorOn:   blue,     activeColorOff:   black,
				inactiveText:    'RPT LST\\nOFF', inactiveColorOn: darkBlue, inactiveColorOff: black,
			}),
			subscribe: subscribeAnim,
			unsubscribe: unsubscribeAnim,
			callback: function (feedback) {
				return evalToggleFlash(self.STATUS.repeatList === true, feedback.options, {
					activeText: 'RPT LST\\nON', activeSpeed: 500, activeColorOn: blue, activeColorOff: black,
					inactiveText: 'RPT LST\\nOFF', inactiveSpeed: 1500, inactiveColorOn: darkBlue, inactiveColorOff: black,
				})
			},
		}

		feedbacks['breakToggleFlash'] = {
			type: 'advanced',
			label: 'Break Toggle — Configurable Animated Toggle Button',
			description: 'Same button toggles break ON↔OFF and shows live state. Fast orange flash when on, slow dim pulse when off. Fully customisable. Requires polling.',
			options: buildToggleOptions({
				activeText:      'BREAK\\nON',  activeColorOn:   orange,     activeColorOff:   black,
				inactiveText:    'BREAK\\nOFF', inactiveColorOn: darkOrange, inactiveColorOff: black,
			}),
			subscribe: subscribeAnim,
			unsubscribe: unsubscribeAnim,
			callback: function (feedback) {
				return evalToggleFlash(self.STATUS.break === true, feedback.options, {
					activeText: 'BREAK\\nON', activeSpeed: 500, activeColorOn: orange, activeColorOff: black,
					inactiveText: 'BREAK\\nOFF', inactiveSpeed: 1500, inactiveColorOn: darkOrange, inactiveColorOff: black,
				})
			},
		}

		// Server is a dropdown populated from the live encoder list so the ID always
		// matches what RadioBOSS reports in the encoderstatus XML (avoids 0-vs-1 offset).
		feedbacks['encoderToggleFlash'] = {
			type: 'advanced',
			label: 'Encoder Toggle — Configurable Animated Toggle Button',
			description: 'Same button connects/disconnects the selected encoder and shows its live state. Fast orange flash when active, slow dim pulse when off. Select the server from the dropdown; labels, colours, and speeds are fully customisable. Requires polling.',
			options: [
				{
					type: 'dropdown', label: 'Server', id: 'server',
					default: self.STATUS.encoders[0]?.id ?? '-1',
					choices: self.STATUS.encoders,
				},
				...buildToggleOptions({
					activeText:      'ENC\\nLIVE', activeColorOn:   orange,     activeColorOff:   black,
					inactiveText:    'ENC\\nOFF',  inactiveColorOn: darkOrange, inactiveColorOff: black,
				}),
			],
			subscribe: subscribeAnim,
			unsubscribe: unsubscribeAnim,
			callback: function (feedback) {
				const serverStr = String(feedback.options.server ?? '-1')
				const encoder   = self.STATUS.encoders.find(enc => String(enc.id) === serverStr)
				const active    = isEncoderActive(encoder)
				return evalToggleFlash(active, feedback.options, {
					activeText: 'ENC\\nLIVE', activeSpeed: 500,  activeColorOn: orange, activeColorOff: black,
					inactiveText: 'ENC\\nOFF', inactiveSpeed: 1500, inactiveColorOn: darkOrange, inactiveColorOff: black,
				})
			},
		}

		// Smart Conn/Disc button feedback.
		// Normal: shows CONNECT (green) or DISCONNECT (red) based on live encoder state.
		// Confirm: blinks fast "ARE\nYOU\nSURE?" while waiting for second press (5 s window).
		// All text, colours, and flash speed are configurable in the feedback editor.
		// PNG: add via the button's base style PNG upload in the button editor.
		feedbacks['encoderConfirmFlash'] = {
			type: 'advanced',
			label: 'Encoder Conn/Disc — Smart Confirm Button',
			description: 'Shows live connection state (CONNECT / DISCONNECT). On first press blinks "ARE YOU SURE?" for 5 s; second press executes; no second press = auto-resets. Requires polling.',
			options: [
				{
					type: 'number', label: 'Server Number', id: 'server',
					default: 1, min: 1, max: 16,
				},
				// ── Offline (not connected) state ─────────────────────────────────────
				{
					type: 'textinput', label: 'Offline — Label',
					id: 'offlineText', default: 'CONNECT',
				},
				{
					type: 'colorpicker', label: 'Offline — Background',
					id: 'offlineBg', default: green,
				},
				{
					type: 'colorpicker', label: 'Offline — Text Color',
					id: 'offlineColor', default: white,
				},
				// ── Online (connected) state ──────────────────────────────────────────
				{
					type: 'textinput', label: 'Online — Label',
					id: 'onlineText', default: 'DISCONNECT',
				},
				{
					type: 'colorpicker', label: 'Online — Background',
					id: 'onlineBg', default: red,
				},
				{
					type: 'colorpicker', label: 'Online — Text Color',
					id: 'onlineColor', default: white,
				},
				// ── Confirmation (blinking) state ─────────────────────────────────────
				{
					type: 'textinput', label: 'Confirm — Label',
					id: 'confirmText', default: 'ARE\\nYOU\\nSURE?',
				},
				{
					type: 'colorpicker', label: 'Confirm — Flash Color ON',
					id: 'confirmColorOn', default: orange,
				},
				{
					type: 'colorpicker', label: 'Confirm — Flash Color OFF',
					id: 'confirmColorOff', default: black,
				},
				{
					type: 'colorpicker', label: 'Confirm — Text Color',
					id: 'confirmTextColor', default: white,
				},
				{
					type: 'dropdown', label: 'Confirm — Flash Speed',
					id: 'confirmSpeed', default: '250',
					choices: [
						{ id: '100',  label: 'Very Fast (100 ms)' },
						{ id: '250',  label: 'Fast      (250 ms)' },
						{ id: '500',  label: 'Medium    (500 ms)' },
						{ id: '750',  label: 'Slow      (750 ms)' },
					],
				},
			],
			subscribe: subscribeAnim,
			unsubscribe: unsubscribeAnim,
			callback: function (feedback) {
				const server    = String(feedback.options.server ?? 1)
				const inConfirm = (self._encoderConfirmState ?? {})[server] === true

				if (inConfirm) {
					const period = parseInt(feedback.options.confirmSpeed) || 250
					const on     = Math.floor(Date.now() / period) % 2 === 0
					return {
						color:   feedback.options.confirmTextColor ?? white,
						bgcolor: on
							? (feedback.options.confirmColorOn  ?? orange)
							: (feedback.options.confirmColorOff ?? black),
						text: feedback.options.confirmText ?? 'ARE\\nYOU\\nSURE?',
					}
				}

				// Encoders array is 0-based; server option is 1-based
				const encoder   = self.STATUS.encoders[parseInt(server) - 1]
				const statusStr = (encoder?.status ?? '').toString().toLowerCase()
				const isActive  = statusStr === 'active' || statusStr === 'connected' || statusStr === '1'

				if (isActive) {
					return {
						color:   feedback.options.onlineColor ?? white,
						bgcolor: feedback.options.onlineBg    ?? red,
						text:    feedback.options.onlineText  ?? 'DISCONNECT',
					}
				}
				return {
					color:   feedback.options.offlineColor ?? white,
					bgcolor: feedback.options.offlineBg    ?? green,
					text:    feedback.options.offlineText  ?? 'CONNECT',
				}
			},
		}

		self.setFeedbackDefinitions(feedbacks)
	},
}
