
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Tickets from './pages/Tickets';
import TicketDetail from './pages/TicketDetail';
import AdminTickets from './pages/AdminTickets';
import Donations from './pages/Donations';
import Events from './pages/Events';
import Rules from './pages/Rules';
import Community from './pages/Community';
import Future from './pages/Future';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import KitClaims from './pages/KitClaims';
import OdinAssistant from './components/OdinAssistant';
import SteamIDEnforcer from './components/SteamIDEnforcer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ScrollToTop from './components/ScrollToTop';
import Leaderboard from './pages/Leaderboard';

const App: React.FC = () => {
  return (
    <HashRouter>
      <ScrollToTop />
      <SteamIDEnforcer />
      <div className="flex flex-col min-h-screen selection:bg-primary selection:text-black">
        <Navbar />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/join" element={<Auth />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/kit-claims" element={<AdminRoute><KitClaims /></AdminRoute>} />
            <Route path="/donations" element={<ProtectedRoute><Donations /></ProtectedRoute>} />
            <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
            <Route path="/rules" element={<ProtectedRoute><Rules /></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
            <Route path="/calendar" element={<AdminRoute><Future /></AdminRoute>} />
            <Route path="/leaderboard" element={<AdminRoute><Leaderboard /></AdminRoute>} />

            {/* Ticket Routes */}
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/tickets/:id" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />
            <Route path="/admin/tickets" element={<AdminRoute><AdminTickets /></AdminRoute>} />
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
