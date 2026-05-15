import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { pollsApi, type Poll } from '@/api';
import { useAuthStore } from '@/store/authStore';
import { Clock, Users, Lock, Unlock, CheckCircle2, AlertCircle, Loader2, ArrowLeft, BarChart2 } from 'lucide-react';

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
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 transition-colors glass-card px-4 py-2"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>

        <div className="glass-card p-8 shadow-2xl fade-in">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{poll.title}</h1>
              {poll.description && (
                <p className="text-slate-500 text-lg">{poll.description}</p>
              )}
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ml-4 ${
              isEnded
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
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

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-8 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-2 bg-white/50 px-3 py-2 rounded-lg">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>{formatDate(poll.endTime)}</span>
            </div>
            {!isEnded && (
              <div className="flex items-center gap-2 text-amber-600 font-semibold bg-amber-50 px-3 py-2 rounded-lg">
                <Unlock className="w-4 h-4" />
                {getTimeRemaining()}
              </div>
            )}
            {(isEnded || poll.isOwner) && (
              <div className="flex items-center gap-2 bg-white/50 px-3 py-2 rounded-lg">
                <Users className="w-4 h-4 text-indigo-500" />
                <span>{poll.participantCount || 0} 人参与</span>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50/80 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {voteSuccess && (
            <div className="mb-6 p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl text-emerald-600 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              投票成功！
            </div>
          )}

          {poll.isOwner && !isEnded && (
            <div className="mb-6 p-4 bg-indigo-50/80 border border-indigo-200 rounded-xl text-indigo-600 text-sm flex items-center gap-2">
              <BarChart2 className="w-4 h-4 flex-shrink-0" />
              这是您创建的投票，您可以看到实时的投票结果。
            </div>
          )}

          <div className="space-y-4 mb-8">
            {poll.options.map((option, index) => {
              const percentage = totalVotes > 0 ? ((option.voteCount || 0) / totalVotes) * 100 : 0;
              const isSelected = selectedOption === option.id;
              const colors = [
                'from-indigo-500 to-purple-600',
                'from-pink-500 to-rose-500',
                'from-emerald-500 to-teal-500',
                'from-amber-500 to-orange-500',
                'from-cyan-500 to-blue-500'
              ];
              const colorClass = colors[index % colors.length];

              return (
                <div
                  key={option.id}
                  onClick={() => !isEnded && !poll.hasVoted && setSelectedOption(option.id)}
                  className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                    isEnded || poll.hasVoted || !isAuthenticated
                      ? 'border-slate-200 bg-slate-50/50 cursor-default'
                      : isSelected
                        ? 'border-indigo-500 bg-indigo-50/50'
                        : 'border-slate-200 hover:border-indigo-300 hover:bg-white/50'
                  }`}
                >
                  {canViewResults && (
                    <div 
                      className={`absolute inset-0 bg-gradient-to-r ${colorClass} opacity-15 rounded-2xl transition-all duration-500`}
                      style={{ width: `${percentage}%` }} 
                    />
                  )}
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex items-center gap-3">
                        {(isEnded || poll.hasVoted || !isAuthenticated) && canViewResults ? (
                          <div className="w-6 h-6 rounded-full border-2 border-indigo-500 flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600" />
                          </div>
                        ) : (
                          <div className={`w-6 h-6 rounded-full border-2 transition-all ${
                            isSelected ? 'border-indigo-500 bg-gradient-to-r from-indigo-500 to-purple-600' : 'border-slate-300'
                          }`}>
                            {isSelected && (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="w-2.5 h-2.5 rounded-full bg-white" />
                              </div>
                            )}
                          </div>
                        )}
                        <span className="font-semibold text-slate-900">{option.text}</span>
                      </div>
                    </div>
                    {canViewResults && (
                      <div className="text-right">
                        <span className={`font-bold text-lg bg-gradient-to-r ${colorClass} bg-clip-text text-transparent`}>{percentage.toFixed(1)}%</span>
                        <span className="text-slate-500 text-sm ml-2">({option.voteCount || 0}票)</span>
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
              className="btn-primary w-full"
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
              className="btn-primary w-full"
            >
              登录后参与投票
            </button>
          )}

          {poll.hasVoted && !isEnded && (
            <div className="text-center text-slate-500 py-4 bg-white/50 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
              您已参与此投票，感谢您的参与！
            </div>
          )}

          {isEnded && (
            <div className="text-center text-slate-500 py-4 bg-white/50 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
              投票已结束，感谢大家的参与！
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
