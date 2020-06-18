/* eslint-disable no-shadow */
/* eslint-disable operator-linebreak */
import * as functions from 'firebase-functions'
import admin from 'firebase-admin'

admin.initializeApp()
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

const getUser = async (id: string) => {
    return admin
        .firestore()
        .doc(`users/${id}`)
        .get()
}

const calculateAge = (dob) => {
    const converted = new Date(dob)
    const userYear = converted.getFullYear()
    const thisYear = new Date().getFullYear()

    return thisYear - userYear
}

const createMessageBox = async (user, likedUser) => {
    try {
        const messageBoxRef = await admin
            .firestore()
            .collection('messages')
            .add({
                name: `${user.data()?.displayName || ''} - ${likedUser.data()?.displayName || ''}`,
                latestMessage: {
                    text: `${likedUser.data()?.displayName} - ${user.data()?.displayName} matched.`,
                    createdAt: Date.now(),
                },
            })
        await messageBoxRef.collection('MESSAGES').add({
            text: `${likedUser.data()?.displayName} - ${user.data()?.displayName} matched.`,
            createdAt: new Date().getTime(),
            system: true,
        })
        user.ref.set(
            {
                messages: [
                    ...(user.data()?.messages || []),
                    {messageBoxID: messageBoxRef.id, userIDs: [user.data().id, likedUser.data().id]},
                ],
            },
            {merge: true}
        )
        likedUser.ref.set(
            {
                messages: [
                    ...(likedUser.data()?.messages || []),
                    {messageBoxID: messageBoxRef.id, userIDs: [likedUser.data().id, user.data().id]},
                ],
            },
            {merge: true}
        )
        return messageBoxRef.id
    } catch (error) {
        console.log('Error creating message box', error.message)
    }
}

exports.swipedUpOrRight = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication!')
    }

    const likedUserID = data?.id
    const userID = context.auth.uid
    if (!likedUserID) {
        throw new functions.https.HttpsError('not-found', 'Liked user id not found')
    }

    try {
        const user = await getUser(userID)
        const userData = user.data()
        const userRef = user.ref

        const likedUser = await getUser(likedUserID)
        const likedUserData = likedUser.data()
        const likedUserRef = likedUser.ref

        const isMatch = userData?.isLiked?.find((user) => user.id === likedUser?.id)

        if (isMatch) {
            const userMatches = [...(userData?.matches || []), {id: likedUserID, matchDate: Date.now()}]
            userRef.set(
                {
                    matches: userMatches,
                    isLiked: userData?.isLiked.filter((user) => user.id !== likedUser?.id),
                },
                {merge: true}
            )

            const likedUserMatches = [...(likedUserData?.matches || []), {id: userID, matchDate: Date.now()}]
            likedUserRef.set(
                {
                    matches: likedUserMatches,
                },
                {merge: true}
            )
            const messageBoxID = await createMessageBox(user, likedUser)
            return {matches: true, messageBoxID, user: likedUserData}
        }

        const isSuperLike = data?.isSuperLike || false
        likedUserRef.set(
            {
                isLiked: [...(likedUserData?.isLiked || []), {id: userID, isSuperLike}],
            },
            {merge: true}
        )
        userRef.set(
            {
                liked: [...(userData?.liked || []), likedUserData?.id],
            },
            {merge: true}
        )
        return {matches: false}
    } catch (error) {
        console.log(error)
        return {matches: false}
    }
})

exports.swipedLeft = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication!')
    }

    const dislikedUserID = data?.id
    if (!dislikedUserID) {
        throw new functions.https.HttpsError('not-found', 'disliked user id not found')
    }

    try {
        const user = await getUser(context.auth.uid)
        const userData = user.data()
        const userRef = user.ref

        const dislikedUser = await getUser(dislikedUserID)
        const dislikedUserData = dislikedUser.data()

        userRef
            .set(
                {
                    disLiked: [...(userData?.disLiked || []), dislikedUserData?.id],
                },
                {merge: true}
            )
            .then(() => console.log(`Disliked user ${dislikedUserData?.displayName} successfully!`))
            .catch((error) => console.log(error.message))

        return true
    } catch (error) {
        // throw new functions.https.HttpsError('unknown', error.message)
        console.log(error.message)
        return null
    }
})

exports.getUsers = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication!')
    }
    try {
        const user = await getUser(context.auth.uid)
        const userData = user.data()
        const email = userData?.email
        const userSettings = userData?.settings || {}
        const gender = userSettings?.gender || 'Everyone'
        const minAge = userSettings?.minAge || 0
        const maxAge = userSettings?.maxAge || 25

        const disLiked = userData?.disLiked?.map((user) => user.id) || []
        const liked = userData?.liked || []
        const matches = userData?.matches?.map((user) => user.id) || []

        return (
            await admin
                .firestore()
                .collection('users')
                .get()
        ).docs
            .filter(
                (user) => user?.data().email !== email &&
                    !disLiked.includes(user.data().id) &&
                    !matches.includes(user.data().id) &&
                    !liked.includes(user.data().id)
            )
            .filter((user: any) => {
                const userAge = calculateAge(user.data().dob?.toDate())

                if (gender === 'Everyone') {
                    if (userAge > minAge && userAge < maxAge) {
                        return true
                    }
                    return false
                }
                if (user.data()?.gender?.toLowerCase() === gender?.toLowerCase()) {
                    if (userAge > minAge && userAge < maxAge) {
                        return true
                    }
                    return false
                }
                return false
            })
            .map((user) => user.data())
    } catch (error) {
        console.log(error.message)
        return []
    }
})

exports.unMatch = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication!')
    }

    try {
        const unMatchUserID = data?.id
        const userID = context.auth.uid
        if (!unMatchUserID) {
            throw new functions.https.HttpsError('not-found', 'unMatch user id not found')
        }

        const user = await getUser(userID)
        const userData = user.data()

        const unMatchUser = await getUser(unMatchUserID)
        const unMatchUserData = unMatchUser.data()

        user.ref.update({
            matches: userData?.matches?.filter((match) => match.id !== unMatchUserID),
            messages: userData?.messages?.filter((message) => !message.userIDs.includes(unMatchUserID)),
        })

        unMatchUser.ref.update({
            matches: unMatchUserData?.matches?.filter((match) => match.id !== userID),
            messages: unMatchUserData?.messages?.filter((message) => !message.userIDs.includes(userID)),
        })
        return true
    } catch (error) {
        console.log(error.message)
        return false
    }
})

exports.updateSettings = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication!')
    }

    try {
        const minAge = data?.minAge || 0
        const maxAge = data?.maxAge || 25
        const gender = data?.gender || 'Everyone'

        const userID = context.auth.uid
        const user = await getUser(userID)
        const userRef = user.ref

        await userRef.set(
            {
                settings: {
                    minAge,
                    maxAge,
                    gender,
                },
            },
            {merge: true}
        )
        return true
    } catch (error) {
        console.log(error)
        return false
    }
})
