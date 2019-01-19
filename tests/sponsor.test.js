"use strict";
const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const server = require("../app");
const agent = chai.request.agent(server.app);
const Sponsor = require("../models/sponsor.model");
const should = chai.should();
const mongoose = require("mongoose");
const Constants = {
    Success: require("../constants/success.constant"),
    Error: require("../constants/error.constant"),
};

const util = {
    sponsor: require("./util/sponsor.test.util"),
    auth: require("./util/auth.test.util"),
    account: require("./util/account.test.util"),
};

const Admin0 = util.account.staffAccounts.stored[0];
const HackerAccount0 = util.account.hackerAccounts.stored.team[0];
const T1SponsorAccount0 = util.account.sponsorT1Accounts.stored[0];
const newT2SponsorAccount0 = util.account.sponsorT2Accounts.new[0];
const T1Sponsor0 = util.sponsor.T1Sponsor0;
const newT2Sponsor0 = util.sponsor.newT2Sponsor0;

let duplicateSponsor = util.sponsor.duplicateAccountLinkSponsor1;


describe("GET user sponsor", function () {
    it("should fail list a sponsor's information due to authentication from /api/sponsor/:id GET", function (done) {
        chai.request(server.app)
            .get(`/api/sponsor/` + T1Sponsor0._id)
            // does not have password because of to stripped json
            .end(function (err, res) {
                res.should.have.status(401);
                res.should.be.json;
                res.body.should.have.property("message");
                res.body.message.should.equal(Constants.Error.AUTH_401_MESSAGE);

                done();
            });
    });

    // admin success
    it("should succeed to list a sponsor's info using admin power on /api/sponsor/:id GET", function (done) {
        util.auth.login(agent, Admin0, (error) => {
            if (error) {
                agent.close();
                return done(error);
            }
            return agent
                .get(`/api/sponsor/${T1Sponsor0._id}`)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.have.property("message");
                    res.body.message.should.equal(Constants.Success.SPONSOR_READ);
                    res.body.should.have.property("data");
                    res.body.data.should.be.a("object");

                    let sponsor = new Sponsor(T1Sponsor0);
                    chai.assert.equal(JSON.stringify(res.body.data), JSON.stringify(sponsor.toJSON()));
                    done();
                });
        });
    });

    // regular user access success
    it("should succeed to list a user's sponsor info on /api/sponsor/:id GET", function (done) {
        util.auth.login(agent, T1SponsorAccount0, (error) => {
            if (error) {
                agent.close();
                return done(error);
            }
            return agent
                .get(`/api/sponsor/${util.sponsor.T1Sponsor0._id}`)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.have.property("message");
                    res.body.message.should.equal(Constants.Success.SPONSOR_READ);
                    res.body.should.have.property("data");
                    res.body.data.should.be.a("object");

                    let sponsor = new Sponsor(T1Sponsor0);
                    chai.assert.equal(JSON.stringify(res.body.data), JSON.stringify(sponsor.toJSON()));
                    done();
                });
        });
    });

    // failure due to lack of auth
    it("should fail to list a user's sponsor info due to lack of authorization /api/sponsor/:id GET", function (done) {
        util.auth.login(agent, HackerAccount0, (error) => {
            if (error) {
                agent.close();
                return done(error);
            }
            return agent
                .get(`/api/sponsor/${util.sponsor.T1Sponsor0._id}`)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.should.have.status(403);
                    res.should.be.json;
                    res.body.should.have.property("message");
                    res.body.message.should.equal(Constants.Error.AUTH_403_MESSAGE);
                    res.body.should.have.property("data");

                    done();
                });
        });
    });

    // failure due to lack of this sponsor
    it("should fail to list non existant info on /api/sponsor/:id GET", function (done) {
        util.auth.login(agent, Admin0, (error) => {
            if (error) {
                agent.close();
                return done(error);
            }
            return agent
                .get(`/api/sponsor/${mongoose.Types.ObjectId()}`)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.should.have.status(404);
                    res.should.be.json;
                    res.body.should.have.property("message");
                    res.body.message.should.equal(Constants.Error.SPONSOR_404_MESSAGE);
                    res.body.should.have.property("data");

                    done();
                });
        });
    });
});

describe("POST create sponsor", function () {
    it("should fail to create a new sponsor due to lack of authentication", function (done) {
        chai.request(server.app)
            .post(`/api/sponsor`)
            .type("application/json")
            .send(util.sponsor.newSponsor)
            .end(function (err, res) {
                res.should.have.status(401);
                res.should.be.json;
                res.body.should.have.property("message");
                res.body.message.should.equal(Constants.Error.AUTH_401_MESSAGE);

                done();
            });
    });

    // success case with self caes - there is no admin case
    it("should SUCCEED and create a new sponsor", function (done) {
        util.auth.login(agent, newT2SponsorAccount0, (error) => {
            if (error) {
                agent.close();
                return done(error);
            }
            return agent
                .post(`/api/sponsor/`)
                .type("application/json")
                .send(newT2Sponsor0)
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.have.property("message");
                    res.body.message.should.equal(Constants.Success.SPONSOR_CREATE);
                    res.body.should.have.property("data");

                    // deleting id because that was generated, and not part of original data
                    const sponsor = (new Sponsor(newT2Sponsor0)).toJSON();
                    delete res.body.data.id;
                    delete sponsor.id;
                    chai.assert.equal(JSON.stringify(res.body.data), JSON.stringify(sponsor));
                    done();
                });
        });
    });

    // fail case - duplicate accountId
    it("should fail to create a sponsor due to duplicate accountId", function (done) {
        util.auth.login(agent, T1SponsorAccount0, (error) => {
            if (error) {
                agent.close();
                return done(error);
            }
            return agent
                .post(`/api/sponsor/`)
                .type("application/json")
                .send(duplicateSponsor)
                .end(function (err, res) {
                    res.should.have.status(409);
                    res.body.should.have.property("message");
                    res.body.message.should.equal(Constants.Error.SPONSOR_ID_409_MESSAGE);
                    res.body.should.have.property("data");
                    done();
                });
        });
    });

    // unauthorized case
    it("should FAIL to create a new sponsor", function (done) {
        util.auth.login(agent, HackerAccount0, (error) => {
            if (error) {
                agent.close();
                return done(error);
            }
            return agent
                .post(`/api/sponsor/`)
                .type("application/json")
                .send(newT2Sponsor0)
                .end(function (err, res) {
                    res.should.have.status(403);
                    res.should.be.json;
                    res.body.should.have.property("message");
                    res.body.message.should.equal(Constants.Error.AUTH_403_MESSAGE);
                    res.body.should.have.property("data");

                    done();
                });
        });
    });
});