import { Router, type Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db/database.js';
import { generateToken, authMiddleware, type AuthRequest } from '../middleware/auth.js';

const router = Router();

interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
}

router.post('/register', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ success: false, error: '请填写所有必填字段' });
      return;
    }

    if (username.length < 2 || username.length > 20) {
      res.status(400).json({ success: false, error: '用户名长度需在2-20个字符之间' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, error: '密码至少需要6个字符' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ success: false, error: '请输入有效的邮箱地址' });
      return;
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      res.status(400).json({ success: false, error: '该邮箱已被注册' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = db.prepare(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)'
    ).run(username, email, passwordHash);

    const user = db.prepare('SELECT id, username, email FROM users WHERE id = ?').get(result.lastInsertRowid) as User;

    res.status(201).json({
      success: true,
      data: user,
      message: '注册成功'
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

router.post('/login', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: '请填写邮箱和密码' });
      return;
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
    if (!user) {
      res.status(401).json({ success: false, error: '邮箱或密码错误' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      res.status(401).json({ success: false, error: '邮箱或密码错误' });
      return;
    }

    const token = generateToken({ userId: user.id, email: user.email });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

router.post('/logout', (req: AuthRequest, res: Response): void => {
  res.clearCookie('token');
  res.json({ success: true, message: '已退出登录' });
});

router.get('/me', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const user = db.prepare('SELECT id, username, email, created_at FROM users WHERE id = ?').get(req.userId) as User | undefined;

    if (!user) {
      res.status(404).json({ success: false, error: '用户不存在' });
      return;
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

export default router;
