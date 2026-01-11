
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Donations from './pages/Donations';
import Events from './pages/Events';
import Rules from './pages/Rules';
import Community from './pages/Community';
import Future from './pages/Future';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import OdinAssistant from './components/OdinAssistant';
import SteamIDEnforcer from './components/SteamIDEnforcer';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <HashRouter>
      <SteamIDEnforcer />
      <div className="flex flex-col min-h-screen selection:bg-primary selection:text-black">
        <Navbar />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/join" element={<Auth />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/donations" element={<ProtectedRoute><Donations /></ProtectedRoute>} />
            <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
            <Route path="/rules" element={<ProtectedRoute><Rules /></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><Future /></ProtectedRoute>} />
          </Routes>
        </main>

        <div className="relative z-50">
          <Footer />
        </div>

        {/* Gemini-powered Viking Assistant */}
        <OdinAssistant />
      </div>
    </HashRouter>
  );
};

export default App;
