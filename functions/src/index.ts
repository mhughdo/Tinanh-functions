import * as functions from 'firebase-functions';
import admin from 'firebase-admin'

admin.initializeApp()


// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

const getUser = async (id: string) => {
  return (await admin.firestore().doc(`users/${id}`).get()).data()
}

exports.swipedRight = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication!');
  }

  const likedUserID = data?.id
  if (!context.auth) {
    throw new functions.https.HttpsError('not-found', 'Liked user id not found')
  }
  const user = await getUser(context.auth.uid)
  const likedUser = await getUser(likedUserID)
  if (user?.isLiked?.includes(likedUser?.id)) {
    await admin.firestore().doc(`users/${user?.id}`).set({
      matches: [...(user?.matches || []), likedUser?.id],
      isLiked: user?.isLiked.filter((userID: string) => userID !== likedUser?.id)
    }, {merge: true})

    await admin.firestore().doc(`users/${likedUser?.id}`).set({
      matches: [...(likedUser?.matches || []), user?.id],
    }, { merge: true })
    return {matches: true, user: likedUser}
  } else {
    const isLiked = likedUser?.isLiked ?  [...likedUser?.isLiked, user?.id] : [user?.id]
    await admin.firestore().doc(`users/${likedUser?.id}`).set({
      isLiked,
    }, { merge: true })
    return { matches: false }
  }

  // console.log(context.auth)

});
