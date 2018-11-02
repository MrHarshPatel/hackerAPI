"use strict";
const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const server = require("../app");
const agent = chai.request.agent(server.app);
const should = chai.should();
const Volunteer = require("../models/volunteer.model");

const util = {
    volunteer: require("./util/volunteer.test.util"),
    account: require("./util/account.test.util"),
    auth: require("./util/auth.test.util")
};

const Admin1 = util.account.Admin1;
const newVolunteerAccount = util.account.Account4;
const hackerAccount = util.account.Account1;

describe("POST create volunteer", function () {
    it("should fail to create a new volunteer due to lack of authentication", function (done) {
        chai.request(server.app)
            .post(`/api/volunteer`)
            .type("application/json")
            .send(util.volunteer.newVolunteer1)
            .end(function (err, res) {
                res.should.have.status(401);
                res.should.be.json;
                res.body.should.have.property("message");
                res.body.message.should.equal("Not Authenticated");

                done();
            });
    });

    // succeed on admin case
    it("should create a volunteer with admin power on /api/volunteer POST", function (done) {
        util.auth.login(agent, Admin1, (error) => {
            if (error) {
                agent.close();
                return done(error);
            }
            return agent
                .post(`/api/volunteer`)
                .type("application/json")
                .send(util.volunteer.newVolunteer1)
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.have.property("message");
                    res.body.message.should.equal("Volunteer creation successful");
                    res.body.should.have.property("data");

                    // deleting _id because that was generated, and not part of original data
                    delete res.body.data._id;
                    chai.assert.equal(JSON.stringify(res.body.data), JSON.stringify(util.volunteer.newVolunteer1));
                    done();
                });
        });
    });

    // succeed on user case
    it("should create a volunteer for the user /api/volunteer POST", function (done) {
        util.auth.login(agent, newVolunteerAccount, (error) => {
            if (error) {
                agent.close();
                return done(error);
            }
            return agent
                .post(`/api/volunteer`)
                .type("application/json")
                .send(util.volunteer.newVolunteer1)
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.have.property("message");
                    res.body.message.should.equal("Volunteer creation successful");
                    res.body.should.have.property("data");

                    // deleting _id because that was generated, and not part of original data
                    delete res.body.data._id;
                    chai.assert.equal(JSON.stringify(res.body.data), JSON.stringify(util.volunteer.newVolunteer1));
                    done();
                });
        });
    });

    // fail on non-volunteer type account trying to create volunteer
    it("should fail to create a volunteer due to authorization /api/volunteer POST", function (done) {
        util.auth.login(agent, hackerAccount, (error) => {
            if (error) {
                agent.close();
                return done(error);
            }
            return agent
                .post(`/api/volunteer`)
                .type("application/json")
                .send(util.volunteer.newVolunteer1)
                .end(function (err, res) {
                    res.should.have.status(401);
                    res.should.be.json;
                    res.body.should.have.property("message");
                    res.body.message.should.equal("Not Authorized for this route");
                    res.body.should.have.property("data");

                    done();
                });
        });
    });
});