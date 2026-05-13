import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import PollCard from '@/components/PollCard';
import { pollsApi, type Poll } from '@/api';
import { useAuthStore } from '@/store/authStore';
import { BarChart2, TrendingUp, Users, Loader2 } from 'lucide-react';

export default function Home() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [activePolls, setActivePolls] = useState<Poll[]>([]);
  const [endedPolls, setEndedPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'ended'>('active');
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async () => {
    setIsLoading(true);
    try {
      const response = await pollsApi.getPolls();
      if (response.success && response.data) {
        setPolls(response.data);
        setActivePolls(response.data.filter(p => p.status === 'active'));
        setEndedPolls(response.data.filter(p => p.status === 'ended'));
      }
    } catch (error) {
      console.error('Failed to load polls:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const displayedPolls = activeTab === 'active' ? activePolls : endedPolls;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-xl shadow-indigo-500/30">
            <BarChart2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              发现精彩投票
            </span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            参与社区投票，表达你的观点。安全可靠，公平公正。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{activePolls.length}</div>
                <div className="text-sm text-slate-500">正在进行</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <BarChart2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{endedPolls.length}</div>
                <div className="text-sm text-slate-500">已结束投票</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{polls.length}</div>
                <div className="text-sm text-slate-500">投票总数</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
              activeTab === 'active'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            进行中 ({activePolls.length})
          </button>
          <button
            onClick={() => setActiveTab('ended')}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
              activeTab === 'ended'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            已结束 ({endedPolls.length})
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : displayedPolls.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <BarChart2 className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              {activeTab === 'active' ? '暂无进行中的投票' : '暂无已结束的投票'}
            </h3>
            <p className="text-slate-500 mb-6">
              {activeTab === 'active' && isAuthenticated
                ? '成为第一个发起投票的人吧！'
                : '稍后再来看看吧'}
            </p>
            {activeTab === 'active' && isAuthenticated && (
              <a
                href="/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                创建投票
              </a>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedPolls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                showResult={poll.status === 'ended'}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
