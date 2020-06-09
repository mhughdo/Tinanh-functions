"use strict";
const admin = require('./utils/admin');
const getImageUrls = require('./getImageUrls');
let urls = [];
const users = [
    {
        displayName: 'Hồng Ngọc',
        age: 20,
        school: 'HUST',
        bio: 'This is a bio',
        dob: new Date('January 1, 1999'),
        gender: 'female',
        isNewUser: false,
        createdAt: Date.now(),
        email: 'test0@gmail.com',
    },
    {
        displayName: 'Ngọc Anh',
        age: 20,
        school: 'SOL',
        bio: 'This is a bio',
        dob: new Date('January 1, 1999'),
        gender: 'female',
        isNewUser: false,
        createdAt: Date.now(),
        email: 'test1@gmail.com',
    },
    {
        displayName: 'Phương Anh',
        age: 20,
        school: 'VNU',
        bio: 'This is a bio',
        dob: new Date('January 1, 1999'),
        gender: 'female',
        isNewUser: false,
        createdAt: Date.now(),
        email: 'test2@gmail.com',
    },
    {
        displayName: 'Lan Hương',
        age: 20,
        school: 'VNU',
        bio: 'This is a bio',
        dob: new Date('January 1, 1999'),
        gender: 'female',
        isNewUser: false,
        createdAt: Date.now(),
        email: 'test3@gmail.com',
    },
    {
        displayName: 'Phương Thảo',
        age: 20,
        school: 'VNU',
        bio: 'This is a bio',
        dob: new Date('January 1, 1999'),
        gender: 'female',
        isNewUser: false,
        createdAt: Date.now(),
        email: 'test4@gmail.com',
    },
    {
        displayName: 'Thu Hà',
        age: 20,
        school: 'VNU',
        bio: 'This is a bio',
        dob: new Date('January 1, 1999'),
        gender: 'female',
        isNewUser: false,
        createdAt: Date.now(),
        email: 'test5@gmail.com',
    },
    {
        displayName: 'Hương Ly',
        age: 20,
        school: 'VNU',
        bio: 'This is a bio',
        dob: new Date('January 1, 1999'),
        gender: 'female',
        isNewUser: false,
        createdAt: Date.now(),
        email: 'test6@gmail.com',
    },
    {
        displayName: 'Ngọc Hà',
        age: 20,
        school: 'VNU',
        bio: 'This is a bio',
        dob: new Date('January 1, 1999'),
        gender: 'female',
        isNewUser: false,
        createdAt: Date.now(),
        email: 'test7@gmail.com',
    },
    {
        displayName: 'Thuỳ Anh',
        age: 20,
        school: 'VNU',
        bio: 'This is a bio',
        dob: new Date('January 1, 1999'),
        gender: 'female',
        isNewUser: false,
        createdAt: Date.now(),
        email: 'test8@gmail.com',
    },
    {
        displayName: 'Thuỷ Tiên',
        age: 20,
        school: 'VNU',
        bio: 'This is a bio',
        dob: new Date('January 1, 1999'),
        gender: 'female',
        isNewUser: false,
        createdAt: Date.now(),
        email: 'test9@gmail.com',
    },
    {
        displayName: 'Hằng Nguyễn',
        age: 20,
        school: 'VNU',
        bio: 'This is a bio',
        dob: new Date('January 1, 1999'),
        gender: 'female',
        isNewUser: false,
        createdAt: Date.now(),
        email: 'test10@gmail.com',
    },
    {
        displayName: 'Bích Phương',
        age: 20,
        school: 'VNU',
        bio: 'This is a bio',
        dob: new Date('January 1, 1999'),
        gender: 'female',
        isNewUser: false,
        createdAt: Date.now(),
        email: 'test11@gmail.com',
    },
    {
        displayName: 'Lan Phương',
        age: 20,
        school: 'VNU',
        bio: 'This is a bio',
        dob: new Date('January 1, 1999'),
        gender: 'female',
        isNewUser: false,
        createdAt: Date.now(),
        email: 'test12@gmail.com',
    },
    {
        displayName: 'Nhàn Vũ',
        age: 20,
        school: 'VNU',
        bio: 'This is a bio',
        dob: new Date('January 1, 1999'),
        gender: 'female',
        isNewUser: false,
        createdAt: Date.now(),
        email: 'test13@gmail.com',
    },
    {
        displayName: 'Mai Anh',
        age: 20,
        school: 'VNU',
        bio: 'This is a bio',
        dob: new Date('January 1, 1999'),
        gender: 'female',
        isNewUser: false,
        createdAt: Date.now(),
        email: 'test14@gmail.com',
    },
    {
        displayName: 'Xuân Dung',
        age: 20,
        school: 'VNU',
        bio: 'This is a bio',
        dob: new Date('January 1, 1999'),
        gender: 'female',
        isNewUser: false,
        createdAt: Date.now(),
        email: 'test15@gmail.com',
    },
    {
        displayName: 'Hoàng Linh',
        age: 20,
        school: 'VNU',
        bio: 'This is a bio',
        dob: new Date('January 1, 1999'),
        gender: 'female',
        isNewUser: false,
        createdAt: Date.now(),
        email: 'test16@gmail.com',
    },
    {
        displayName: 'Hà My',
        age: 20,
        school: 'VNU',
        bio: 'This is a bio',
        dob: new Date('January 1, 1999'),
        gender: 'female',
        isNewUser: false,
        createdAt: Date.now(),
        email: 'test17@gmail.com',
    },
    {
        displayName: 'Thanh Huyền',
        age: 20,
        school: 'VNU',
        bio: 'This is a bio',
        dob: new Date('January 1, 1999'),
        gender: 'female',
        isNewUser: false,
        createdAt: Date.now(),
        email: 'test18@gmail.com',
    },
];
const getRandomNumber = (min, max, picked) => {
    const num = Math.floor(Math.random() * max) + min;
    if (picked.includes(num)) {
        return getRandomNumber(min, max, picked);
    }
    return num;
};
const createUser = async (user, userAuth) => {
    try {
        delete user.age;
        const picked = [];
        const images = Array.from({ length: 6 }).reduce((acc, val, idx) => {
            const num = getRandomNumber(0, 42, picked);
            const { uri, thumbnail, medium } = urls[num];
            picked.push(num);
            return Object.assign(Object.assign({}, acc), { [idx]: { uri, thumbnail, medium } });
        }, {});
        const defaultAvatarURL = images['0'].medium;
        await admin
            .firestore()
            .doc(`users/${userAuth.uid}`)
            .set(Object.assign(Object.assign({}, user), { id: userAuth.uid, avatarURL: defaultAvatarURL, photos: images }));
    }
    catch (error) {
        console.log(error.message);
    }
};
const createUsers = async () => {
    for (const user of users) {
        const userAuth = await admin.auth().createUser({
            email: user.email,
            emailVerified: false,
            password: '12345678',
            displayName: user.displayName,
            disabled: false,
        });
        urls = await getImageUrls();
        await createUser(user, userAuth);
        console.log('Successfully created new user:', user.email);
    }
    return null;
};
createUsers();
//# sourceMappingURL=createUsers.js.map