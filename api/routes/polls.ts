import { Router, type Response } from 'express';
import db from '../db/database.js';
import { authMiddleware, optionalAuth, type AuthRequest } from '../middleware/auth.js';

const router = Router();

interface Poll {
  id: number;
  creator_id: number;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  created_at: string;
}

interface Option {
  id: number;
  poll_id: number;
  text: string;
}

router.get('/', optionalAuth, (req: AuthRequest, res: Response): void => {
  try {
    const { status } = req.query;
    const now = new Date().toISOString();

    let query = 'SELECT p.*, u.username as creator_name FROM polls p JOIN users u ON p.creator_id = u.id';
    const params: string[] = [];

    if (status === 'active') {
      query += ' WHERE p.end_time > ?';
      params.push(now);
    } else if (status === 'ended') {
      query += ' WHERE p.end_time <= ?';
      params.push(now);
    }

    query += ' ORDER BY p.created_at DESC';

    const polls = db.prepare(query).all(...params) as (Poll & { creator_name: string })[];

    const pollsWithOptions = polls.map(poll => {
      const options = db.prepare('SELECT id, text FROM options WHERE poll_id = ?').all(poll.id) as Option[];
      const isEnded = new Date(poll.end_time) <= new Date();

      return {
        id: poll.id,
        title: poll.title,
        description: poll.description,
        status: isEnded ? 'ended' : 'active',
        startTime: poll.start_time,
        endTime: poll.end_time,
        creatorName: poll.creator_name,
        options: options.map(opt => ({ id: opt.id, text: opt.text })),
        participantCount: isEnded ? getParticipantCount(poll.id) : undefined
      };
    });

    res.json({ success: true, data: pollsWithOptions });
  } catch (error) {
    console.error('Get polls error:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

router.get('/my', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const polls = db.prepare(
      'SELECT p.*, u.username as creator_name FROM polls p JOIN users u ON p.creator_id = u.id WHERE p.creator_id = ? ORDER BY p.created_at DESC'
    ).all(req.userId) as (Poll & { creator_name: string })[];

    const pollsWithOptions = polls.map(poll => {
      const options = db.prepare('SELECT id, text FROM options WHERE poll_id = ?').all(poll.id) as Option[];
      const isEnded = new Date(poll.end_time) <= new Date();

      return {
        id: poll.id,
        title: poll.title,
        description: poll.description,
        status: isEnded ? 'ended' : 'active',
        startTime: poll.start_time,
        endTime: poll.end_time,
        creatorName: poll.creator_name,
        options: options.map(opt => ({ id: opt.id, text: opt.text })),
        participantCount: isEnded ? getParticipantCount(poll.id) : undefined
      };
    });

    res.json({ success: true, data: pollsWithOptions });
  } catch (error) {
    console.error('Get my polls error:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

router.get('/:id', optionalAuth, (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;

    const poll = db.prepare(
      'SELECT p.*, u.username as creator_name FROM polls p JOIN users u ON p.creator_id = u.id WHERE p.id = ?'
    ).get(id) as (Poll & { creator_name: string }) | undefined;

    if (!poll) {
      res.status(404).json({ success: false, error: '投票不存在' });
      return;
    }

    const options = db.prepare('SELECT id, text FROM options WHERE poll_id = ?').all(id) as Option[];
    const isEnded = new Date(poll.end_time) <= new Date();
    const isOwner = req.userId === poll.creator_id;
    const hasVoted = req.userId ? checkUserVoted(req.userId, poll.id) : false;

    let responseData: Record<string, unknown> = {
      id: poll.id,
      title: poll.title,
      description: poll.description,
      status: isEnded ? 'ended' : 'active',
      startTime: poll.start_time,
      endTime: poll.end_time,
      creatorName: poll.creator_name,
      creatorId: poll.creator_id,
      options: options.map(opt => ({ id: opt.id, text: opt.text })),
      hasVoted
    };

    if (isEnded || isOwner) {
      responseData = {
        ...responseData,
        isOwner,
        participantCount: getParticipantCount(poll.id),
        options: options.map(opt => ({
          ...opt,
          voteCount: getVoteCount(opt.id)
        }))
      };
    }

    res.json({ success: true, data: responseData });
  } catch (error) {
    console.error('Get poll error:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

router.post('/', authMiddleware, (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, options: optionTexts, startTime, endTime } = req.body;

    if (!title || !optionTexts || !Array.isArray(optionTexts) || optionTexts.length < 2) {
      res.status(400).json({ success: false, error: '请提供投票标题和至少两个选项' });
      return;
    }

    if (optionTexts.some((text: string) => !text || text.trim().length === 0)) {
      res.status(400).json({ success: false, error: '选项内容不能为空' });
      return;
    }

    const start = startTime ? new Date(startTime) : new Date();
    const end = endTime ? new Date(endTime) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    if (end <= start) {
      res.status(400).json({ success: false, error: '结束时间必须晚于开始时间' });
      return;
    }

    const result = db.prepare(
      'INSERT INTO polls (creator_id, title, description, start_time, end_time) VALUES (?, ?, ?, ?, ?)'
    ).run(req.userId, title.trim(), description?.trim() || null, start.toISOString(), end.toISOString());

    const pollId = result.lastInsertRowid;

    const insertOption = db.prepare('INSERT INTO options (poll_id, text) VALUES (?, ?)');
    for (const text of optionTexts) {
      insertOption.run(pollId, text.trim());
    }

    res.status(201).json({
      success: true,
      data: { id: pollId },
      message: '投票创建成功'
    });
  } catch (error) {
    console.error('Create poll error:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;

    const poll = db.prepare('SELECT * FROM polls WHERE id = ?').get(id) as Poll | undefined;

    if (!poll) {
      res.status(404).json({ success: false, error: '投票不存在' });
      return;
    }

    if (poll.creator_id !== req.userId) {
      res.status(403).json({ success: false, error: '只有投票发起人可以删除投票' });
      return;
    }

    db.prepare('DELETE FROM votes WHERE poll_id = ?').run(id);
    db.prepare('DELETE FROM options WHERE poll_id = ?').run(id);
    db.prepare('DELETE FROM polls WHERE id = ?').run(id);

    res.json({ success: true, message: '投票已删除' });
  } catch (error) {
    console.error('Delete poll error:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

router.post('/:id/vote', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const { optionId } = req.body;

    if (!optionId) {
      res.status(400).json({ success: false, error: '请选择投票选项' });
      return;
    }

    const poll = db.prepare('SELECT * FROM polls WHERE id = ?').get(id) as Poll | undefined;

    if (!poll) {
      res.status(404).json({ success: false, error: '投票不存在' });
      return;
    }

    const now = new Date();
    if (now < new Date(poll.start_time)) {
      res.status(400).json({ success: false, error: '投票尚未开始' });
      return;
    }

    if (now > new Date(poll.end_time)) {
      res.status(400).json({ success: false, error: '投票已结束' });
      return;
    }

    const optionIdNum = parseInt(optionId);
    if (isNaN(optionIdNum)) {
      res.status(400).json({ success: false, error: '无效的投票选项' });
      return;
    }

    const option = db.prepare('SELECT * FROM options WHERE id = ? AND poll_id = ?').get(optionIdNum, poll.id) as Option | undefined;
    if (!option) {
      res.status(400).json({ success: false, error: '无效的投票选项' });
      return;
    }

    const pollIdNum = parseInt(id);
    if (checkUserVoted(req.userId!, pollIdNum)) {
      res.status(400).json({ success: false, error: '您已参与过此投票' });
      return;
    }

    db.prepare('INSERT INTO votes (user_id, poll_id, option_id) VALUES (?, ?, ?)').run(req.userId, pollIdNum, optionIdNum);

    res.json({ success: true, message: '投票成功' });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

router.get('/:id/check', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const hasVoted = checkUserVoted(req.userId!, parseInt(id));
    res.json({ success: true, data: { hasVoted } });
  } catch (error) {
    console.error('Check vote error:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
});

function checkUserVoted(userId: number, pollId: number): boolean {
  const vote = db.prepare('SELECT id FROM votes WHERE user_id = ? AND poll_id = ?').get(userId, pollId);
  return !!vote;
}

function getVoteCount(optionId: number): number {
  const result = db.prepare('SELECT COUNT(*) as count FROM votes WHERE option_id = ?').get(optionId) as { count: number };
  return result.count;
}

function getParticipantCount(pollId: number): number {
  const result = db.prepare('SELECT COUNT(DISTINCT user_id) as count FROM votes WHERE poll_id = ?').get(pollId) as { count: number };
  return result.count;
}

export default router;
