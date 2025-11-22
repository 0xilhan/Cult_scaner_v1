import React from 'react';

interface VerdictBadgeProps {
  verdict: 'SAFE' | 'CAUTION' | 'DANGER' | 'CULT_LEADER';
}

export const VerdictBadge: React.FC<VerdictBadgeProps> = ({ verdict }) => {
  const styles = {
    SAFE: 'bg-green-900/30 text-green-400 border-green-500',
    CAUTION: 'bg-yellow-900/30 text-yellow-400 border-yellow-500',
    DANGER: 'bg-red-900/30 text-red-500 border-red-500',
    CULT_LEADER: 'bg-neon-purple/20 text-neon-purple border-neon-purple animate-pulse',
  };

  return (
    <span className={`px-3 py-1 rounded-sm border ${styles[verdict]} text-xs font-bold tracking-widest uppercase`}>
      {verdict.replace('_', ' ')}
    </span>
  );
};