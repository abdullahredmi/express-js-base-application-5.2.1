const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  // Authorization header check
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    
    token = req.headers.authorization.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

      req.user = decoded; // user info attach
      next();

    } catch (error) {
      return res.status(401).json({
        message: 'Invalid token',
        status: 'error',
        statusCode: 401
      });
    }

  } else {
    return res.status(401).json({
      message: 'Token not found',
      status: 'error',
      statusCode: 401
    });
  }
};

module.exports = { protect };