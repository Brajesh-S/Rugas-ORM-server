const jwt = require('jsonwebtoken'); // Add this at the top

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization denied' });
    }

    const token = authHeader.split(' ')[1];
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Add optional check for decoded user structure
        if (!decoded?.user?.id) {
            return res.status(401).json({ message: 'Invalid token payload' });
        }

        req.user = decoded.user;
        next();
    } catch (err) {
        console.error('JWT Error:', err.message);
        const message = err.name === 'TokenExpiredError' 
            ? 'Token expired' 
            : 'Invalid token';
        res.status(401).json({ message });
    }
};

module.exports = authMiddleware; // Change to CommonJS export