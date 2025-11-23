import dotenv from 'dotenv';

dotenv.config();

const basicAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({
      error: 'Unauthorized access. Please provide valid credentials.'
    });
  }

  try {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    const validUsername = process.env.AUTH_USERNAME || 'admin';
    const validPassword = process.env.AUTH_PASSWORD || 'password123';

    if (username === validUsername && password === validPassword) {
      next();
    } else {
      return res.status(401).json({
        error: 'Unauthorized access. Please provide valid credentials.'
      });
    }
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized access. Please provide valid credentials.'
    });
  }
};

export default basicAuth;
