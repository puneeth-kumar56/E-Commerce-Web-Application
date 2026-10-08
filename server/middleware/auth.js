import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'novamart_super_secret_jwt_key_2026_internship_task';

/**
 * JWT Authentication Middleware
 * Validates the Authorization Bearer token header
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired authentication token. Please sign in again.',
    });
  }
}

/**
 * Role-Based Access Control (RBAC) Middleware
 * Ensures the authenticated user possesses the required role
 */
export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before verifying role permissions.',
      });
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: This resource requires '${role}' role privileges. Your current role is '${req.user.role}'.`,
      });
    }

    next();
  };
}

/**
 * Optional Authentication Middleware
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch {
      // Ignore token decode error for optional auth
    }
  }
  next();
}
