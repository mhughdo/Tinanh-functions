const admin = require('./utils/admin')

const resetLikeMatches = async () => {
    try {
        const users = await admin
            .firestore()
            .collection('users')
            .get()
        for (const user of users.docs) {
            if (user.data().id) {
                await user.ref.set(
                    {
                        disLiked: [],
                        isLiked: [],
                        matches: [],
                        messages: [],
                        liked: [],
                    },
                    {merge: true}
                )
                console.log(`Reset user ${user.data().email} successfully`)
            }
        }
        const messages = await admin
            .firestore()
            .collection('messages')
            .get()
        for (const message of messages.docs) {
            await message.ref.delete()
            console.log('Delete', message.data().name, 'successfully')
        }
    } catch (error) {
        console.log(error.message)
    }
}

resetLikeMatches()
