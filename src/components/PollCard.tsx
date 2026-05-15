import { Link } from 'react-router-dom';
import { Clock, Users, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
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
    <div className="glass-card rounded-3xl p-8 glass-card-hover">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-900 mb-2">{poll.title}</h3>
          {poll.description && (
            <p className="text-sm text-slate-500 line-clamp-2">{poll.description}</p>
          )}
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold ${
          isEnded
            ? 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700'
            : 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700'
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

      <div className="flex items-center gap-6 text-sm text-slate-500 mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          {formatDate(poll.endTime)}
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          {isEnded ? `${poll.participantCount || 0} 人参与` : '投票进行中'}
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {poll.options.map((option, idx) => {
          const percentage = totalVotes > 0 ? ((option.voteCount || 0) / totalVotes) * 100 : 0;
          const colors = [
            'from-indigo-500 to-indigo-600',
            'from-purple-500 to-purple-600',
            'from-pink-500 to-pink-600',
            'from-blue-500 to-blue-600',
            'from-cyan-500 to-cyan-600',
          ];
          const color = colors[idx % colors.length];

          return (
            <div key={option.id} className="relative">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-slate-800">{option.text}</span>
                {showResult && (
                  <span className="font-extrabold text-slate-700">
                    {option.voteCount || 0} 票 ({percentage.toFixed(1)}%)
                  </span>
                )}
              </div>
              {showResult && (
                <div className="h-3 bg-gradient-to-r from-slate-100 to-slate-200 rounded-2xl overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${color} rounded-2xl transition-all duration-700`}
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
        className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-base font-semibold transition-all duration-300 ${
          isEnded
            ? 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 hover:from-slate-200 hover:to-slate-300'
            : hasVoted
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl'
              : 'btn-primary'
        }`}
      >
        {isEnded ? '查看结果' : hasVoted ? '已投票 - 查看详情' : '参与投票'}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
