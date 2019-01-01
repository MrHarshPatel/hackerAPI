"use strict";
const VALIDATOR = require("./validator.helper");
const Constants = require("../../constants/general.constant");

module.exports = {
    newTeamValidator: [
        VALIDATOR.asciiValidator("body", "name", false),
        // members by mongoID if the team creator is able to provide
        VALIDATOR.mongoIdArrayValidator("body", "members", true),
        VALIDATOR.regexValidator("body", "devpostURL", true, Constants.DEVPOST_REGEX),
        VALIDATOR.asciiValidator("body", "projectName", false)
    ],

    joinTeamValidator: [
        VALIDATOR.asciiValidator("body", "teamName", false),
    ],

    patchTeamValidator: [
        VALIDATOR.asciiValidator("body", "name", true),
        VALIDATOR.regexValidator("body", "devpostURL", true, Constants.DEVPOST_REGEX),
        VALIDATOR.asciiValidator("body", "projectName", true)
    ],
};