import React from 'react';

export interface MathRendererProps {
  formula: string;
  color?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ formula, color = '#00F2FE' }) => {
  const lines = formula.split('\n');
  
  const formatSubSupText = (text: string): React.ReactNode => {
    let base = text;
    let sub = '';
    let sup = '';
    
    if (base.includes('^')) {
      const parts = base.split('^');
      base = parts[0];
      sup = parts[1].replace(/[{}]/g, '');
    }
    
    if (base.includes('_')) {
      const parts = base.split('_');
      base = parts[0];
      sub = parts[1].replace(/[{}]/g, '');
    }
    
    if (base.includes('ᵀ')) {
      base = base.replace('ᵀ', '');
      sup = 'T';
    }
    
    return (
      <span>
        {base}
        {sub && <sub style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', verticalAlign: 'sub' }}>{sub}</sub>}
        {sup && <sup style={{ fontSize: '0.9rem', color: '#10B981', verticalAlign: 'super' }}>{sup}</sup>}
      </span>
    );
  };

  const formatLineToken = (token: string): React.ReactNode => {
    if (token.includes('/') && !token.includes('W_q/k')) {
      const fracParts = token.split('/');
      return (
        <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle', margin: '0 4px' }}>
          <span style={{ borderBottom: '1px solid rgba(255,255,255,0.3)', padding: '0 2px', fontSize: '1.15rem' }}>
            {formatLineToken(fracParts[0].replace(/[()]/g, ''))}
          </span>
          <span style={{ padding: '0 2px', fontSize: '1.15rem' }}>
            {formatLineToken(fracParts[1])}
          </span>
        </span>
      );
    }
    
    if (token === '*') return <span style={{ color: '#E2E8F0', padding: '0 2px' }}>·</span>;
    if (token === '⊙') return <span style={{ color: '#FFB000', padding: '0 2px', fontWeight: 'bold' }}>⊙</span>;
    if (token === '=') return <span style={{ color: '#E2E8F0', padding: '0 4px' }}>=</span>;
    
    return formatSubSupText(token);
  };

  const renderLine = (line: string, lineIdx: number) => {
    if (line.trim().startsWith('//')) {
      return (
        <div key={lineIdx} style={{ color: '#64748B', fontStyle: 'italic', fontSize: '1.15rem', margin: '4px 0 2px 0' }}>
          {line}
        </div>
      );
    }
    
    const tokens = line.split(' ');
    return (
      <div key={lineIdx} style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', minHeight: '1.6rem', color }}>
        {tokens.map((t, tIdx) => (
          <span key={tIdx} style={{ marginRight: '4px' }}>{formatLineToken(t)}</span>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: 'rgba(0,0,0,0.35)', padding: '8px 10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.03)', fontSize: '1.15rem', fontFamily: 'Consolas, monospace', overflowX: 'auto', margin: '4px 0 0 0' }}>
      {lines.map((line, idx) => renderLine(line, idx))}
    </div>
  );
};
