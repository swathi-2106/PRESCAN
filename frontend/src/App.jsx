import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ScanForm from './pages/ScanForm';
import ScanHistory from './pages/ScanHistory';
import ReportDetail from './pages/ReportDetail';

function App() {
  return (
    <Router>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <Toaster position="top-right" toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155'
            }
          }} />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/scan" element={<ScanForm />} />
            <Route path="/history" element={<ScanHistory />} />
            <Route path="/report/:id" element={<ReportDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
