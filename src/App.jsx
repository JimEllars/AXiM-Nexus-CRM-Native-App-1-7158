import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CrmProvider } from './context/CrmContext';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import Dashboard from './pages/Dashboard';
import Pipeline from './pages/Pipeline';
import Directory from './pages/Directory';
import Accounts from './pages/Accounts';
import Account360 from './pages/Account360';
import Customer360 from './pages/Customer360';
import Analytics from './pages/Analytics';
import Workflows from './pages/Workflows';
import Campaigns from './pages/Campaigns';
import OperationalSwarm from './pages/OperationalSwarm';
import './App.css';

function App() {
  return (
    <CrmProvider>
      <Router>
        <div className="flex h-screen bg-slate-100 overflow-hidden font-sans text-slate-900">
          <Sidebar />
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <TopNav />
            <main className="flex-1 overflow-y-auto custom-scrollbar">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/pipeline" element={<Pipeline />} />
                <Route path="/directory" element={<Directory />} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/account/:id" element={<Account360 />} />
                <Route path="/contact/:id" element={<Customer360 />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/campaigns" element={<Campaigns />} />
                <Route path="/swarm" element={<OperationalSwarm />} />
                <Route path="/settings" element={<Workflows />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </CrmProvider>
  );
}

export default App;