"use strict";

const TAG = `[ TEAM.MIDDLEWARE.js ]`;
const mongoose = require("mongoose");
const Services = {
    Logger: require("../services/logger.service"),
    Team: require("../services/team.service"),
    Hacker: require("../services/hacker.service")
};
const Util = require("./util.middleware");
const Constants = {
    Error: require("../constants/error.constant"),
    General: require("../constants/general.constant"),
};

/**
 * @async
 * @function ensureUniqueHackerId
 * @param {{body: {teamDetails: {members: ObjectId[]}}}} req
 * @param {JSON} res
 * @param {(err?)=>void} next
 * @return {void}
 * @description Checks to see that the members in a team are not in another team, and that members are not duplicate
 */
async function ensureUniqueHackerId(req, res, next) {
    let idSet = [];

    for (const member of req.body.teamDetails.members) {
        // check to see if a member is entered twice in the application
        if (!!idSet[member]) {
            return next({
                status: 422,
                message: Constants.Error.TEAM_MEMBER_422_MESSAGE,
                error: member
            });
        } else {
            idSet[member] = true;
        }

        // check to see if member is part of a another team
        const team = await Services.Team.findTeamByHackerId(member);

        if (!!team) {
            return next({
                status: 409,
                message: Constants.Error.TEAM_MEMBER_409_MESSAGE,
                error: member
            });
        }
    }

    return next();
}

/**
 * @async
 * @function ensureSpance
 * @param {{body: {name: string}}} req
 * @param {JSON} res
 * @param {(err?)=>void} next
 * @return {void}
 * @description Checks to see that team is not full.
 */
async function ensureSpace(req, res, next) {
    Services.Logger.info(req.body.name);
    const teamSize = await Services.Team.getSize(req.body.name);
    Services.Logger.info(teamSize);

    if (teamSize === -1) {
        return next({
            status: 404,
            message: Constants.Error.TEAM_404_MESSAGE,
            data: req.body.name
        });
    } else if (teamSize >= Constants.General.MAX_TEAM_SIZE) {
        return next({
            status: 409,
            message: Constants.Error.TEAM_SIZE_409_MESSAGE,
            data: teamSize,
        });
    }

    return next();
}

async function updateTeam(req, res, next) {
    const team = await Services.Team.updateTeam(req.body.teamId, req.body.teamDetails);

    if (!team) {
        return next({
            status: 404,
            message: Constants.Error.TEAM_404_MESSAGE,
            data: req.body.teamId
        });
    }

    req.body.team = team;
    return next();
}

async function getByHackerId(req, res, next) {
    // might be in req.params.hackerId
    const hacker = await Services.Hacker.findById(req.body.hackerId);

    if (!hacker) {
        return next({
            status: 404,
            message: Constants.Error.HACKER_404_MESSAGE,
            data: req.body.hackerId
        });
    }

    req.body.teamId = hacker.teamId;
    next();
}

async function getByUser(req, res, next) {
    const hacker = await Services.Hacker.findByAccountId(req.user.id);

    if (!hacker) {
        return next({
            status: 404,
            message: Constants.Error.Hacker,
            data: {
                id: req.user.id
            }
        });
    }

    // should be cleared by req.logout()
    req.user.teamId = hacker.teamId;
    next();
}

/**
 * @async
 * @function createTeam
 * @param {{body: {teamDetails: {_id: ObjectId, name: string, members: ObjectId[], devpostURL?: string, projectName: string}}}} req
 * @param {*} res
 * @description create a team from information in req.body.teamDetails.
 */
async function createTeam(req, res, next) {
    const teamDetails = req.body.teamDetails;

    const team = await Services.Team.createTeam(teamDetails);

    if (!team) {
        return res.status(500).json({
            message: Constants.Error.TEAM_CREATE_500_MESSAGE,
            data: {}
        });
    } else {
        req.body.team = team;
        return next();
    }
}

/**
 * @async
 * @function updateHackerTeam
 * @param {{body: {name: string}}} req
 * @param {JSON} res
 * @param {(err?)=>void} next
 * @return {void}
 * @description Adds the logged in user to the team specified by name.
 */
async function updateHackerTeam(req, res, next) {
    const hacker = await Services.Hacker.findByAccountId(req.user.id);

    if (!hacker) {
        return next({
            status: 404,
            message: Constants.Error.HACKER_404_MESSAGE,
            data: {
                id: req.user.id
            }
        });
    }

    const receivingTeam = await Services.Team.findByName(req.body.name);

    if (!receivingTeam) {
        return next({
            status: 404,
            message: Constants.Error.TEAM_404_MESSAGE,
            data: req.body.name
        });
    }

    const previousTeamId = hacker.teamId;

    if (previousTeamId == receivingTeam._id) {
        return next({
            status: 409,
            message: Constants.Error.TEAM_JOIN_SAME_409_MESSAGE,
            data: req.body.teamName
        });
    }

    // remove hacker from previous team
    if (previousTeamId != undefined) {
        await Services.Team.removeMember(previousTeamId, hacker._id);
        await Services.Team.removeTeamIfEmpty(previousTeamId);
    }


    // add hacker to the new team and change teamId of hacker
    const update = await Services.Team.addMember(receivingTeam._id, hacker._id);

    // Services.Hacker.updateOne should return a hacker object, as the hacker exists
    if (!update) {
        return next({
            status: 500,
            message: Constants.Error.TEAM_UPDATE_500_MESSAGE,
            data: hacker._id,
        });
    }

    return next();
}

/**
 * @async
 * @function findById
 * @param {{body: {id: ObjectId}}} req 
 * @param {*} res 
 * @return {JSON} Success or error status
 * @description Finds a team by it's mongoId that's specified in req.param.id in route parameters. The id is moved to req.body.id from req.params.id by validation.
 */
async function findById(req, res, next) {
    const team = await Services.Team.findById(req.body.id);

    if (!team) {
        return res.status(404).json({
            message: Constants.Error.TEAM_404_MESSAGE,
            data: {}
        });
    }

    req.body.team = team;
    next();
}

/**
 * @function parseTeam
 * @param {{body: {name: string, members: Object[], devpostURL: string, projectName: string}}} req
 * @param {*} res
 * @param {(err?)=>void} next
 * @return {void}
 * @description 
 * Moves name, members, devpostURL, projectName from req.body to req.body.teamDetails. 
 * Adds _id to teamDetails.
 */
function parseTeam(req, res, next) {
    const teamDetails = {
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
        members: req.body.members,
        devpostURL: req.body.devpostURL,
        projectName: req.body.projectName
    };

    delete req.body.name;
    delete req.body.members;
    delete req.body.devpostURL;
    delete req.body.projectName;

    req.body.teamDetails = teamDetails;

    return next();
}

/**
 * @function parsePatch
 * @param {body: {id: ObjectId}} req 
 * @param {*} res 
 * @param {(err?) => void} next 
 * @return {void}
 * @description Delete the req.body.id that was added by the validation of route parameter.
 */
function parsePatch(req, res, next) {
    delete req.body.id;

    let teamDetails = {};

    for (const val in req.body) {
        if (val === "hackerId") {
            continue;
        } else {
            teamDetails[val] = req.body[val];
        }
    }

    req.body.teamDetails = teamDetails;

    return next();
}

module.exports = {
    parseTeam: parseTeam,
    findById: Util.asyncMiddleware(findById),
    createTeam: Util.asyncMiddleware(createTeam),
    ensureUniqueHackerId: Util.asyncMiddleware(ensureUniqueHackerId),
    ensureSpace: Util.asyncMiddleware(ensureSpace),
    updateHackerTeam: Util.asyncMiddleware(updateHackerTeam),
    getByUser: Util.asyncMiddleware(getByUser),
    updateTeam: Util.asyncMiddleware(updateTeam),
    getByHackerId: Util.asyncMiddleware(getByHackerId),
    parsePatch: parsePatch,
};