"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUsers = void 0;
const admin = require("firebase-admin");
const app = admin.initializeApp();
exports.createUsers = () => {
    app.auth().createUser({
        email: 'user@example.com',
        emailVerified: false,
        password: 'secretPassword',
        displayName: 'John Doe',
        disabled: false
    })
        .then(function (userRecord) {
        // See the UserRecord reference doc for the contents of userRecord.
        console.log('Successfully created new user:', userRecord.uid);
    })
        .catch(function (error) {
        console.log('Error creating new user:', error);
    });
};
//# sourceMappingURL=createUsers.js.map