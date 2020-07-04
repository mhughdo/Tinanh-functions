"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-shadow */
/* eslint-disable operator-linebreak */
const functions = __importStar(require("firebase-functions"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
firebase_admin_1.default.initializeApp();
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
const getUser = async (id) => {
    return firebase_admin_1.default
        .firestore()
        .doc(`users/${id}`)
        .get();
};
const calculateAge = (dob) => {
    const converted = new Date(dob);
    const userYear = converted.getFullYear();
    const thisYear = new Date().getFullYear();
    return thisYear - userYear;
};
const createMessageBox = async (user, likedUser) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    try {
        const messageBoxRef = await firebase_admin_1.default
            .firestore()
            .collection('messages')
            .add({
            name: `${((_a = user.data()) === null || _a === void 0 ? void 0 : _a.displayName) || ''} - ${((_b = likedUser.data()) === null || _b === void 0 ? void 0 : _b.displayName) || ''}`,
            latestMessage: {
                text: `${(_c = likedUser.data()) === null || _c === void 0 ? void 0 : _c.displayName} - ${(_d = user.data()) === null || _d === void 0 ? void 0 : _d.displayName} matched.`,
                createdAt: Date.now(),
            },
        });
        await messageBoxRef.collection('MESSAGES').add({
            text: `${(_e = likedUser.data()) === null || _e === void 0 ? void 0 : _e.displayName} - ${(_f = user.data()) === null || _f === void 0 ? void 0 : _f.displayName} matched.`,
            createdAt: new Date().getTime(),
            system: true,
        });
        user.ref.set({
            messages: [
                ...(((_g = user.data()) === null || _g === void 0 ? void 0 : _g.messages) || []),
                { messageBoxID: messageBoxRef.id, userIDs: [user.data().id, likedUser.data().id] },
            ],
        }, { merge: true });
        likedUser.ref.set({
            messages: [
                ...(((_h = likedUser.data()) === null || _h === void 0 ? void 0 : _h.messages) || []),
                { messageBoxID: messageBoxRef.id, userIDs: [likedUser.data().id, user.data().id] },
            ],
        }, { merge: true });
        return messageBoxRef.id;
    }
    catch (error) {
        console.log('Error creating message box', error.message);
    }
};
exports.swipedUpOrRight = functions.https.onCall(async function swipedUpOrRight(data, context) {
    var _a;
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication!');
    }
    const likedUserID = data === null || data === void 0 ? void 0 : data.id;
    const userID = context.auth.uid;
    if (!likedUserID) {
        throw new functions.https.HttpsError('not-found', 'Liked user id not found');
    }
    try {
        const user = await getUser(userID);
        const userData = user.data();
        const userRef = user.ref;
        const likedUser = await getUser(likedUserID);
        const likedUserData = likedUser.data();
        const likedUserRef = likedUser.ref;
        const isMatch = (_a = userData === null || userData === void 0 ? void 0 : userData.isLiked) === null || _a === void 0 ? void 0 : _a.find((user) => user.id === (likedUser === null || likedUser === void 0 ? void 0 : likedUser.id));
        if (isMatch) {
            const userMatches = [...((userData === null || userData === void 0 ? void 0 : userData.matches) || []), { id: likedUserID, matchDate: Date.now() }];
            userRef.set({
                matches: userMatches,
                isLiked: userData === null || userData === void 0 ? void 0 : userData.isLiked.filter((user) => user.id !== (likedUser === null || likedUser === void 0 ? void 0 : likedUser.id)),
            }, { merge: true });
            const likedUserMatches = [...((likedUserData === null || likedUserData === void 0 ? void 0 : likedUserData.matches) || []), { id: userID, matchDate: Date.now() }];
            likedUserRef.set({
                matches: likedUserMatches,
            }, { merge: true });
            const messageBoxID = await createMessageBox(user, likedUser);
            return { matches: true, messageBoxID, user: likedUserData };
        }
        const isSuperLike = (data === null || data === void 0 ? void 0 : data.isSuperLike) || false;
        likedUserRef.set({
            isLiked: [...((likedUserData === null || likedUserData === void 0 ? void 0 : likedUserData.isLiked) || []), { id: userID, isSuperLike }],
        }, { merge: true });
        userRef.set({
            liked: [...((userData === null || userData === void 0 ? void 0 : userData.liked) || []), likedUserData === null || likedUserData === void 0 ? void 0 : likedUserData.id],
        }, { merge: true });
        return { matches: false };
    }
    catch (error) {
        console.log(error);
        return { matches: false };
    }
});
exports.swipedLeft = functions.https.onCall(async function swipeLeft(data, context) {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication!');
    }
    const dislikedUserID = data === null || data === void 0 ? void 0 : data.id;
    if (!dislikedUserID) {
        throw new functions.https.HttpsError('not-found', 'disliked user id not found');
    }
    try {
        const user = await getUser(context.auth.uid);
        const userData = user.data();
        const userRef = user.ref;
        const dislikedUser = await getUser(dislikedUserID);
        const dislikedUserData = dislikedUser.data();
        userRef
            .set({
            disLiked: [...((userData === null || userData === void 0 ? void 0 : userData.disLiked) || []), dislikedUserData === null || dislikedUserData === void 0 ? void 0 : dislikedUserData.id],
        }, { merge: true })
            .then(() => console.log(`Disliked user ${dislikedUserData === null || dislikedUserData === void 0 ? void 0 : dislikedUserData.displayName} successfully!`))
            .catch((error) => console.log(error.message));
        return true;
    }
    catch (error) {
        // throw new functions.https.HttpsError('unknown', error.message)
        console.log(error.message);
        return false;
    }
});
exports.getUsers = functions.https.onCall(async function getUsers(data, context) {
    var _a, _b;
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication!');
    }
    try {
        const user = await getUser(context.auth.uid);
        const userData = user.data();
        const email = userData === null || userData === void 0 ? void 0 : userData.email;
        const userSettings = (userData === null || userData === void 0 ? void 0 : userData.settings) || {};
        const gender = (userSettings === null || userSettings === void 0 ? void 0 : userSettings.gender) || 'Everyone';
        const minAge = (userSettings === null || userSettings === void 0 ? void 0 : userSettings.minAge) || 0;
        const maxAge = (userSettings === null || userSettings === void 0 ? void 0 : userSettings.maxAge) || 25;
        const disLiked = ((_a = userData === null || userData === void 0 ? void 0 : userData.disLiked) === null || _a === void 0 ? void 0 : _a.map((user) => user.id)) || [];
        const liked = (userData === null || userData === void 0 ? void 0 : userData.liked) || [];
        const matches = ((_b = userData === null || userData === void 0 ? void 0 : userData.matches) === null || _b === void 0 ? void 0 : _b.map((user) => user.id)) || [];
        return (await firebase_admin_1.default
            .firestore()
            .collection('users')
            .get()).docs
            .filter((user) => (user === null || user === void 0 ? void 0 : user.data().email) !== email &&
            !disLiked.includes(user.data().id) &&
            !matches.includes(user.data().id) &&
            !liked.includes(user.data().id))
            .filter((user) => {
            var _a, _b, _c;
            const userAge = calculateAge((_a = user.data().dob) === null || _a === void 0 ? void 0 : _a.toDate());
            if (gender === 'Everyone') {
                if (userAge > minAge && userAge < maxAge) {
                    return true;
                }
                return false;
            }
            if (((_c = (_b = user.data()) === null || _b === void 0 ? void 0 : _b.gender) === null || _c === void 0 ? void 0 : _c.toLowerCase()) === (gender === null || gender === void 0 ? void 0 : gender.toLowerCase())) {
                if (userAge > minAge && userAge < maxAge) {
                    return true;
                }
                return false;
            }
            return false;
        })
            .map((user) => user.data());
    }
    catch (error) {
        console.log(error.message);
        return [];
    }
});
exports.unMatch = functions.https.onCall(async function unMatch(data, context) {
    var _a, _b, _c, _d;
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication!');
    }
    try {
        const unMatchUserID = data === null || data === void 0 ? void 0 : data.id;
        const userID = context.auth.uid;
        if (!unMatchUserID) {
            throw new functions.https.HttpsError('not-found', 'unMatch user id not found');
        }
        const user = await getUser(userID);
        const userData = user.data();
        const unMatchUser = await getUser(unMatchUserID);
        const unMatchUserData = unMatchUser.data();
        await user.ref.update({
            matches: (_a = userData === null || userData === void 0 ? void 0 : userData.matches) === null || _a === void 0 ? void 0 : _a.filter((match) => match.id !== unMatchUserID),
            messages: (_b = userData === null || userData === void 0 ? void 0 : userData.messages) === null || _b === void 0 ? void 0 : _b.filter((message) => !message.userIDs.includes(unMatchUserID)),
        });
        await unMatchUser.ref.update({
            matches: (_c = unMatchUserData === null || unMatchUserData === void 0 ? void 0 : unMatchUserData.matches) === null || _c === void 0 ? void 0 : _c.filter((match) => match.id !== userID),
            messages: (_d = unMatchUserData === null || unMatchUserData === void 0 ? void 0 : unMatchUserData.messages) === null || _d === void 0 ? void 0 : _d.filter((message) => !message.userIDs.includes(userID)),
        });
        return true;
    }
    catch (error) {
        console.log(error.message);
        return false;
    }
});
exports.updateSettings = functions.https.onCall(async function updateSettings(data, context) {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication!');
    }
    try {
        const minAge = (data === null || data === void 0 ? void 0 : data.minAge) || 0;
        const maxAge = (data === null || data === void 0 ? void 0 : data.maxAge) || 25;
        const gender = (data === null || data === void 0 ? void 0 : data.gender) || 'Everyone';
        const userID = context.auth.uid;
        const user = await getUser(userID);
        const userRef = user.ref;
        await userRef.set({
            settings: {
                minAge,
                maxAge,
                gender,
            },
        }, { merge: true });
        return true;
    }
    catch (error) {
        console.log(error);
        return false;
    }
});
//# sourceMappingURL=index.js.map