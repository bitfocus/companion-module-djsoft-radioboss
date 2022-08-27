module.exports = {
	presets() {
		const presets = []

		const white = this.rgb(255, 255, 255)
		const black = this.rgb(0, 0, 0)
		const green = this.rgb(0, 204, 0)
		const red = this.rgb(220, 53, 69)
		const blue = this.rgb(0, 0, 255)

		this.setPresetDefinitions(presets)
	},
}
