module.exports = {
	presets() {
		const white = this.rgb(255, 255, 255)
		const black = this.rgb(0, 0, 0)
		const green = this.rgb(0, 180, 0)
		const red = this.rgb(220, 0, 0)
		const blue = this.rgb(0, 80, 200)
		const orange = this.rgb(255, 102, 0)
		const gray = this.rgb(45, 45, 45)

		const makeAction = (actionId, options = {}) => ({
			actionId,
			options,
		})

		// Single-step button with optional feedback.
		const makePreset = (category, name, text, bgcolor, actionId, actionOptions = {}, feedbacks = []) => ({
			type: 'button',
			category,
			name,
			style: {
				text,
				size: '18',
				color: white,
				bgcolor,
			},
			feedbacks,
			steps: [
				{
					down: actionId ? [makeAction(actionId, actionOptions)] : [],
					up: [],
				},
			],
		})

		// Two-step confirmation: Step 1 = normal look (tap to arm), Step 2 = execute.
		// Auto-resets to Step 1 after 5 s if the second tap never comes.
		// AFTER IMPORTING: edit the button → go to Step 2 → set background orange
		// and text "CONFIRM?\nTAP AGAIN" so the armed state is visually obvious.
		// Two-step confirmation: Step 1 = normal look (tap to arm, nothing executes).
		// Step 2 = confirm (tap again to execute, auto-progresses back to Step 1).
		// AFTER IMPORTING: edit the button → Step 2 → set background orange,
		// text "CONFIRM?\nTAP AGAIN" so the armed state is visually obvious.
		const makeConfirmPreset = (category, name, text, bgcolor, actionId, actionOptions = {}) => ({
			type: 'button',
			category,
			name,
			style: {
				text,
				size: '18',
				color: white,
				bgcolor,
			},
			options: {
				stepAutoProgress: true,
			},
			feedbacks: [],
			steps: [
				{
					// Step 1: arm — no action, just advances to Step 2 on press
					down: [],
					up: [],
				},
				{
					// Step 2: confirm — fires the RadioBOSS action, auto-progresses back to Step 1
					down: [makeAction(actionId, actionOptions)],
					up: [],
				},
			],
		})

		// Single-step toggle: uses a state-aware auto-toggle action so the button
		// always does the right thing even if RadioBOSS was changed manually.
		// The feedback drives the label and colour; base text is intentionally empty.
		const makeAutoTogglePreset = (category, name, autoActionId, autoOptions = {}, feedbackId, feedbackOptions = {}) => ({
			type: 'button',
			category,
			name,
			style: {
				text: '',
				size: '18',
				color: white,
				bgcolor: gray,
			},
			feedbacks: feedbackId ? [{ feedbackId, options: feedbackOptions }] : [],
			steps: [
				{
					down: [makeAction(autoActionId, autoOptions)],
					up: [],
				},
			],
		})

		const presets = {
			// ── Playback ──────────────────────────────────────────────────────────
			play_track_1: makePreset('Playback', 'Play Track 1', 'PLAY\\n1', green, 'play', { track: 1 }),
			stop: makePreset('Playback', 'Stop Playback', 'STOP', red, 'stop'),
			pause: makePreset('Playback', 'Pause Playback', 'PAUSE', orange, 'pause'),
			next: makePreset('Playback', 'Next Track', 'NEXT', blue, 'next', { fadeout: false, duration: 2000 }),
			fade_next: makePreset('Playback', 'Fade To Next Track', 'FADE\\nNEXT', blue, 'next', {
				fadeout: true,
				duration: 2000,
			}),
			volume_50: makePreset('Playback', 'Set Volume 50%', 'VOL\\n50%', gray, 'setVol', {
				volume: 50,
				specifyduration: false,
				duration: 2000,
			}),

			// ── Mic ───────────────────────────────────────────────────────────────
			mic_on: makePreset('Mic', 'Mic On', 'MIC\\nON', red, 'micOn', {}, [
				{ feedbackId: 'micActiveFlash', options: {} },
				{ feedbackId: 'micStatus', options: { status: 'true' } },
			]),
			mic_off: makePreset('Mic', 'Mic Off', 'MIC\\nOFF', gray, 'micOff', {}, [
				{ feedbackId: 'micStatus', options: { status: 'false' } },
			]),
			// Single-step toggle — reads live mic state, sends ON or OFF as needed.
			mic_toggle: makeAutoTogglePreset('Mic', 'Mic Toggle (ON↔OFF with Flash)', 'micAutoToggle', {}, 'micToggleFlash'),

			// ── Broadcasting ──────────────────────────────────────────────────────
			// Smart Conn/Disc — one button per encoder handles both connect AND disconnect.
			// Green = encoder offline (will connect on confirm).
			// Red   = encoder online  (will disconnect on confirm).
			// First press: blinks fast "ARE YOU SURE?" for 5 s.
			// Second press within 5 s: executes connect or disconnect.
			// No second press: auto-resets — nothing sent to RadioBOSS.
			// Customise text/colours/speed in the Feedbacks tab after importing.
			encoder_1_conndisco: {
				type: 'button', category: 'Broadcasting', name: 'Encoder 1 — Conn/Disc',
				style: { text: '', size: '18', color: white, bgcolor: gray },
				feedbacks: [{ feedbackId: 'encoderConfirmFlash', options: { server: 1 } }],
				steps: [{ down: [makeAction('encoderConfirmToggle', { server: 1 })], up: [] }],
			},
			encoder_2_conndisco: {
				type: 'button', category: 'Broadcasting', name: 'Encoder 2 — Conn/Disc',
				style: { text: '', size: '18', color: white, bgcolor: gray },
				feedbacks: [{ feedbackId: 'encoderConfirmFlash', options: { server: 2 } }],
				steps: [{ down: [makeAction('encoderConfirmToggle', { server: 2 })], up: [] }],
			},
			encoder_3_conndisco: {
				type: 'button', category: 'Broadcasting', name: 'Encoder 3 — Conn/Disc',
				style: { text: '', size: '18', color: white, bgcolor: gray },
				feedbacks: [{ feedbackId: 'encoderConfirmFlash', options: { server: 3 } }],
				steps: [{ down: [makeAction('encoderConfirmToggle', { server: 3 })], up: [] }],
			},
			encoder_4_conndisco: {
				type: 'button', category: 'Broadcasting', name: 'Encoder 4 — Conn/Disc',
				style: { text: '', size: '18', color: white, bgcolor: gray },
				feedbacks: [{ feedbackId: 'encoderConfirmFlash', options: { server: 4 } }],
				steps: [{ down: [makeAction('encoderConfirmToggle', { server: 4 })], up: [] }],
			},
			record_on: makePreset('Broadcasting', 'Record On', 'REC\\nON', red, 'streamArchiveOn', {}, [
				{ feedbackId: 'recordIsOn', options: { status: 'true' } },
			]),
			record_off: makePreset('Broadcasting', 'Record Off', 'REC\\nOFF', gray, 'streamArchiveOff', {}, [
				{ feedbackId: 'recordIsOn', options: { status: 'false' } },
			]),
			record_toggle: {
				type: 'button', category: 'Broadcasting', name: 'Record Toggle (ON↔OFF)',
				style: { text: 'REC', size: '18', color: white, bgcolor: gray },
				feedbacks: [{ feedbackId: 'recordIsOn', options: { status: 'true' } }],
				steps: [{ down: [makeAction('streamArchiveAutoToggle')], up: [] }],
			},
			encoder_active_status: makePreset('Broadcasting', 'Any Encoder Active Flash', 'ENCODER\\nACTIVE', gray, null, {}, [
				{ feedbackId: 'encoderActiveFlash', options: {} },
			]),

			// ── Options ───────────────────────────────────────────────────────────
			scheduler_on: makePreset('Options', 'Scheduler On', 'SCHED\\nON', green, 'schedulerOn', {}, [
				{ feedbackId: 'scheduler', options: { status: 'true' } },
			]),
			scheduler_off: makePreset('Options', 'Scheduler Off', 'SCHED\\nOFF', gray, 'schedulerOff', {}, [
				{ feedbackId: 'scheduler', options: { status: 'false' } },
			]),
			scheduler_toggle: makeAutoTogglePreset('Options', 'Scheduler Toggle (ON↔OFF with Flash)', 'schedulerAutoToggle', {}, 'schedulerToggleFlash'),

			shuffle_on: makePreset('Options', 'Shuffle On', 'SHUFFLE\\nON', green, 'shuffleOn', {}, [
				{ feedbackId: 'shuffle', options: { status: 'true' } },
			]),
			shuffle_off: makePreset('Options', 'Shuffle Off', 'SHUFFLE\\nOFF', gray, 'shuffleOff', {}, [
				{ feedbackId: 'shuffle', options: { status: 'false' } },
			]),
			shuffle_toggle: makeAutoTogglePreset('Options', 'Shuffle Toggle (ON↔OFF with Flash)', 'shuffleAutoToggle', {}, 'shuffleToggleFlash'),

			repeat_track_on: makePreset('Options', 'Repeat Track On', 'RPT TRK\\nON', green, 'repeatTrackOn', {}, [
				{ feedbackId: 'repeat_track', options: { status: 'true' } },
			]),
			repeat_track_off: makePreset('Options', 'Repeat Track Off', 'RPT TRK\\nOFF', gray, 'repeatTrackOff', {}, [
				{ feedbackId: 'repeat_track', options: { status: 'false' } },
			]),
			repeat_track_toggle: makeAutoTogglePreset('Options', 'Repeat Track Toggle (ON↔OFF with Flash)', 'repeatTrackAutoToggle', {}, 'repeatTrackToggleFlash'),

			repeat_list_on: makePreset('Options', 'Repeat List On', 'RPT LST\\nON', green, 'repeatListOn', {}, [
				{ feedbackId: 'repeat_list', options: { status: 'true' } },
			]),
			repeat_list_off: makePreset('Options', 'Repeat List Off', 'RPT LST\\nOFF', gray, 'repeatListOff', {}, [
				{ feedbackId: 'repeat_list', options: { status: 'false' } },
			]),
			repeat_list_toggle: makeAutoTogglePreset('Options', 'Repeat List Toggle (ON↔OFF with Flash)', 'repeatListAutoToggle', {}, 'repeatListToggleFlash'),

			break_on: makePreset('Options', 'Break On', 'BREAK\\nON', orange, 'breakOn', {}, [
				{ feedbackId: 'break', options: { status: 'true' } },
			]),
			break_off: makePreset('Options', 'Break Off', 'BREAK\\nOFF', gray, 'breakOff', {}, [
				{ feedbackId: 'break', options: { status: 'false' } },
			]),
			break_toggle: makeAutoTogglePreset('Options', 'Break Toggle (ON↔OFF with Flash)', 'breakAutoToggle', {}, 'breakToggleFlash'),

		}

		this.setPresetDefinitions(presets)
	},
}
