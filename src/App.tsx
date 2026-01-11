
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
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/donations" element={<Donations />} />
            <Route path="/events" element={<Events />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/community" element={<Community />} />
            <Route path="/calendar" element={<Future />} />
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
