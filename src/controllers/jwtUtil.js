const jwt = require('jsonwebtoken');
const logger = require('../util/logger');

const jwtUtil = {
    generate: (emailAdress) => {
        return jwt.sign({ emailAdress }, process.env.JWT_SECRET, {
            expiresIn: '2h' 
        });
    },

    authenticate: (req, res, next) => { // Make sure to include req, res, next parameters
        const token = req.headers.authorization;
        console.log(req.headers);

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: Missing token, please log in at api/login with a valid [emailAdress] and [password]' });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                logger.error('JWT verification error:', err.message);
                return res.status(403).json({ error: 'Forbidden: Invalid token' });
            }

            // Token is valid; attach decoded user information to request object
            req.user = decoded;
            next(); // Call next() to proceed to the next middleware or route handler
        });
    }
};

module.exports = jwtUtil;
