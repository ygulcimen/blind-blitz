// src/screens/AdminBugReportsPage.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useNavigate } from 'react-router-dom';

interface BugReport {
  id: string;
  user_id: string | null;
  user_email: string | null;
  title: string;
  category: string;
  severity: string;
  description: string;
  steps_to_reproduce: string;
  expected_behavior: string;
  actual_behavior: string;
  browser: string;
  device: string;
  status: string;
  created_at: string;
}

const AdminBugReportsPage: React.FC = () => {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const [reports, setReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<BugReport | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  useEffect(() => {
    // Check if user is admin (you'll need to set this in the database)
    // For now, we'll just load the data
    loadBugReports();
  }, [statusFilter, severityFilter]);

  const loadBugReports = async () => {
    try {
      let query = supabase
        .from('bug_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (severityFilter !== 'all') {
        query = query.eq('severity', severityFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setReports(data || []);
    } catch (err) {
      console.error('Failed to load bug reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (reportId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bug_reports')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', reportId);

      if (error) throw error;

      // Refresh the list
      loadBugReports();
      setSelectedReport(null);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-900/20';
      case 'high': return 'text-orange-400 bg-orange-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'low': return 'text-green-400 bg-green-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-blue-400 bg-blue-900/20';
      case 'investigating': return 'text-purple-400 bg-purple-900/20';
      case 'in_progress': return 'text-yellow-400 bg-yellow-900/20';
      case 'resolved': return 'text-green-400 bg-green-900/20';
      case 'closed': return 'text-gray-400 bg-gray-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 w-16 h-16 mx-auto rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 blur-xl animate-pulse" />
            <img
              src="/logo.png"
              alt="BlindBlitz"
              className="relative w-16 h-16 mx-auto rounded-lg animate-pulse drop-shadow-2xl"
            />
          </div>
          <p className="text-gray-400">Loading bug reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-8">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            🐛 Bug Reports Dashboard
          </h1>
          <p className="text-gray-400">
            {reports.length} total reports
          </p>
        </div>

        {/* Filters */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="investigating">Investigating</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Severity Filter
            </label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-gray-900/40 border border-gray-700 rounded-2xl p-6 hover:border-gray-600 transition-colors cursor-pointer"
              onClick={() => setSelectedReport(report)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {report.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(report.severity)}`}>
                      {report.severity.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(report.status)}`}>
                      {report.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold text-gray-400 bg-gray-900/20">
                      {report.category}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                    {report.description}
                  </p>
                  <div className="text-xs text-gray-500">
                    {report.user_email || 'Anonymous'} • {new Date(report.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {reports.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">📭</div>
              <p>No bug reports found with the selected filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">{selectedReport.title}</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Status & Severity */}
              <div className="flex gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Change Status
                  </label>
                  <select
                    value={selectedReport.status}
                    onChange={(e) => updateStatus(selectedReport.id, e.target.value)}
                    className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="new">New</option>
                    <option value="investigating">Investigating</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Severity
                  </label>
                  <span className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold ${getSeverityColor(selectedReport.severity)}`}>
                    {selectedReport.severity.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Description</h3>
                <p className="text-gray-400">{selectedReport.description}</p>
              </div>

              {/* Steps to Reproduce */}
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Steps to Reproduce</h3>
                <p className="text-gray-400 whitespace-pre-wrap">{selectedReport.steps_to_reproduce}</p>
              </div>

              {/* Expected vs Actual */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Expected Behavior</h3>
                  <p className="text-gray-400">{selectedReport.expected_behavior}</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Actual Behavior</h3>
                  <p className="text-gray-400">{selectedReport.actual_behavior}</p>
                </div>
              </div>

              {/* Technical Details */}
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Technical Details</h3>
                <div className="bg-gray-800/50 rounded-lg p-4 text-sm text-gray-400 space-y-1">
                  <div><span className="text-gray-500">Browser:</span> {selectedReport.browser}</div>
                  <div><span className="text-gray-500">Device:</span> {selectedReport.device}</div>
                  <div><span className="text-gray-500">Reporter:</span> {selectedReport.user_email || 'Anonymous'}</div>
                  <div><span className="text-gray-500">Reported:</span> {new Date(selectedReport.created_at).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBugReportsPage;
