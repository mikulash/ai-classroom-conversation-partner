import { Router } from 'express';
import { hashPassword, comparePassword, generateToken } from '../../utils/auth.js';
import { authenticate } from '../../middleware/auth.js';
import prisma from '../../clients/prisma';

const router = Router();

/**
 * Validate if email belongs to allowed domains
 */
function isValidUniversityEmail(email: string, allowedDomains: string[]): boolean {
  return allowedDomains.some((domain) => email.endsWith(domain));
}

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, gender } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    // Get allowed domains from app config
    const appConfig = await prisma.appConfig.findFirst();
    const allowedDomains = appConfig?.allowedDomains || [];

    // Validate university email
    if (allowedDomains.length > 0 && !isValidUniversityEmail(email, allowedDomains)) {
      res.status(400).json({
        message: `Email must end with one of the following domains: ${allowedDomains.join(', ')}`,
      });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.profile.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.profile.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        gender,
        userRole: 'basic',
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        gender: true,
        userRole: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      userRole: user.userRole,
    });

    res.status(201).json({
      user,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * POST /api/auth/login
 * Login user and return JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    // Find user
    const user = await prisma.profile.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      userRole: user.userRole,
    });

    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /api/auth/me
 * Get current user profile (requires authentication)
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const user = await prisma.profile.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        gender: true,
        conversationRole: true,
        bio: true,
        userRole: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', authenticate, async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    // Generate new token
    const token = generateToken({
      userId: req.user.userId,
      email: req.user.email,
      userRole: req.user.userRole,
    });

    res.status(200).json({ token });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * PUT /api/auth/password
 * Update user password
 */
router.put('/password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Current password and new password are required' });
      return;
    }

    // Get user with password
    const user = await prisma.profile.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Verify current password
    const isValidPassword = await comparePassword(currentPassword, user.password);

    if (!isValidPassword) {
      res.status(401).json({ message: 'Current password is incorrect' });
      return;
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.profile.update({
      where: { id: req.user.userId },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
