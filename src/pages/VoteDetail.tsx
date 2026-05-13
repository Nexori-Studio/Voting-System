import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { pollsApi, type Poll } from '@/api';
import { useAuthStore } from '@/store/authStore';
import { Clock, Users, Lock, Unlock, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

export default function VoteDetail() {
  const { id } = useParams<{ id: string }>();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState('');
  const [voteSuccess, setVoteSuccess] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadPoll();
  }, [id]);

  const loadPoll = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const response = await pollsApi.getPoll(parseInt(id));
      if (response.success && response.data) {
        setPoll(response.data);
        if (response.data.hasVoted && response.data.options.length > 0) {
          setSelectedOption(response.data.options[0].id);
        }
      } else {
        setError(response.error || '加载投票失败');
      }
    } catch {
      setError('网络错误');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async () => {
    if (!poll || selectedOption === null) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsVoting(true);
    setError('');
    try {
      const response = await pollsApi.vote(poll.id, selectedOption);
      if (response.success) {
        setVoteSuccess(true);
        setTimeout(() => loadPoll(), 500);
      } else {
        setError(response.error || '投票失败');
      }
    } catch {
      setError('网络错误');
    } finally {
      setIsVoting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeRemaining = () => {
    if (!poll) return '';
    const now = new Date();
    const end = new Date(poll.endTime);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return '已结束';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `剩余 ${days} 天 ${hours} 小时`;
    if (hours > 0) return `剩余 ${hours} 小时`;
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `剩余 ${minutes} 分钟`;
  };

  const totalVotes = poll?.options.reduce((sum, opt) => sum + (opt.voteCount || 0), 0) || 0;
  const isEnded = poll?.status === 'ended';
  const canViewResults = isEnded || poll?.isOwner || poll?.hasVoted;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-700 mb-2">投票不存在</h2>
          <p className="text-slate-500 mb-6">{error || '该投票可能已被删除'}</p>
          <button onClick={() => navigate('/')} className="text-indigo-600 hover:text-indigo-700">
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xl shadow-slate-200/50">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">{poll.title}</h1>
              {poll.description && (
                <p className="text-slate-500">{poll.description}</p>
              )}
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
              isEnded
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-amber-50 text-amber-600'
            }`}>
              {isEnded ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  已结束
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  进行中
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-500 mb-8 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{formatDate(poll.endTime)}</span>
            </div>
            {!isEnded && (
              <div className="flex items-center gap-2 text-amber-600 font-medium">
                <Unlock className="w-4 h-4" />
                {getTimeRemaining()}
              </div>
            )}
            {(isEnded || poll.isOwner) && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{poll.participantCount || 0} 人参与</span>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {voteSuccess && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              投票成功！
            </div>
          )}

          {poll.isOwner && !isEnded && (
            <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-600 text-sm">
              这是您创建的投票，您可以看到实时的投票结果。
            </div>
          )}

          <div className="space-y-4 mb-8">
            {poll.options.map((option) => {
              const percentage = totalVotes > 0 ? ((option.voteCount || 0) / totalVotes) * 100 : 0;
              const isSelected = selectedOption === option.id;

              return (
                <div
                  key={option.id}
                  onClick={() => !isEnded && !poll.hasVoted && setSelectedOption(option.id)}
                  className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    isEnded || poll.hasVoted || !isAuthenticated
                      ? 'border-slate-200 bg-slate-50/50 cursor-default'
                      : isSelected
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-indigo-300 hover:bg-white'
                  }`}
                >
                  {canViewResults && (
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-10 rounded-xl"
                         style={{ width: `${percentage}%` }} />
                  )}
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {(isEnded || poll.hasVoted || !isAuthenticated) && canViewResults ? (
                        <div className="w-5 h-5 rounded-full border-2 border-indigo-500 flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                        </div>
                      ) : (
                        <div className={`w-5 h-5 rounded-full border-2 transition-colors ${
                          isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'
                        }`}>
                          {isSelected && (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-white" />
                            </div>
                          )}
                        </div>
                      )}
                      <span className="font-medium text-slate-900">{option.text}</span>
                    </div>
                    {canViewResults && (
                      <div className="text-right">
                        <span className="font-semibold text-indigo-600">{percentage.toFixed(1)}%</span>
                        <span className="text-slate-500 text-sm ml-2">({option.voteCount || 0})</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!isEnded && !poll.hasVoted && isAuthenticated && (
            <button
              onClick={handleVote}
              disabled={selectedOption === null || isVoting}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isVoting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                '确认投票'
              )}
            </button>
          )}

          {!isEnded && !isAuthenticated && (
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200"
            >
              登录后参与投票
            </button>
          )}

          {poll.hasVoted && !isEnded && (
            <div className="text-center text-slate-500 py-2">
              您已参与此投票，感谢您的参与！
            </div>
          )}

          {isEnded && (
            <div className="text-center text-slate-500 py-2">
              投票已结束，感谢大家的参与！
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
