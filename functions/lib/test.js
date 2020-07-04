"use strict";
const admin = require('./utils/admin');
(async () => {
    console.log((await admin
        .firestore()
        .collection('users')
        .get()));
})();
//# sourceMappingURL=test.js.map