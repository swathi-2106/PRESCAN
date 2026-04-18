import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Clock, ExternalLink } from 'lucide-react';

const ScanHistory = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/scans/history');
        setScans(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Scan History</h1>
          <p className="text-text-muted">Review all past security scans and their findings.</p>
        </div>
        <Link to="/scan" className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          New Scan
        </Link>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface/50 text-text-muted text-sm border-b border-white/10">
                  <th className="px-6 py-4 font-medium">Scan ID</th>
                  <th className="px-6 py-4 font-medium">Target URL</th>
                  <th className="px-6 py-4 font-medium">Date & Time</th>
                  <th className="px-6 py-4 font-medium">Risk Score</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {scans.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-text-muted">
                      No scan history available.
                    </td>
                  </tr>
                )}
                {scans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-text-muted font-mono text-sm">#{scan.id}</td>
                    <td className="px-6 py-4 text-white">{scan.targetUrl}</td>
                    <td className="px-6 py-4 text-text-muted text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {new Date(scan.scanTimestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        scan.overallRiskScore === 'HIGH' ? 'bg-danger/20 text-danger border border-danger/30' :
                        scan.overallRiskScore === 'MEDIUM' ? 'bg-warning/20 text-warning border border-warning/30' :
                        scan.overallRiskScore === 'LOW' ? 'bg-success/20 text-success border border-success/30' :
                        'bg-primary/20 text-primary border border-primary/30'
                      }`}>
                        {scan.overallRiskScore}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/report/${scan.id}`} className="text-primary hover:text-blue-400 font-medium text-sm flex items-center justify-end gap-1">
                        Details <ExternalLink className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanHistory;
