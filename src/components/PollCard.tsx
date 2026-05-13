import { Link } from 'react-router-dom';
import { Clock, Users, Lock, CheckCircle2 } from 'lucide-react';
import type { Poll } from '@/api';

interface PollCardProps {
  poll: Poll;
  showResult?: boolean;
  hasVoted?: boolean;
}

export default function PollCard({ poll, showResult = false, hasVoted = false }: PollCardProps) {
  const isEnded = poll.status === 'ended';
  const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.voteCount || 0), 0);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">{poll.title}</h3>
          {poll.description && (
            <p className="text-sm text-slate-500 line-clamp-2">{poll.description}</p>
          )}
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
          isEnded
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-amber-50 text-amber-600'
        }`}>
          {isEnded ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              已结束
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5" />
              进行中
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {formatDate(poll.endTime)}
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {isEnded ? `${poll.participantCount || 0} 人参与` : '投票进行中'}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {poll.options.map((option) => {
          const percentage = totalVotes > 0 ? ((option.voteCount || 0) / totalVotes) * 100 : 0;

          return (
            <div key={option.id} className="relative">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-700">{option.text}</span>
                {showResult && (
                  <span className="text-slate-500 font-medium">
                    {option.voteCount || 0} 票 ({percentage.toFixed(1)}%)
                  </span>
                )}
              </div>
              {showResult && (
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Link
        to={`/vote/${poll.id}`}
        className={`block w-full py-2.5 rounded-xl text-center text-sm font-medium transition-all duration-200 ${
          isEnded
            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            : hasVoted
              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30'
        }`}
      >
        {isEnded ? '查看结果' : hasVoted ? '已投票 - 查看详情' : '参与投票'}
      </Link>
    </div>
  );
}
