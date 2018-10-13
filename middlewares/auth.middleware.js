"use strict";
const jwt = require("jsonwebtoken");

const Services = {
    Auth: require("../services/auth.service"),
    ResetPasswordToken: require("../services/resetPassword.service"),
    Account: require("../services/account.service"),
    Email: require("../services/email.service"),
    AccountConfirmation: require("../services/accountConfirmation.service")
};

const Middleware = {
    Util: require("./util.middleware")
};

const Constants = require("../constants");
/**
 * 
 * @param {String} routeName the name of the route that the user must be authenticated for, or undefined if 
 * the only requirement is to be logged in.
 * @returns {Fn} the middleware that will check that the user is properly authenticated.
 * Calls next() if the user is properly authenticated.
 */
function ensureAuthenticated(routeName = undefined) {
    return function(req, res, next) {
        Services.Auth.ensureAuthenticated(req, routeName).then(
            (isAuthenticated) => {
                if(isAuthenticated) {
                    next();
                } else if(!!routeName){
                    next({
                        status: 401,
                        message: "Not Authenticated",
                        error: {
                            route: routeName
                        }
                    });
                } else {
                    next({
                        status: 401,
                        message: "Not Authenticated",
                        error: {
                            route: req.path
                        }
                    });
                }
            }
        ).catch((reason) => {
            next(reason);
        });
    };
}

/**
 * Middleware that sends an email to reset the password for the inputted email address.
 * @param {{body: {email:String}}} req the request object
 * @param {*} res 
 * @param {(err?)=>void} next 
 */
async function sendResetPasswordEmailMiddleware(req, res, next) {
    const user = await Services.Account.findByEmail({
        email: req.body.email
    });
    if (user) {
        //create the reset password token
        await Services.ResetPasswordToken.create(user.id);
        //find the thing we just created
        const ResetPasswordTokenModel = await Services.ResetPasswordToken.findByAccountId(user.id);
        //generate email
        const token = Services.ResetPasswordToken.generateToken(ResetPasswordTokenModel.id, user.id);
        const mailData = Services.ResetPasswordToken.generateResetPasswordEmail(req.hostname,req.body.email, token);
        if (mailData !== undefined) {
            Services.Email.send(mailData, (err) => {
                if (err) {
                    next(err);
                } else {
                    next();
                }
            });
        } else {
            return next({
                message: "error while generating email"
            });
        }
    } else {
        //Didn't find the user, but we don't want to throw an error because someone might be trying to see who has an account.
        next();
    }
}

/**
 * Middleware that sends an email to confirm the account for the inputted email address.
 * @param {{body: {email:String}}} req the request object
 * @param {*} res
 * @param {(err?)=>void} next
 */
async function sendConfirmAccountEmailMiddleware(req, res, next) {
    const account = req.body.account;
    await Services.AccountConfirmation.create(Constants.HACKER, account.email, account.id);
    const accountConfirmationToken = await Services.AccountConfirmation.findByAccountId(account.id);
    const token = Services.AccountConfirmation.generateToken(accountConfirmationToken.id, account.id);
    const mailData = Services.AccountConfirmation.generateAccountConfirmationEmail(req.hostname, account.email, Constants.HACKER, token);
    if (mailData !== undefined) {
        Services.Email.send(mailData, (err) => {
            if (err) {
                next(err);
            } else {
                next();
            }
        });
    } else {
        return next({
            message: "Error while generating email"
        });
    }
}

/**
 * Attempts to parse the jwt token that is found in req.body.token using process.env.JWT_RESET_PWD_SECRET as the key.
 * Places the parsed object into req.body.decodedToken.
 * @param {{body:{token:string}}} req 
 * @param {any} res 
 * @param {(err?)=>void} next 
 */
function parseResetToken(req, res, next) {
    jwt.verify(req.body.authorization, process.env.JWT_RESET_PWD_SECRET, function (err, decoded) {
        if (err) {
            next(err);
        } else {
            req.body.decodedToken = decoded;
            next();
        }
    });
}

function parseAccountConfirmationToken(req, res, next){
    jwt.verify(req.body.token, process.env.JWT_CONFIRM_ACC_SECRET, function (err, decoded) {
        if (err) {
            next(err);
        } else {
            req.body.decodedToken = decoded;
            next();
        }
    });
}

/**
 * Verifies that the resetId exists, and that the accountId exists.
 * @param {{body:{decodedToken:{resetId:string, accountId:string}}}} req 
 * @param {any} res 
 * @param {(err?)=>void} next 
 */
async function validateResetToken(req, res, next) {
    const resetObj = await Services.ResetPasswordToken.findById(req.body.decodedToken.resetId);
    const userObj = await Services.Account.findById(req.body.decodedToken.accountId);
    if (resetObj && userObj) {
        req.body.user = userObj;
        next();
    } else {
        //Either the token was already used, it's invalid, or user does not exist.
        next({
            status: 422,
            message: "invalid token",
            error: {}
        });
    }
}

/**
 * Verifies that the confirm account exists, and that the accountId exists.
 * @param {{body:{decodedToken:{accountConfirmationId:string, accountId:string}}}} req 
 * @param {any} res 
 * @param {(err?)=>void} next 
 */
async function validateConfirmationToken(req, res, next) {
    const confirmationObj = await Services.AccountConfirmation.findById(req.body.decodedToken.accountConfirmationId);
    const userObj = await Services.Account.findById(confirmationObj.accountId);
    if (confirmationObj && userObj) {
        userObj.confirmed = true;
        await Services.Account.changeOneAccount(confirmationObj.accountId, userObj);
        req.body.user = userObj;
        next();
    } else {
        //Either the token was already used, it's invalid, or user does not exist.
        next({
            status: 422,
            message: "invalid token",
            error: {}
        });
    }
}

/**
 * Middleware that deletes the reset token in the db
 * @param {{body: {decodedToken:{resetId:String}}}} req the request object
 * @param {*} res 
 * @param {(err?)=>void} next 
 */
function deleteResetToken(req, res, next) {
    Services.ResetPasswordToken.deleteToken(req.body.decodedToken.resetId).then(
        () => {
            next();
        }, 
        (err) => {
            next(err);
        }
    );
}

module.exports = {
    //for each route, set up an authentication middleware for that route, with the permission id.
    ensureAuthenticated: ensureAuthenticated,
    sendResetPasswordEmailMiddleware: Middleware.Util.asyncMiddleware(sendResetPasswordEmailMiddleware),
    parseResetToken: parseResetToken,
    validateResetToken: Middleware.Util.asyncMiddleware(validateResetToken),
    deleteResetToken: deleteResetToken,
    sendConfirmAccountEmailMiddleware: Middleware.Util.asyncMiddleware(sendConfirmAccountEmailMiddleware),
    parseAccountConfirmationToken: parseAccountConfirmationToken,
    validateConfirmationToken: Middleware.Util.asyncMiddleware(validateConfirmationToken)
};
