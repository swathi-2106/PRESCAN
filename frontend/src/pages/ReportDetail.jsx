import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldAlert, AlertTriangle, CheckCircle, Download, FileJson, ArrowLeft } from 'lucide-react';

const ReportDetail = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('visual'); // 'visual' or 'json'

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/scans/details/${id}`);
        setReport(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  const handleDownload = () => {
    if (!report) return;
    const jsonString = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `prescan_report_${id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!report) {
    return <div className="text-white text-center mt-20">Report not found.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <Link to="/history" className="text-text-muted hover:text-white flex items-center gap-2 text-sm font-medium w-fit transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to History
      </Link>

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Scan Report #{report.id}</h1>
          <p className="text-text-muted font-mono">{report.targetUrl}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setActiveTab('visual')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'visual' ? 'bg-surface text-white border border-white/10' : 'text-text-muted hover:text-white'}`}
          >
            Visual Report
          </button>
          <button 
            onClick={() => setActiveTab('json')}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === 'json' ? 'bg-surface text-white border border-white/10' : 'text-text-muted hover:text-white'}`}
          >
            <FileJson className="w-4 h-4" /> JSON View
          </button>
          <button onClick={handleDownload} className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all">
            <Download className="w-4 h-4" /> Download JSON
          </button>
        </div>
      </div>

      {activeTab === 'visual' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-panel p-6 rounded-xl flex flex-col justify-center items-center text-center">
              <p className="text-sm text-text-muted mb-2">Overall Risk Score</p>
              <h2 className={`text-4xl font-black uppercase ${
                report.overallRiskScore === 'HIGH' ? 'text-danger' :
                report.overallRiskScore === 'MEDIUM' ? 'text-warning' :
                report.overallRiskScore === 'LOW' ? 'text-success' : 'text-primary'
              }`}>{report.overallRiskScore}</h2>
            </div>
            
            <div className="glass-panel p-6 rounded-xl flex items-center justify-between col-span-3">
              <div className="flex-1 text-center border-r border-white/10">
                <ShieldAlert className="w-8 h-8 text-danger mx-auto mb-2" />
                <p className="text-3xl font-bold text-white">{report.highSeverityCount}</p>
                <p className="text-xs text-text-muted uppercase tracking-wider mt-1">High</p>
              </div>
              <div className="flex-1 text-center border-r border-white/10">
                <AlertTriangle className="w-8 h-8 text-warning mx-auto mb-2" />
                <p className="text-3xl font-bold text-white">{report.mediumSeverityCount}</p>
                <p className="text-xs text-text-muted uppercase tracking-wider mt-1">Medium</p>
              </div>
              <div className="flex-1 text-center">
                <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
                <p className="text-3xl font-bold text-white">{report.lowSeverityCount}</p>
                <p className="text-xs text-text-muted uppercase tracking-wider mt-1">Low</p>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold text-white mt-8 mb-4">Detailed Findings</h3>
          <div className="space-y-4">
            {report.findings?.length === 0 ? (
              <div className="glass-panel p-8 text-center rounded-xl text-success flex flex-col items-center">
                <CheckCircle className="w-12 h-12 mb-3" />
                <h4 className="text-xl font-bold mb-1">No vulnerabilities detected!</h4>
                <p className="text-sm">The target application passed all basic security checks.</p>
              </div>
            ) : (
              report.findings?.map((finding, index) => (
                <div key={index} className="glass-panel p-6 rounded-xl border-l-4" style={{ 
                  borderLeftColor: finding.severity === 'HIGH' ? 'var(--color-danger)' : 
                                   finding.severity === 'MEDIUM' ? 'var(--color-warning)' : 'var(--color-success)' 
                }}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-white">{finding.title}</h4>
                      <p className="text-sm text-text-muted font-mono mt-1">Endpoint: {finding.affectedEndpoint}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        finding.severity === 'HIGH' ? 'bg-danger/20 text-danger border border-danger/30' :
                        finding.severity === 'MEDIUM' ? 'bg-warning/20 text-warning border border-warning/30' :
                        'bg-success/20 text-success border border-success/30'
                      }`}>
                      {finding.severity}
                    </span>
                  </div>
                  
                  <div className="space-y-4 text-sm">
                    <div>
                      <strong className="text-white block mb-1">Description</strong>
                      <p className="text-text-muted">{finding.description}</p>
                    </div>
                    <div>
                      <strong className="text-white block mb-1">Evidence</strong>
                      <code className="bg-surface/80 px-3 py-2 rounded text-primary block break-all border border-white/5">{finding.evidence}</code>
                    </div>
                    <div className="bg-surface/50 p-4 rounded-lg border border-white/5">
                      <strong className="text-white block mb-1 flex items-center gap-2">Recommendation 
                        <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-text-muted">Priority: {finding.remediationPriority}</span>
                      </strong>
                      <p className="text-text-muted">{finding.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-xl overflow-hidden relative group">
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(report, null, 2));
              // eslint-disable-next-line no-undef
              toast.success('JSON copied to clipboard');
            }} className="bg-surface hover:bg-white/10 text-white px-3 py-1.5 rounded text-xs font-medium border border-white/10 transition-colors">
              Copy JSON
            </button>
          </div>
          <pre className="p-6 overflow-x-auto text-sm text-primary font-mono max-h-[70vh] overflow-y-auto custom-scrollbar">
            {JSON.stringify(report, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ReportDetail;
