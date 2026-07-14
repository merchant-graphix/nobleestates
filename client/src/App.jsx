import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CompareProvider } from './context/CompareContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import CompareBar from './components/CompareBar';
import Home from './pages/Home';
import Listings from './pages/Listings';
import PropertyDetail from './pages/PropertyDetail';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Agents from './pages/Agents';
import AgentProfile from './pages/AgentProfile';
import AgentDashboard from './pages/AgentDashboard';
import Compare from './pages/Compare';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import VerifyEmail from './pages/VerifyEmail';
import Contact from './pages/Contact';
import About from './pages/About';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <CompareProvider>
            <div className="min-h-screen flex flex-col dark:bg-gray-900 dark:text-gray-100">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/listings" element={<Listings />} />
                  <Route path="/listings/:id" element={<PropertyDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Login />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ForgotPassword />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/agents" element={<Agents />} />
                  <Route path="/agents/:id" element={<AgentProfile />} />
                  <Route path="/compare" element={<Compare />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/about" element={<About />} />
                  <Route
                    path="/dashboard"
                    element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
                  />
                  <Route
                    path="/agent-dashboard"
                    element={<ProtectedRoute><AgentDashboard /></ProtectedRoute>}
                  />
                  <Route
                    path="/admin"
                    element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>}
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
              <CompareBar />
            </div>
          </CompareProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
