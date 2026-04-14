// AdminWeakTopics.jsx
// Admin panel for uploading topic maps and marks CSVs,
// and viewing center weak topics.
//
import { useState } from 'react';
import { Eye } from 'lucide-react';
import CenterWeakTopics from './CenterWeakTopics';

export default function AdminWeakTopics({ centersList = [], selectedTestKey }) {
  const [viewCenterId, setViewCenterId] = useState('');

  // Drop 'ALL' from centers list if it exists
  const validCenters = centersList.filter(c => c !== 'ALL');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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
            Center
          </label>
          <select
            className="input select"
            value={viewCenterId}
            onChange={(e) => setViewCenterId(e.target.value)}
            style={{ marginTop: 4, maxWidth: 240 }}
          >
            <option value="">-- Select Center --</option>
            {validCenters.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {viewCenterId ? (
          <CenterWeakTopics centerId={viewCenterId} activeTestKey={selectedTestKey} />
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
            Select a center above to view its weak topic analysis.
          </div>
        )}
      </div>
    </div>
  );
}
