import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { LogOut, Plus, User, BarChart2 } from 'lucide-react';
import { useEffect } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, isLoading, logout, checkAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <BarChart2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              投票平台
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
            ) : isAuthenticated && user ? (
              <>
                <Link
                  to="/create"
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">创建投票</span>
                </Link>

                <Link
                  to="/my-polls"
                  className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200"
                  title="我的投票"
                >
                  <BarChart2 className="w-5 h-5" />
                </Link>

                <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-slate-700">
                    {user.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                    title="退出登录"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-slate-600 hover:text-indigo-600 font-medium transition-colors"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5"
                >
                  注册
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
