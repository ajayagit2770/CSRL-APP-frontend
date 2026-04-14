import { useState } from 'react';
import { Upload, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { uploadTopicMap, uploadMarks } from '../services/weakTopicApi';

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

export default function UploadMarksAwardSheetModal({ onClose }) {
  const [testId,      setTestId]      = useState('');
  const [paperCount,  setPaperCount]  = useState(2); // 1 or 2

  const [statusP1Map,   setStatusP1Map]   = useState(STATUS.IDLE);
  const [statusP2Map,   setStatusP2Map]   = useState(STATUS.IDLE);
  const [statusP1Marks, setStatusP1Marks] = useState(STATUS.IDLE);
  const [statusP2Marks, setStatusP2Marks] = useState(STATUS.IDLE);
  const [errorP1Map,    setErrorP1Map]    = useState('');
  const [errorP2Map,    setErrorP2Map]    = useState('');
  const [errorP1Marks,  setErrorP1Marks]  = useState('');
  const [errorP2Marks,  setErrorP2Marks]  = useState('');

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
      <div style={{ flexShrink: 0, width: 20, textAlign: 'center' }}>
        <StatusIcon status={status} error={error} />
      </div>

      <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--gray-700)' }}>
        {label}
        {error && (
          <div style={{ fontSize: 11, fontWeight: 400, color: '#c0392b', marginTop: 2 }}>
            {error}
          </div>
        )}
      </div>

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
            e.target.value = '';
          }}
        />
      </label>
    </div>
  );

  const marksStep1 = paperCount === 1 ? 2 : 3;
  const marksStep2 = 4;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 700 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Upload size={16} aria-hidden="true" />
            Upload Test Data (For Weak Topics Analysis)
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        
        <div className="modal-body">
          <div style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 20 }}>
            Upload topic maps and marks Award Sheets CSVs to automatically identify centers and compute weak subjects.
          </div>

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
            label={`Step ${marksStep1} — Upload Paper 1 Marks Award Sheet CSV`}
            paper="paper1"
            uploadFn={uploadMarks}
            status={statusP1Marks}
            setStatus={setStatusP1Marks}
            error={errorP1Marks}
            setError={setErrorP1Marks}
          />

          {paperCount === 2 && (
            <UploadRow
              label={`Step ${marksStep2} — Upload Paper 2 Marks Award Sheet CSV`}
              paper="paper2"
              uploadFn={uploadMarks}
              status={statusP2Marks}
              setStatus={setStatusP2Marks}
              error={errorP2Marks}
              setError={setErrorP2Marks}
            />
          )}

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
              <strong>Marks Award Sheet CSV:</strong>{' '}
              <code style={{ fontSize: 11, background: '#fff', padding: '1px 5px', borderRadius: 3 }}>
                centreCode,ROLL_KEY,Name,Q1,Q2,...,Q54
              </code>
              {' · '}marks can be positive, 0, or negative (Will auto detect center from centreCode/Location column).
            </div>
          </div>

        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
