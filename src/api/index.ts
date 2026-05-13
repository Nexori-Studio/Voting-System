const API_BASE = '/api';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    return { success: false, error: '网络请求失败' };
  }
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface PollOption {
  id: number;
  text: string;
  voteCount?: number;
}

export interface Poll {
  id: number;
  title: string;
  description: string | null;
  status: 'active' | 'ended';
  startTime: string;
  endTime: string;
  creatorName: string;
  creatorId?: number;
  options: PollOption[];
  participantCount?: number;
  hasVoted?: boolean;
  isOwner?: boolean;
}

export const authApi = {
  register: (username: string, email: string, password: string) =>
    request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    }),

  login: (email: string, password: string) =>
    request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    request('/auth/logout', { method: 'POST' }),

  getMe: () =>
    request<User>('/auth/me'),
};

export const pollsApi = {
  getPolls: (status?: 'active' | 'ended' | 'all') =>
    request<Poll[]>(`/polls${status ? `?status=${status}` : ''}`),

  getMyPolls: () =>
    request<Poll[]>('/polls/my'),

  getPoll: (id: number) =>
    request<Poll>(`/polls/${id}`),

  createPoll: (data: {
    title: string;
    description?: string;
    options: string[];
    startTime?: string;
    endTime?: string;
  }) =>
    request<{ id: number }>('/polls', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deletePoll: (id: number) =>
    request(`/polls/${id}`, { method: 'DELETE' }),

  vote: (pollId: number, optionId: number) =>
    request(`/polls/${pollId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ optionId }),
    }),

  checkVote: (pollId: number) =>
    request<{ hasVoted: boolean }>(`/polls/${pollId}/check`),
};
