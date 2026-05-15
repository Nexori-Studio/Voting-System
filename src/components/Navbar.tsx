import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { LogOut, Plus, User, BarChart2, Home } from 'lucide-react';
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
    <nav className="sticky top-0 z-50 bg-white/60 backdrop-blur-xl border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40 group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl font-black text-white">N</span>
            </div>
            <span className="text-2xl font-extrabold text-gradient">
              Nexori投票平台
            </span>
          </Link>

          <div className="flex items-center gap-6">
            {isLoading ? (
              <div className="w-12 h-12 rounded-2xl bg-slate-100 animate-pulse" />
            ) : isAuthenticated && user ? (
              <>
                <Link
                  to="/"
                  className="p-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all duration-200"
                  title="首页"
                >
                  <Home className="w-5 h-5" />
                </Link>

                <Link
                  to="/create"
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold hover:shadow-2xl hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all duration-300"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">创建投票</span>
                </Link>

                <Link
                  to="/my-polls"
                  className="p-3 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-2xl transition-all duration-200"
                  title="我的投票"
                >
                  <BarChart2 className="w-5 h-5" />
                </Link>

                <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
                  <div className="w-11 h-11 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-2xl flex items-center justify-center shadow-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="hidden sm:inline text-base font-bold text-slate-700">
                    {user.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-200"
                    title="退出登录"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-3 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl font-bold transition-all duration-200"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold hover:shadow-2xl hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all duration-300"
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
