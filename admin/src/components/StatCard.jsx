import React from 'react';

export default function StatCard({ label, value, trend, trendUp, icon, color = 'cyan' }) {
  return (
    <div className={`stat-card ${color}`}>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {trend && (
          <div className={`stat-trend ${trendUp ? 'trend-up' : 'trend-down'}`}>
            <span>{trendUp ? '↑' : '↓'}</span>
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div className="stat-icon-wrapper">
        {icon}
      </div>
    </div>
  );
}
