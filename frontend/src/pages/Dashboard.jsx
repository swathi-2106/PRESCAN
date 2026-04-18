/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/static-components */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, high: 0, medium: 0, low: 0 });
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/scans/history');
        const data = res.data;
        setRecentScans(data.slice(0, 5));
        
        let t=0, h=0, m=0, l=0;
        data.forEach(scan => {
          t += scan.totalVulnerabilities || 0;
          h += scan.highSeverityCount || 0;
          m += scan.mediumSeverityCount || 0;
          l += scan.lowSeverityCount || 0;
        });
        setStats({ total: t, high: h, medium: m, low: l });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="glass-panel p-6 rounded-xl flex items-center justify-between">
      <div>
        <h3 className="text-text-muted text-sm font-medium mb-1">{title}</h3>
        <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
      </div>
      <div className={`p-4 rounded-full bg-surface border border-white/5 ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Security Dashboard</h1>
        <p className="text-text-muted">Overview of your application's security posture across all scans.</p>
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Findings" value={stats.total} icon={Activity} colorClass="text-primary" />
            <StatCard title="High Severity" value={stats.high} icon={ShieldAlert} colorClass="text-danger" />
            <StatCard title="Medium Severity" value={stats.medium} icon={AlertTriangle} colorClass="text-warning" />
            <StatCard title="Low Severity" value={stats.low} icon={CheckCircle} colorClass="text-success" />
          </div>

          <div className="glass-panel rounded-xl overflow-hidden mt-8">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Recent Scans</h2>
              <Link to="/history" className="text-primary hover:text-blue-400 text-sm font-medium">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface/50 text-text-muted text-sm border-b border-white/10">
                    <th className="px-6 py-4 font-medium">Target URL</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Risk Score</th>
                    <th className="px-6 py-4 font-medium">Findings</th>
                    <th className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentScans.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-text-muted">No scans found. Start a new scan!</td>
                    </tr>
                  )}
                  {recentScans.map((scan) => (
                    <tr key={scan.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-white">{scan.targetUrl}</td>
                      <td className="px-6 py-4 text-text-muted">{new Date(scan.scanTimestamp).toLocaleString()}</td>
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
                      <td className="px-6 py-4">
                        <div className="flex gap-2 text-xs font-mono">
                          <span className="text-danger">{scan.highSeverityCount}H</span>
                          <span className="text-warning">{scan.mediumSeverityCount}M</span>
                          <span className="text-success">{scan.lowSeverityCount}L</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/report/${scan.id}`} className="text-primary hover:text-blue-400 font-medium text-sm">View Report</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
