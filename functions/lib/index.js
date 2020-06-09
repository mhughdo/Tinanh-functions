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
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = __importStar(require("firebase-functions"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
firebase_admin_1.default.initializeApp();
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
const getUser = async (id) => {
    return (await firebase_admin_1.default.firestore().doc(`users/${id}`).get()).data();
};
exports.swipedRight = functions.https.onCall(async (data, context) => {
    var _a;
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication!');
    }
    const likedUserID = data === null || data === void 0 ? void 0 : data.id;
    if (!context.auth) {
        throw new functions.https.HttpsError('not-found', 'Liked user id not found');
    }
    const user = await getUser(context.auth.uid);
    const likedUser = await getUser(likedUserID);
    if ((_a = user === null || user === void 0 ? void 0 : user.isLiked) === null || _a === void 0 ? void 0 : _a.includes(likedUser === null || likedUser === void 0 ? void 0 : likedUser.id)) {
        await firebase_admin_1.default.firestore().doc(`users/${user === null || user === void 0 ? void 0 : user.id}`).set({
            matches: [...((user === null || user === void 0 ? void 0 : user.matches) || []), likedUser === null || likedUser === void 0 ? void 0 : likedUser.id],
            isLiked: user === null || user === void 0 ? void 0 : user.isLiked.filter((userID) => userID !== (likedUser === null || likedUser === void 0 ? void 0 : likedUser.id))
        }, { merge: true });
        await firebase_admin_1.default.firestore().doc(`users/${likedUser === null || likedUser === void 0 ? void 0 : likedUser.id}`).set({
            matches: [...((likedUser === null || likedUser === void 0 ? void 0 : likedUser.matches) || []), user === null || user === void 0 ? void 0 : user.id],
        }, { merge: true });
        return { matches: true, user: likedUser };
    }
    else {
        const isLiked = (likedUser === null || likedUser === void 0 ? void 0 : likedUser.isLiked) ? [...likedUser === null || likedUser === void 0 ? void 0 : likedUser.isLiked, user === null || user === void 0 ? void 0 : user.id] : [user === null || user === void 0 ? void 0 : user.id];
        await firebase_admin_1.default.firestore().doc(`users/${likedUser === null || likedUser === void 0 ? void 0 : likedUser.id}`).set({
            isLiked,
        }, { merge: true });
        return { matches: false };
    }
    // console.log(context.auth)
});
//# sourceMappingURL=index.js.map