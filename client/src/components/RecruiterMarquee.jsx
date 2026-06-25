import React, { useEffect, useState } from 'react';
import api from '../lib/api';

export default function RecruiterMarquee() {
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.get('/recruiters')
      .then((r) => active && setLogos(r.data.recruiters || []))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-10 overflow-hidden" data-testid="recruiters-loading">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skel" style={{ width: 120, height: 50, flexShrink: 0 }} />
        ))}
      </div>
    );
  }

  if (logos.length === 0) {
    return <div className="text-sm text-slate-500">No recruiter logos available.</div>;
  }

  const doubled = [...logos, ...logos];

  return (
    <div className="marquee" data-testid="recruiter-marquee">
      <div className="marquee-track">
        {doubled.map((r, i) => (
          <img
            key={`${r.logo}-${i}`}
            src={r.url}
            alt={r.logo}
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ))}
      </div>
    </div>
  );
}
