"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
const createUsers_1 = require("./createUsers");
createUsers_1.createUsers();
exports.listProducts = functions.https.onCall((data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication!');
    }
    return "Hello world";
});
//# sourceMappingURL=index.js.map