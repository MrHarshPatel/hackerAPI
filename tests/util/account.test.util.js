"use strict";
const Constants = require("../../constants/general.constant");
const Account = require("../../models/account.model");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const logger = require("../../services/logger.service");

const newAccount1 = {
    "_id": mongoose.Types.ObjectId(),
    "firstName": "NEW",
    "lastName": "Account",
    "pronoun": "He/Him",
    "email": "newexist@blahblah.com",
    "password": "1234567890",
    "dietaryRestrictions": ["none"],
    "shirtSize": "S",
    "accountType": Constants.HACKER,
    "birthDate": "1997-12-30",
    "phoneNumber": 1234567890,
};
const nonAccount1 = {
    "_id": mongoose.Types.ObjectId(),
    "firstName": "non",
    "lastName": "Account",
    "pronoun": "She/Her",
    "email": "notexist@blahblah.com",
    "password": "12345789",
    "dietaryRestrictions": ["none"],
    "shirtSize": "S",
    "birthDate": "1990-01-01",
    "phoneNumber": 1000000001,
};
const Admin1 = {
    "_id": mongoose.Types.ObjectId(),
    "firstName": "Admin1",
    "lastName": "Admin1",
    "pronoun": "Ze/Hir",
    "email": "Admin1@blahblah.com",
    "password": "Admin1",
    "dietaryRestrictions": ["none"],
    "shirtSize": "S",
    "confirmed": true,
    "accountType": Constants.STAFF,
    "birthDate": "1990-01-02",
    "phoneNumber": 1000000002,
};
// hacker
const Account1 = {
    "_id": mongoose.Types.ObjectId(),
    "firstName": "ABC",
    "lastName": "DEF",
    "pronoun": "Ze/Zir",
    "email": "abc.def1@blahblah.com",
    "password": "probsShouldBeHashed1",
    "dietaryRestrictions": ["none"],
    "shirtSize": "S",
    "confirmed": true,
    "accountType": Constants.HACKER,
    "birthDate": "1990-01-03",
    "phoneNumber": 1000000003,
};
// hacker
const Account2 = {
    "_id": mongoose.Types.ObjectId(),
    "firstName": "abc",
    "lastName": "def",
    "pronoun": "They/Them",
    "email": "abc.def2@blahblah.com",
    "password": "probsShouldBeHashed2",
    "dietaryRestrictions": ["vegetarian"],
    "shirtSize": "M",
    "confirmed": true,
    "accountType": Constants.HACKER,
    "birthDate": "1990-01-04",
    "phoneNumber": 1000000004,
};
// sponsor
const Account3 = {
    "_id": mongoose.Types.ObjectId(),
    "firstName": "XYZ",
    "lastName": "UST",
    "pronoun": "Xey/Xem",
    "email": "abc.def3@blahblah.com",
    "password": "probsShouldBeHashed3",
    "dietaryRestrictions": ["vegan"],
    "shirtSize": "L",
    "confirmed": true,
    "birthDate": "1990-01-05",
    "phoneNumber": 1000000005,
    "accountType": Constants.SPONSOR_T1
};
// volunteer
const Account4 = {
    "_id": mongoose.Types.ObjectId(),
    "firstName": "xyz",
    "lastName": "ust",
    "pronoun": "Sie/Hir",
    "email": "abc.def4@blahblah.com",
    "password": "probsShouldBeHashed4",
    "dietaryRestrictions": ["vegetarian", "lactose intolerant"],
    "shirtSize": "XL",
    "confirmed": true,
    "accountType": Constants.VOLUNTEER,
    "birthDate": "1980-01-30",
    "phoneNumber": 1000000006,
};
// sponsor
const Account5 = {
    "_id": mongoose.Types.ObjectId(),
    "firstName": "LMAO",
    "lastName": "ROFL",
    "pronoun": "It/It",
    "email": "abc.def0@blahblah.com",
    "password": "probsShouldBeHashed5",
    "dietaryRestrictions": ["something1", "something2"],
    "shirtSize": "XXL",
    "confirmed": true,
    "accountType": Constants.SPONSOR_T2,
    "birthDate": "1980-06-30",
    "phoneNumber": 1000000236
};

// non confirmed account for hacker
const NonConfirmedAccount1 = {
    "_id": mongoose.Types.ObjectId(),
    "firstName": "LMAO",
    "lastName": "ROFL",
    "pronoun": "Ey/Em",
    "email": "abc.def6@blahblah.com",
    "password": "probsShouldBeHashed5",
    "dietaryRestrictions": ["something1", "something2"],
    "shirtSize": "XXL",
    "confirmed": false,
    "birthDate": "1980-07-30",
    "phoneNumber": 1001230236,
    "accountType": Constants.HACKER
};

const NonConfirmedAccount2 = {
    "_id": mongoose.Types.ObjectId(),
    "firstName": "LMAO",
    "lastName": "ROFL",
    "email": "notconfirmed2@blahblah.com",
    "password": "probsShouldBeHashed5",
    "dietaryRestrictions": ["something1", "something2"],
    "shirtSize": "XXL",
    "confirmed": false,
    "accountType": Constants.HACKER,
};

// hacker waitlisted
const Hacker3 = {
    "_id": mongoose.Types.ObjectId(),
    "firstName": "abcd",
    "lastName": "defg",
    "pronoun": "They/Them",
    "email": "abc.def7@blahblah.com",
    "password": "probsShouldBeHashed2",
    "dietaryRestrictions": ["vegetarian"],
    "shirtSize": "M",
    "confirmed": true,
    "accountType": Constants.HACKER,
    "birthDate": "1990-01-04",
    "phoneNumber": 1000000004,
};

const Hacker4 = {
    "_id": mongoose.Types.ObjectId(),
    "firstName": "abcd",
    "lastName": "defg",
    "pronoun": "They/Them",
    "email": "abc.def.hacker4@blahblah.com",
    "password": "probsShouldBeHashed2",
    "dietaryRestrictions": ["vegetarian"],
    "shirtSize": "M",
    "confirmed": true,
    "accountType": Constants.HACKER,
    "birthDate": "1990-01-04",
    "phoneNumber": 1000000004,
};
const Hacker5 = {
    "_id": mongoose.Types.ObjectId(),
    "firstName": "abcd",
    "lastName": "defg",
    "pronoun": "They/Them",
    "email": "abc.def.hacker5@blahblah.com",
    "password": "probsShouldBeHashed2",
    "dietaryRestrictions": ["vegetarian"],
    "shirtSize": "M",
    "confirmed": true,
    "accountType": Constants.HACKER,
    "birthDate": "1990-01-04",
    "phoneNumber": 1000000004,
};
const Hacker6 = {
    "_id": mongoose.Types.ObjectId(),
    "firstName": "abcd",
    "lastName": "defg",
    "pronoun": "They/Them",
    "email": "abc.def.hacker6@blahblah.com",
    "password": "probsShouldBeHashed2",
    "dietaryRestrictions": ["vegetarian"],
    "shirtSize": "M",
    "confirmed": true,
    "accountType": Constants.HACKER,
    "birthDate": "1990-01-04",
    "phoneNumber": 1000000004,
};
const Hacker7 = {
    "_id": mongoose.Types.ObjectId(),
    "firstName": "abcd",
    "lastName": "defg",
    "pronoun": "They/Them",
    "email": "abc.def.hacker7@blahblah.com",
    "password": "probsShouldBeHashed2",
    "dietaryRestrictions": ["vegetarian"],
    "shirtSize": "M",
    "confirmed": true,
    "accountType": Constants.HACKER,
    "birthDate": "1990-01-04",
    "phoneNumber": 1000000004,
};

const customAccounts = [
    Admin1,
    Account1,
    Account2,
    Account3,
    Account4,
    Account5,
    Hacker3,
    Hacker4,
    Hacker5,
    Hacker6,
    Hacker7,
    NonConfirmedAccount1,
    NonConfirmedAccount2
];

const generatedAccounts = generateAccounts(20);
// 1-5 Are for admins
// 6-10 Are for hackers (6 and 7 are new)
// 11-15 Are for sponsors
// 16-20 Are for volunteers


const allAccounts = customAccounts.concat(generatedAccounts);

module.exports = {
    nonAccount1: nonAccount1,
    newAccount1: newAccount1,
    NonConfirmedAccount1: NonConfirmedAccount1,
    NonConfirmedAccount2: NonConfirmedAccount2,
    Admin1: Admin1,
    Account1: Account1,
    Account2: Account2,
    Account3: Account3,
    Account4: Account4,
    Account5: Account5,
    Hacker3: Hacker3,
    Hacker4: Hacker4,
    Hacker5: Hacker5,
    Hacker6: Hacker6,
    Hacker7: Hacker7,
    customAccounts: customAccounts,
    generatedAccounts: generatedAccounts,
    allAccounts: allAccounts,
    storeAll: storeAll,
    dropAll: dropAll,
    equals: equals
};

function generateRandomShirtSize() {
    return Constants.SHIRT_SIZES[Math.floor(Math.random() * Constants.SHIRT_SIZES.length)];
}

function generateAccounts(n) {
    let accounts = [];
    for (let i = 0; i < n; i++) {
        let birthMonth = Math.floor(Math.random() * 12) + 1;
        let birthDay = Math.floor(Math.random() * 28) + 1;
        let phoneNumber = Math.floor(Math.random() * 10000000000);

        let acc = {
            "_id": mongoose.Types.ObjectId(),
            "firstName": "first" + String(i),
            "lastName": "last" + String(i),
            "pronoun": "They/" + String(i),
            "email": "test" + String(i) + "@blahblah.com",
            "password": "probsShouldBeHashed" + String(i),
            "dietaryRestrictions": [],
            "shirtSize": generateRandomShirtSize(),
            "confirmed": true,
            "birthDate": `1980-${birthMonth}-${birthDay}`,
            "phoneNumber": phoneNumber,
        };

        if (i < n / 4) {
            acc.accountType = Constants.STAFF;
        } else if (i >= n / 4 && i < (n / 4) * 2) {
            acc.accountType = Constants.HACKER;
        } else if (i >= (n / 4) * 2 && i < (n / 4) * 3) {
            acc.accountType = Constants.SPONSOR;
        } else {
            acc.accountType = Constants.VOLUNTEER;
        }

        accounts.push(acc);
    }
    return accounts;
}

function encryptPassword(user) {
    let encryptedUser = JSON.parse(JSON.stringify(user));
    encryptedUser.password = bcrypt.hashSync(user.password, 10);
    return encryptedUser;
}

function storeAll(attributes) {
    const acctDocs = [];
    const acctNames = [];
    for (var i = 0; i < attributes.length; i++) {
        const encryptedUser = encryptPassword(attributes[i]);
        acctDocs.push(new Account(encryptedUser));
        acctNames.push(attributes[i].firstName + "," + attributes[i].lastName);
    }

    return Account.collection.insertMany(acctDocs);
}

async function dropAll() {
    try {
        await Account.collection.drop();
    } catch (e) {
        if (e.code === 26) {
            logger.info("namespace %s not found", Account.collection.name);
        } else {
            throw e;
        }
    }
}

/**
 * Compare two accounts
 * @param {Account} acc1 
 * @param {Account} acc2 
 */
function equals(acc1, acc2) {
    const id1 = (typeof acc1._id === "string") ? acc1._id : acc1._id.valueOf();
    const id2 = (typeof acc2._id === "string") ? acc1._id : acc1._id.valueOf();
    const id = (id1 === id2);
    const firstName = (acc1.firstName === acc2.firstName);
    const lastName = (acc1.lastName === acc2.lastName);
    const pronoun = (acc1.pronoun === acc2.pronoun);
    const email = (acc1.email === acc2.email);
    const dietaryRestrictions = (acc1.dietaryRestrictions.join(",") === acc2.dietaryRestrictions.join(","));
    const shirtSize = (acc1.shirtSize === acc2.shirtSize);
    return [id, firstName, lastName, email, dietaryRestrictions, shirtSize];
}