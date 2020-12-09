const bcrypt = require('bcrypt');

const User = {
    setHash: async (password, saltRounds = 10) => {
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
            return await bcrypt.compare(password, hash);
        } catch(error) {
            console.log(error);
        }

        return false;
    }
};

module.exports = {
    User
};
