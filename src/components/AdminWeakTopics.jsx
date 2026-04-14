// AdminWeakTopics.jsx
// Admin panel for uploading topic maps and marks CSVs,
// and viewing center weak topics.
//
// Section 1 — Upload Test Data (topic maps + marks per paper)
// Section 2 — View Center Weak Topics

import { useState } from 'react';
import { Upload, CheckCircle2, XCircle, Loader2, Eye } from 'lucide-react';
import { uploadTopicMap, uploadMarks, getCenterWeakTopics } from '../services/weakTopicApi';
import CenterWeakTopics from './CenterWeakTopics';

// List of known center IDs (from the app's data)
// The admin route fetches all profiles — we derive unique center codes from there.
// As a fallback, if no profiles are available we show a text input.
// We fetch centers from the existing API.

const STATUS = {
  IDLE:      'idle',
  UPLOADING: 'uploading',
  DONE:      'done',
  ERROR:     'error',
};

function StatusIcon({ status, error }) {
  if (status === STATUS.UPLOADING) return <Loader2 size={16} className="spin" style={{ color: '#1a4fa0' }} />;
  if (status === STATUS.DONE)      return <CheckCircle2 size={16} style={{ color: '#1a6e3b' }} />;
  if (status === STATUS.ERROR)     return <XCircle size={16} style={{ color: '#c0392b' }} />;
  return null;
}

export default function AdminWeakTopics() {
  const [testId,      setTestId]      = useState('');
  const [paperCount,  setPaperCount]  = useState(2); // 1 or 2

  // Upload statuses: p1Map, p2Map, p1Marks, p2Marks
  const [statusP1Map,   setStatusP1Map]   = useState(STATUS.IDLE);
  const [statusP2Map,   setStatusP2Map]   = useState(STATUS.IDLE);
  const [statusP1Marks, setStatusP1Marks] = useState(STATUS.IDLE);
  const [statusP2Marks, setStatusP2Marks] = useState(STATUS.IDLE);
  const [errorP1Map,    setErrorP1Map]    = useState('');
  const [errorP2Map,    setErrorP2Map]    = useState('');
  const [errorP1Marks,  setErrorP1Marks]  = useState('');
  const [errorP2Marks,  setErrorP2Marks]  = useState('');

  // Section 2
  const [viewCenterId,  setViewCenterId]  = useState('');

  const isAllDone = () => {
    const p1MapDone   = statusP1Map   === STATUS.DONE;
    const p1MarksDone = statusP1Marks === STATUS.DONE;
    if (paperCount === 1) return p1MapDone && p1MarksDone;
    const p2MapDone   = statusP2Map   === STATUS.DONE;
    const p2MarksDone = statusP2Marks === STATUS.DONE;
    return p1MapDone && p2MapDone && p1MarksDone && p2MarksDone;
  };

  const disabled = !testId.trim();

  const handleFileUpload = async (file, uploadFn, paper, setStatus, setError) => {
    if (!file) return;
    setStatus(STATUS.UPLOADING);
    setError('');
    try {
      const formData = new FormData();
      formData.append('testId',      testId.trim());
      formData.append('paper',       paper);
      formData.append('paperCount',  String(paperCount));
      formData.append('file',        file);
      await uploadFn(formData);
      setStatus(STATUS.DONE);
    } catch (e) {
      setStatus(STATUS.ERROR);
      setError(e.message || 'Upload failed');
    }
  };

  const UploadRow = ({ label, paper, uploadFn, status, setStatus, error, setError }) => (
    <div style={{
      display:       'flex',
      alignItems:    'center',
      gap:           12,
      padding:       '12px 14px',
      borderRadius:  8,
      background:    status === STATUS.DONE ? '#f0fdf4' : status === STATUS.ERROR ? '#fef2f2' : 'var(--gray-50)',
      border:        `1px solid ${status === STATUS.DONE ? '#bbf7d0' : status === STATUS.ERROR ? '#fecaca' : 'var(--gray-200)'}`,
      marginBottom:  10,
    }}>
      {/* Status icon */}
      <div style={{ flexShrink: 0, width: 20, textAlign: 'center' }}>
        <StatusIcon status={status} error={error} />
      </div>

      {/* Label */}
      <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--gray-700)' }}>
        {label}
        {error && (
          <div style={{ fontSize: 11, fontWeight: 400, color: '#c0392b', marginTop: 2 }}>
            {error}
          </div>
        )}
      </div>

      {/* File input */}
      <label style={{
        display:      'inline-flex',
        alignItems:   'center',
        gap:          6,
        padding:      '6px 14px',
        borderRadius: 6,
        border:       '1px solid var(--gray-300)',
        background:   disabled ? 'var(--gray-100)' : '#fff',
        color:        disabled ? 'var(--gray-400)' : 'var(--gray-700)',
        fontSize:     13,
        fontWeight:   600,
        cursor:       disabled ? 'not-allowed' : 'pointer',
        transition:   'all 0.15s',
      }}>
        <Upload size={13} />
        Choose CSV
        <input
          type="file"
          accept=".csv"
          disabled={disabled}
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file, uploadFn, paper, setStatus, setError);
            // Reset input so same file can be reselected
            e.target.value = '';
          }}
        />
      </label>
    </div>
  );

  // Step numbers adjust based on paperCount
  const marksStep1 = paperCount === 1 ? 2 : 3;
  const marksStep2 = 4;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── SECTION 1: Upload Test Data ─────────────────────────────────── */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{ padding: '8px', borderRadius: 8, background: '#e8f0fc', flexShrink: 0 }}>
            <Upload size={18} color="#1a4fa0" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Upload Test Data</div>
            <div style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 2 }}>
              Upload topic maps and marks CSVs to compute weak topics
            </div>
          </div>
        </div>

        {/* Test name + paper count */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 20 }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label className="label" style={{ fontSize: 12, fontWeight: 700 }}>
              Test Name / ID <span style={{ color: '#c0392b' }}>*</span>
            </label>
            <input
              className="input"
              type="text"
              placeholder="e.g. CAT5"
              value={testId}
              onChange={(e) => setTestId(e.target.value)}
              style={{ marginTop: 4 }}
            />
          </div>
          <div style={{ minWidth: 150 }}>
            <label className="label" style={{ fontSize: 12, fontWeight: 700 }}>
              Number of Papers
            </label>
            <select
              className="input select"
              value={paperCount}
              onChange={(e) => setPaperCount(parseInt(e.target.value, 10))}
              style={{ marginTop: 4 }}
            >
              <option value={1}>1 Paper</option>
              <option value={2}>2 Papers</option>
            </select>
          </div>
        </div>

        {disabled && (
          <div style={{
            padding:      '10px 14px',
            borderRadius: 8,
            background:   '#fff8e1',
            border:       '1px solid #fde68a',
            color:        '#92400e',
            fontSize:     13,
            marginBottom: 16,
            fontWeight:   600,
          }}>
            ⚠️ Please enter a Test Name / ID before uploading files.
          </div>
        )}

        {/* Upload rows */}
        <UploadRow
          label="Step 1 — Upload Topic Map CSV for Paper 1"
          paper="paper1"
          uploadFn={uploadTopicMap}
          status={statusP1Map}
          setStatus={setStatusP1Map}
          error={errorP1Map}
          setError={setErrorP1Map}
        />

        {paperCount === 2 && (
          <UploadRow
            label="Step 2 — Upload Topic Map CSV for Paper 2"
            paper="paper2"
            uploadFn={uploadTopicMap}
            status={statusP2Map}
            setStatus={setStatusP2Map}
            error={errorP2Map}
            setError={setErrorP2Map}
          />
        )}

        <UploadRow
          label={`Step ${marksStep1} — Upload Paper 1 Marks Awarded CSV`}
          paper="paper1"
          uploadFn={uploadMarks}
          status={statusP1Marks}
          setStatus={setStatusP1Marks}
          error={errorP1Marks}
          setError={setErrorP1Marks}
        />

        {paperCount === 2 && (
          <UploadRow
            label={`Step ${marksStep2} — Upload Paper 2 Marks Awarded CSV`}
            paper="paper2"
            uploadFn={uploadMarks}
            status={statusP2Marks}
            setStatus={setStatusP2Marks}
            error={errorP2Marks}
            setError={setErrorP2Marks}
          />
        )}

        {/* Success message when all done */}
        {isAllDone() && (
          <div style={{
            marginTop:    16,
            padding:      '12px 16px',
            borderRadius: 8,
            background:   '#f0fdf4',
            border:       '1px solid #bbf7d0',
            color:        '#1a6e3b',
            fontSize:     14,
            fontWeight:   700,
            display:      'flex',
            alignItems:   'center',
            gap:          8,
          }}>
            <CheckCircle2 size={18} />
            ✅ Weak topics computed successfully for <strong>{testId}</strong>
          </div>
        )}

        {/* CSV format hints */}
        <div style={{
          marginTop:  20,
          padding:    '12px 14px',
          borderRadius: 8,
          background: 'var(--gray-50)',
          border:     '1px solid var(--gray-200)',
          fontSize:   12,
          color:      'var(--gray-600)',
        }}>
          <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--gray-700)' }}>Required CSV formats:</div>
          <div style={{ marginBottom: 6 }}>
            <strong>Topic Map CSV:</strong>{' '}
            <code style={{ fontSize: 11, background: '#fff', padding: '1px 5px', borderRadius: 3 }}>
              topic,subject,questions
            </code>
            {' · '}questions separated by pipe (|): e.g. <code>Q7|Q9</code>
          </div>
          <div>
            <strong>Marks CSV:</strong>{' '}
            <code style={{ fontSize: 11, background: '#fff', padding: '1px 5px', borderRadius: 3 }}>
              Location,roll_no,Name,Q1,Q2,...,Q54
            </code>
            {' · '}marks can be positive, 0, or negative
          </div>
        </div>
      </div>

      {/* ── SECTION 2: View Center Weak Topics ─────────────────────────── */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{ padding: '8px', borderRadius: 8, background: '#fdecea', flexShrink: 0 }}>
            <Eye size={18} color="#c0392b" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>View Center Weak Topics</div>
            <div style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 2 }}>
              View computed weak topic analysis for any center
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label className="label" style={{ fontSize: 12, fontWeight: 700 }}>
            Center ID
          </label>
          <input
            className="input"
            type="text"
            placeholder="e.g. KNP, LKO, GAIL"
            value={viewCenterId}
            onChange={(e) => setViewCenterId(e.target.value.trim().toUpperCase())}
            style={{ marginTop: 4, maxWidth: 240 }}
          />
        </div>

        {viewCenterId ? (
          <CenterWeakTopics centerId={viewCenterId} />
        ) : (
          <div style={{
            padding:      24,
            textAlign:    'center',
            color:        'var(--gray-400)',
            fontSize:     13,
            borderRadius: 8,
            background:   'var(--gray-50)',
            border:       '1px dashed var(--gray-200)',
          }}>
            Enter a center ID above to view its weak topic analysis.
          </div>
        )}
      </div>
    </div>
  );
}
