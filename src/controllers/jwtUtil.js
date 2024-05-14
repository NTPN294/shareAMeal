const jwt = require('jsonwebtoken');
const logger = require('../util/logger');

const jwtUtil = {
    generate: (data) => {
        return jwt.sign({data}, process.env.JWT_SECRET, {
            expiresIn: '2h' 
        });
    },

    authenticate: (req, res, next) => { // Make sure to include req, res, next parameters
        if (!req.headers.authorization) {
            return res.status(401).json({ error: 'Unauthorized: Missing token, please log in at api/login with a valid [emailAdress] and [password]' });
        }
        const token = req.headers.authorization.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: Missing token, please log in at api/login with a valid [emailAdress] and [password]' });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                logger.error('JWT verification error:', err.message);
                return res.status(403).json({ error: 'Forbidden: Invalid token' });
            }
            next(); // Call next() to proceed to the next middleware or route handler
        });
    },

    getUserId: (token,res) => {
        const token2 = token.split(' ')[1];
        const decoded2 = jwt.decode(token2);
        return decoded2.data.id;
      
    }
};

module.exports = jwtUtil;
