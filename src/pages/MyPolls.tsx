import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { pollsApi, type Poll } from '@/api';
import { useAuthStore } from '@/store/authStore';
import { Plus, Trash2, Loader2, BarChart2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function MyPolls() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { isAuthenticated, isLoading: authLoading, checkAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isAuthenticated) {
      loadPolls();
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      window.history.replaceState({}, document.title);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  }, [location.state]);

  const loadPolls = async () => {
    setIsLoading(true);
    try {
      const response = await pollsApi.getMyPolls();
      if (response.success && response.data) {
        setPolls(response.data);
      } else {
        setError(response.error || '加载投票失败');
      }
    } catch {
      setError('网络错误');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (pollId: number) => {
    if (!confirm('确定要删除这个投票吗？此操作无法撤销。')) {
      return;
    }

    setDeletingId(pollId);
    try {
      const response = await pollsApi.deletePoll(pollId);
      if (response.success) {
        setPolls(polls.filter(p => p.id !== pollId));
      } else {
        setError(response.error || '删除失败');
      }
    } catch {
      setError('网络错误');
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const activePolls = polls.filter(p => p.status === 'active');
  const endedPolls = polls.filter(p => p.status === 'ended');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">我的投票</h1>
            <p className="text-slate-500">管理和查看您创建的投票</p>
          </div>
          <Link
            to="/create"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            创建投票
          </Link>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
            <button onClick={() => setError('')} className="ml-auto">×</button>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : polls.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <BarChart2 className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">暂无投票</h3>
            <p className="text-slate-500 mb-6">您还没有创建任何投票</p>
            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              创建第一个投票
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {activePolls.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  进行中 ({activePolls.length})
                </h2>
                <div className="grid gap-4">
                  {activePolls.map(poll => (
                    <div key={poll.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link to={`/vote/${poll.id}`} className="text-lg font-semibold text-slate-900 hover:text-indigo-600 transition-colors">
                            {poll.title}
                          </Link>
                          {poll.description && (
                            <p className="text-sm text-slate-500 mt-1 line-clamp-1">{poll.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                            <span>{poll.options.length} 个选项</span>
                            <span>•</span>
                            <span>截止 {new Date(poll.endTime).toLocaleDateString('zh-CN')}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-medium rounded-full">
                            进行中
                          </span>
                          <button
                            onClick={() => handleDelete(poll.id)}
                            disabled={deletingId === poll.id}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                          >
                            {deletingId === poll.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {endedPolls.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  已结束 ({endedPolls.length})
                </h2>
                <div className="grid gap-4">
                  {endedPolls.map(poll => {
                    const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.voteCount || 0), 0);
                    return (
                      <div key={poll.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Link to={`/vote/${poll.id}`} className="text-lg font-semibold text-slate-900 hover:text-indigo-600 transition-colors">
                              {poll.title}
                            </Link>
                            {poll.description && (
                              <p className="text-sm text-slate-500 mt-1 line-clamp-1">{poll.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                              <span>{poll.options.length} 个选项</span>
                              <span>•</span>
                              <span>{totalVotes} 票</span>
                              <span>•</span>
                              <span>已于 {new Date(poll.endTime).toLocaleDateString('zh-CN')} 结束</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-medium rounded-full">
                              已结束
                            </span>
                            <button
                              onClick={() => handleDelete(poll.id)}
                              disabled={deletingId === poll.id}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                            >
                              {deletingId === poll.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
