const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const User = {
    generateJWT: (user) => {
        const expiry = new Date();
        expiry.setDate(expiry.getHours() + 2);
        return jwt.sign({
            _id: user.username,
            email: user.email,
            exp: parseInt(expiry.getTime() / 1000, 10)
        }, process.env.JWT_KEY);
    },
    setHash: async (password, saltRounds = 12) => {
        try {
            const salt = await bcrypt.genSalt(saltRounds);

            return await bcrypt.hash(password, salt);
        } catch(error) {
            console.log(error);
        }

        return null;
    },
    compare: async (password, hash) => {
        try {
            const result = await bcrypt.compare(password, hash);
            console.log(result);
            return result;
        } catch(error) {
            console.log(error);
        }

        return false;
    }
};

module.exports = {
    User
};
