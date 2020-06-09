"use strict";
const admin = require('./utils/admin');
const userName = 'test';
const deleteFirestoreUser = async () => {
    const users = await admin
        .firestore()
        .collection('users')
        .where('email', '>=', userName)
        // .where('email', '<', 'test')
        .get();
    // console.log(users)
    for (const user of users.docs) {
        const deleteUser = admin.firestore().doc(`users/${user.id}`);
        await deleteUser.delete();
        console.log('User', user.id, 'deleted');
    }
};
function listAllAuthUsers(nextPageToken) {
    const users = [];
    // List batch of users, 1000 at a time.
    return new Promise(resolve => {
        admin
            .auth()
            .listUsers(1000, nextPageToken)
            .then(function (listUsersResult) {
            listUsersResult.users.forEach(function (userRecord) {
                // console.log('user', userRecord.toJSON())
                users.push(userRecord.toJSON());
            });
            if (listUsersResult.pageToken) {
                // List next batch of users.
                listAllAuthUsers(listUsersResult.pageToken);
            }
            else {
                resolve(users);
            }
        })
            .catch(function (error) {
            console.log('Error listing users:', error);
        });
    });
}
const deleteAuthUsers = async () => {
    const users = await listAllAuthUsers();
    for (const user of users) {
        if (user.email.startsWith(userName)) {
            await admin.auth().deleteUser(user.uid);
            console.log('Deleted', user.email, 'user');
        }
    }
};
const deleteTestUsers = async () => {
    await deleteFirestoreUser();
    await deleteAuthUsers();
    console.log('All deleted');
    Promise.resolve();
};
deleteTestUsers();
//# sourceMappingURL=deleteTestUsers.js.map