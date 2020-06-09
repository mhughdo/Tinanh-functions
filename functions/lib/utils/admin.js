"use strict";
const admin = require('firebase-admin');
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://tinanh-8f0ba.firebaseio.com',
});
module.exports = admin;
//# sourceMappingURL=admin.js.map