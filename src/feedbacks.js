module.exports = {
    // ##########################
    // #### Define Feedbacks ####
    // ##########################
    feedbacks() {
        let self = this;
        const feedbacks = {};

        const foregroundColorWhite = self.rgb(255, 255, 255) // White
        const foregroundColorBlack = self.rgb(0, 0, 0) // Black
        const backgroundColorRed = self.rgb(255, 0, 0) // Red
        const backgroundColorGreen = self.rgb(0, 255, 0) // Green
        const backgroundColorOrange = self.rgb(255, 102, 0) // Orange

        feedbacks['micStatus'] = {
            type: 'boolean',
            label: 'Show Mic Status On Button',
            description: 'Indicate if Mic is in X State',
            style: {
                color: foregroundColorWhite,
                bgcolor: backgroundColorRed,
            },
            options: [
                {
                    type: 'dropdown',
                    label: 'Indicate in X Status',
                    id: 'status',
                    default: 'false',
                    choices: [
                        { id: 'false', label: 'Off' },
                        { id: 'true', label: 'On' }
                    ]
                }
            ],
            callback: function (feedback) {
                let opt = feedback.options;

				if (self.STATUS.micStatus.toString() == opt.status.toString()) {
					return true;
				}

                return false
            }
        }

		feedbacks['streamarchiveStatus'] = {
            type: 'boolean',
            label: 'Show Stream Archive Status On Button',
            description: 'Indicate if Stream Archive is in X State',
            style: {
                color: foregroundColorWhite,
                bgcolor: backgroundColorRed,
            },
            options: [
                {
                    type: 'dropdown',
                    label: 'Indicate in X Status',
                    id: 'status',
                    default: 'false',
                    choices: [
                        { id: 'false', label: 'Off' },
                        { id: 'true', label: 'On' }
                    ]
                }
            ],
            callback: function (feedback) {
                let opt = feedback.options;

				if (self.STATUS.streamarchiveStatus.toString() == opt.status.toString()) {
					return true;
				}

                return false
            }
        }

		feedbacks['scheduler'] = {
            type: 'boolean',
            label: 'Show Scheduler State On Button',
            description: 'Indicate if Scheduler is in X State',
            style: {
                color: foregroundColorWhite,
                bgcolor: backgroundColorRed,
            },
            options: [
                {
                    type: 'dropdown',
                    label: 'Indicate in X Status',
                    id: 'status',
                    default: 'false',
                    choices: [
                        { id: 'false', label: 'Off' },
                        { id: 'true', label: 'On' }
                    ]
                }
            ],
            callback: function (feedback) {
                let opt = feedback.options;

				if (self.STATUS.scheduler.toString() == opt.status.toString()) {
					return true;
				}

                return false
            }
        }

		feedbacks['shuffle'] = {
            type: 'boolean',
            label: 'Show Shuffle State On Button',
            description: 'Indicate if Shuffle is in X State',
            style: {
                color: foregroundColorWhite,
                bgcolor: backgroundColorRed,
            },
            options: [
                {
                    type: 'dropdown',
                    label: 'Indicate in X Status',
                    id: 'status',
                    default: 'false',
                    choices: [
						{ id: 'false', label: 'Off' },
                        { id: 'true', label: 'On' }
                    ]
                }
            ],
            callback: function (feedback) {
                let opt = feedback.options;

				if (self.STATUS.shuffle.toString() == opt.status.toString()) {
					return true;
				}

                return false
            }
        }

		feedbacks['repeat_track'] = {
            type: 'boolean',
            label: 'Show Repeat Track State On Button',
            description: 'Indicate if Repeat Track is in X State',
            style: {
                color: foregroundColorWhite,
                bgcolor: backgroundColorRed,
            },
            options: [
                {
                    type: 'dropdown',
                    label: 'Indicate in X Status',
                    id: 'status',
                    default: 'false',
                    choices: [
                        { id: 'false', label: 'Off' },
                        { id: 'true', label: 'On' }
                    ]
                }
            ],
            callback: function (feedback) {
                let opt = feedback.options;

				if (self.STATUS.repeatTrack.toString() == opt.status.toString()) {
					return true;
				}

                return false
            }
        }

		feedbacks['repeat_list'] = {
            type: 'boolean',
            label: 'Show Repeat List State On Button',
            description: 'Indicate if Repeat List is in X State',
            style: {
                color: foregroundColorWhite,
                bgcolor: backgroundColorRed,
            },
            options: [
                {
                    type: 'dropdown',
                    label: 'Indicate in X Status',
                    id: 'status',
                    default: 'false',
                    choices: [
						{ id: 'false', label: 'Off' },
                        { id: 'true', label: 'On' }
                    ]
                }
            ],
            callback: function (feedback) {
                let opt = feedback.options;

				if (self.STATUS.repeatList.toString() == opt.status.toString()) {
					return true;
				}

                return false
            }
        }

		feedbacks['break'] = {
            type: 'boolean',
            label: 'Show Break State On Button',
            description: 'Indicate if Break is in X State',
            style: {
                color: foregroundColorWhite,
                bgcolor: backgroundColorRed,
            },
            options: [
                {
                    type: 'dropdown',
                    label: 'Indicate in X Status',
                    id: 'status',
                    default: 'false',
                    choices: [
						{ id: 'false', label: 'Off' },
                        { id: 'true', label: 'On' }
                    ]
                }
            ],
            callback: function (feedback) {
                let opt = feedback.options;

				if (self.STATUS.break.toString() == opt.status.toString()) {
					return true;
				}

                return false
            }
        }

		feedbacks['autoamp'] = {
            type: 'boolean',
            label: 'Show Automatic Volume Control State On Button',
            description: 'Indicate if Automatic Volume Control is in X State',
            style: {
                color: foregroundColorWhite,
                bgcolor: backgroundColorRed,
            },
            options: [
                {
                    type: 'dropdown',
                    label: 'Indicate in X Status',
                    id: 'status',
                    default: 'false',
                    choices: [
						{ id: 'false', label: 'Off' },
                        { id: 'true', label: 'On' }
                    ]
                }
            ],
            callback: function (feedback) {
                let opt = feedback.options;

				if (self.STATUS.autoamp.toString() == opt.status.toString()) {
					return true;
				}

                return false
            }
        }

		feedbacks['http_request'] = {
            type: 'boolean',
            label: 'Show HTTP Request State On Button',
            description: 'Indicate if HTTP Request is in X State',
            style: {
                color: foregroundColorWhite,
                bgcolor: backgroundColorRed,
            },
            options: [
                {
                    type: 'dropdown',
                    label: 'Indicate in X Status',
                    id: 'status',
                    default: 'false',
                    choices: [
						{ id: 'false', label: 'Off' },
                        { id: 'true', label: 'On' }
                    ]
                }
            ],
            callback: function (feedback) {
                let opt = feedback.options;

				if (self.STATUS.httpRequest.toString() == opt.status.toString()) {
					return true;
				}

                return false
            }
        }

		feedbacks['manual'] = {
            type: 'boolean',
            label: 'Show Scheduler Manual Mode State On Button',
            description: 'Indicate if Scheduler Manual Mode is in X State',
            style: {
                color: foregroundColorWhite,
                bgcolor: backgroundColorRed,
            },
            options: [
                {
                    type: 'dropdown',
                    label: 'Indicate in X Status',
                    id: 'status',
                    default: 'false',
                    choices: [
                        { id: 'false', label: 'Off' },
                        { id: 'true', label: 'On' }
                    ]
                }
            ],
            callback: function (feedback) {
                let opt = feedback.options;

				if (self.STATUS.manual.toString() == opt.status.toString()) {
					return true;
				}

                return false
            }
        }

		feedbacks['autointro'] = {
            type: 'boolean',
            label: 'Show Auto Intro State On Button',
            description: 'Indicate if Auto Intro is in X State',
            style: {
                color: foregroundColorWhite,
                bgcolor: backgroundColorRed,
            },
            options: [
                {
                    type: 'dropdown',
                    label: 'Indicate in X Status',
                    id: 'status',
                    default: 'false',
                    choices: [
                        { id: 'false', label: 'Off' },
                        { id: 'true', label: 'On' }
                    ]
                }
            ],
            callback: function (feedback) {
                let opt = feedback.options;

				if (self.STATUS.autointro.toString() == opt.status.toString()) {
					return true;
				}

                return false
            }
        }

		feedbacks['encoder'] = {
            type: 'boolean',
            label: 'Show Encoder Status On Button',
            description: 'Indicate if Encoder is in X Status',
            style: {
                color: foregroundColorWhite,
                bgcolor: backgroundColorRed,
            },
            options: [
				{
                    type: 'dropdown',
                    label: 'Encoder',
                    id: 'encoder',
                    choices: self.STATUS.encoders
                },
                {
                    type: 'dropdown',
                    label: 'Indicate in X Status',
                    id: 'status',
                    default: 'active',
                    choices: [
                        { id: 'active', label: 'Active' },
                        { id: 'off', label: 'Off' }
                    ]
                }
            ],
            callback: function (feedback) {
                let opt = feedback.options;
				let encoder = self.STATUS.encoders.find((enc) => {enc.id === opt.encoder});

				if (encoder) {
					if (encoder.status.toString() == opt.status.toString()) {
						return true;
					}
				}				

                return false
            }
        }

        self.setFeedbackDefinitions(feedbacks);
    }
}