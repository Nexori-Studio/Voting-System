import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { pollsApi } from '@/api';
import { useAuthStore } from '@/store/authStore';
import { Plus, Trash2, Loader2, ArrowRight, Clock, Calendar } from 'lucide-react';

export default function CreatePoll() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, isLoading: authLoading, checkAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('请输入投票标题');
      return;
    }

    const validOptions = options.filter((opt) => opt.trim());
    if (validOptions.length < 2) {
      setError('请至少提供两个投票选项');
      return;
    }

    let endDateTime = null;
    if (endTime) {
      endDateTime = new Date(endTime);
      if (endDateTime <= new Date()) {
        setError('结束时间必须晚于当前时间');
        return;
      }
    }

    setIsLoading(true);
    try {
      const response = await pollsApi.createPoll({
        title: title.trim(),
        description: description.trim() || undefined,
        options: validOptions.map((opt) => opt.trim()),
        endTime: endDateTime?.toISOString(),
      });

      if (response.success) {
        navigate('/my-polls', { state: { message: '投票创建成功！' } });
      } else {
        setError(response.error || '创建投票失败');
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">创建新投票</h1>
          <p className="text-slate-500">设计一个投票，让社区参与决策</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                投票标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：最喜欢的编程语言是什么？"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                投票描述 <span className="text-slate-400">(可选)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="详细说明投票的背景和目的..."
                rows={3}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                maxLength={500}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                投票选项 <span className="text-red-500">*</span>
                <span className="text-slate-400 font-normal ml-2">(2-10个选项)</span>
              </label>
              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`选项 ${index + 1}`}
                      className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      maxLength={100}
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {options.length < 10 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-3 flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  添加选项
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                投票结束时间
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  min={getMinDateTime()}
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                不设置结束时间则投票默认持续7天
              </p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    创建投票
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
