
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layers } from 'lucide-react';

import Home from './components/Home';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import ContactSupport from './components/ContactSupport';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
        
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary-500/20 transition-transform group-hover:scale-105">
                <Layers size={18} />
              </div>
              <span className="text-xl font-bold tracking-tight">PDFDrop</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600 dark:text-slate-300">
              <a href="/#how-it-works" className="hover:text-primary-600 transition-colors">How it works</a>
              <a href="/#faq" className="hover:text-primary-600 transition-colors">FAQ</a>
              <Link to="/contact" className="hover:text-primary-600 transition-colors">Support</Link>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/contact" element={<ContactSupport />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-slate-950 py-16 px-4 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0 text-sm text-slate-500">
            <div className="flex flex-col items-center md:items-start space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-primary-600 rounded flex items-center justify-center text-white">
                  <Layers size={14} />
                </div>
                <span className="font-bold text-slate-900 dark:text-white text-lg">PDFDrop</span>
              </div>
              <p className="max-w-xs text-center md:text-left leading-relaxed">
                The privacy-first PDF utility for students and professionals. Built for speed and reliability.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
              <Link to="/privacy" className="hover:text-primary-600 transition-colors font-medium">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-primary-600 transition-colors font-medium">Terms of Service</Link>
              <Link to="/contact" className="hover:text-primary-600 transition-colors font-medium">Contact Support</Link>
            </div>
            <div className="text-center md:text-right">
              <p className="font-bold text-slate-900 dark:text-white mb-1">© {new Date().getFullYear()} PDFDrop</p>
              <p>100% Client-Side Processing</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
