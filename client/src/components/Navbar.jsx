import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { HiOutlineHome, HiOutlineHeart, HiOutlineUser, HiOutlineLogout, HiOutlineLogin, HiOutlineMenu, HiOutlineX, HiOutlineShieldCheck, HiOutlineMoon, HiOutlineSun, HiOutlineBell, HiOutlineBriefcase, HiOutlineInformationCircle, HiOutlineMail } from 'react-icons/hi';
import { useState, useEffect } from 'react';
import { getNotifications, markAllRead } from '../api/notifications';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      getNotifications()
        .then(data => { setNotifications(data.notifications); setUnreadCount(data.unread_count); })
        .catch(() => {});
    }, 30000);
    getNotifications()
      .then(data => { setNotifications(data.notifications); setUnreadCount(data.unread_count); })
      .catch(() => {});
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-indigo-600">
            <HiOutlineHome className="w-7 h-7" />
            Noble Estates
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 font-medium transition-colors">Home</Link>
            <Link to="/listings" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 font-medium transition-colors">Listings</Link>
            <Link to="/agents" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 font-medium transition-colors">Agents</Link>
            <Link to="/blog" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 font-medium transition-colors">Resources</Link>
            <Link to="/contact" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 font-medium transition-colors">Contact</Link>
            {user && (
              <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 font-medium transition-colors">
                <HiOutlineHeart className="w-5 h-5 inline mr-1" />Favorites
              </Link>
            )}
            {(user?.role === 'agent' || user?.role === 'admin') && (
              <Link to="/agent-dashboard" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 font-medium transition-colors">
                <HiOutlineBriefcase className="w-5 h-5 inline mr-1" />My Listings
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 font-medium transition-colors">
                <HiOutlineShieldCheck className="w-5 h-5 inline mr-1" />Management
              </Link>
            )}
            <button onClick={toggleTheme} className="p-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 transition-colors" title="Toggle dark mode">
              {dark ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
            </button>
            {user ? (
              <div className="flex items-center gap-4">
                <div className="relative">
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 relative"
                  >
                    <HiOutlineBell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-lg z-50">
                      <div className="flex items-center justify-between p-3 border-b dark:border-gray-700">
                        <span className="font-semibold text-sm">Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllRead} className="text-xs text-indigo-600 hover:underline">Mark all read</button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="p-4 text-sm text-gray-400 text-center">No notifications</p>
                        ) : (
                          notifications.slice(0, 10).map(n => (
                            <Link
                              key={n.id}
                              to={n.link || '#'}
                              onClick={() => setNotifOpen(false)}
                              className={`block p-3 border-b dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${!n.read ? 'bg-indigo-50 dark:bg-gray-700' : ''}`}
                            >
                              <p className="text-gray-700 dark:text-gray-300">{n.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <Link to="/dashboard" className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-indigo-600">
                  <HiOutlineUser className="w-5 h-5" />
                  <span>{user.name}</span>
                </Link>
                <button onClick={handleLogout} className="btn-secondary text-sm flex items-center gap-1">
                  <HiOutlineLogout className="w-4 h-4" /> Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm flex items-center gap-1">
                <HiOutlineLogin className="w-4 h-4" /> Sign In
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button onClick={toggleTheme} className="p-2 text-gray-600 dark:text-gray-300">
              {dark ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
            </button>
            <button className="p-2" onClick={() => setOpen(!open)}>
              {open ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t bg-white dark:bg-gray-800 dark:border-gray-700 px-4 py-4 space-y-3">
          <Link to="/" onClick={() => setOpen(false)} className="block text-gray-600 dark:text-gray-300 hover:text-indigo-600">Home</Link>
          <Link to="/listings" onClick={() => setOpen(false)} className="block text-gray-600 dark:text-gray-300 hover:text-indigo-600">Listings</Link>
          <Link to="/agents" onClick={() => setOpen(false)} className="block text-gray-600 dark:text-gray-300 hover:text-indigo-600">Agents</Link>
          <Link to="/blog" onClick={() => setOpen(false)} className="block text-gray-600 dark:text-gray-300 hover:text-indigo-600">Resources</Link>
          <Link to="/contact" onClick={() => setOpen(false)} className="block text-gray-600 dark:text-gray-300 hover:text-indigo-600">Contact</Link>
          {user && (
            <Link to="/dashboard" onClick={() => setOpen(false)} className="block text-gray-600 dark:text-gray-300 hover:text-indigo-600">Favorites</Link>
          )}
          {(user?.role === 'agent' || user?.role === 'admin') && (
            <Link to="/agent-dashboard" onClick={() => setOpen(false)} className="block text-gray-600 dark:text-gray-300 hover:text-indigo-600">My Listings</Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" onClick={() => setOpen(false)} className="block text-gray-600 dark:text-gray-300 hover:text-indigo-600">Management</Link>
          )}
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setOpen(false)} className="block text-gray-600 dark:text-gray-300">{user.name}</Link>
              <button onClick={() => { handleLogout(); setOpen(false); }} className="btn-secondary w-full text-sm">Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)} className="btn-primary block text-center text-sm">Sign In</Link>
          )}
        </div>
      )}
    </nav>
  );
}
