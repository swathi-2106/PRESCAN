import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Target, Search } from 'lucide-react';

const ScanForm = () => {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const navigate = useNavigate();

  const handleScan = async (e) => {
    e.preventDefault();
    if (!url) {
      toast.error('Please enter a target URL');
      return;
    }
    
    // Basic validation
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      toast.error('URL must start with http:// or https://');
      return;
    }

    setIsScanning(true);
    const loadingToast = toast.loading('Initiating PRESCAN engine...');

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/scans/start`, { url: url });
      toast.success('Scan completed successfully!', { id: loadingToast });
      navigate(`/report/${res.data.id || res.data.scanId}`);
    } catch (err) {
      console.error(err);
      toast.error('Scan failed. Ensure backend is running.', { id: loadingToast });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">New Security Scan</h1>
        <p className="text-text-muted">Enter a target URL or local endpoint to begin the vulnerability assessment.</p>
      </div>

      <div className="glass-panel p-8 rounded-2xl relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
        
        <form onSubmit={handleScan} className="space-y-6 relative z-10">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Target Application URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com or http://localhost:3000"
              className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              disabled={isScanning}
            />
          </div>

          <div className="bg-surface/50 p-4 rounded-xl border border-white/5 text-sm text-text-muted">
            <h4 className="text-white font-medium mb-2">Notice:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Only scan endpoints you are authorized to test.</li>
              <li>Scan duration depends on target responsiveness.</li>
              <li>Scans perform non-intrusive pre-deployment checks.</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={isScanning}
            className={`w-full py-3 px-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${
              isScanning 
                ? 'bg-primary/50 cursor-not-allowed' 
                : 'bg-primary hover:bg-primary/80 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]'
            }`}
          >
            {isScanning ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Scanning Target...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Start Security Scan
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ScanForm;
