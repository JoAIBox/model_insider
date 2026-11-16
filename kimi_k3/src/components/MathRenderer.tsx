import React from 'react';

export interface MathRendererProps {
  formula: string;
  color?: string;
}

const GREEK_MAP: Record<string, string> = {
  '\\alpha': 'α',
  '\\beta': 'β',
  '\\gamma': 'γ',
  '\\delta': 'δ',
  '\\epsilon': 'ε',
  '\\zeta': 'ζ',
  '\\eta': 'η',
  '\\theta': 'θ',
  '\\iota': 'ι',
  '\\kappa': 'κ',
  '\\lambda': 'λ',
  '\\mu': 'μ',
  '\\nu': 'ν',
  '\\xi': 'ξ',
  '\\pi': 'π',
  '\\rho': 'ρ',
  '\\sigma': 'σ',
  '\\tau': 'τ',
  '\\upsilon': 'υ',
  '\\phi': 'φ',
  '\\chi': 'χ',
  '\\psi': 'ψ',
  '\\omega': 'ω',
  '\\Delta': 'Δ',
  '\\Gamma': 'Γ',
  '\\Theta': 'Θ',
  '\\Lambda': 'Λ',
  '\\Sigma': 'Σ',
  '\\Phi': 'Φ',
  '\\Psi': 'Ψ',
  '\\Omega': 'Ω',
};

const SYMBOL_MAP: Record<string, string> = {
  '\\cdot': '·',
  '\\odot': '⊙',
  '\\times': '×',
  '\\in': '∈',
  '\\mathbb{R}': 'ℝ',
  '\\sum': '∑',
  '\\prod': '∏',
  '\\le': '≤',
  '\\ge': '≥',
  '\\ne': '≠',
  '\\approx': '≈',
  '\\leftarrow': '←',
  '\\rightarrow': '→',
  '\\to': '→',
  '\\top': '⊤',
  '\\infty': '∞',
  '\\sqrt': '√',
  '\\pm': '±',
  '\\circ': '∘',
};

export const MathRenderer: React.FC<MathRendererProps> = ({ formula, color = '#38BDF8' }) => {
  const lines = formula.split('\n');

  // Replace common LaTeX control sequences in a string
  const cleanLatexSymbols = (raw: string): string => {
    let s = raw;
    // Replace operators like \operatorname{Softmax} or \text{RMSNorm}
    s = s.replace(/\\operatorname\{([^}]+)\}/g, '$1');
    s = s.replace(/\\text\{([^}]+)\}/g, '$1');
    s = s.replace(/\\mathbf\{([^}]+)\}/g, '$1');
    s = s.replace(/\\mathit\{([^}]+)\}/g, '$1');
    s = s.replace(/\\mathcal\{([^}]+)\}/g, '$1');

    // Replace greek letters
    for (const [cmd, sym] of Object.entries(GREEK_MAP)) {
      s = s.split(cmd).join(sym);
    }

    // Replace math symbols
    for (const [cmd, sym] of Object.entries(SYMBOL_MAP)) {
      s = s.split(cmd).join(sym);
    }

    // Replace transpose shorthand
    s = s.replace(/\^\{\\top\}/g, 'ᵀ');
    s = s.replace(/\^\\top/g, 'ᵀ');
    s = s.replace(/\^T/g, 'ᵀ');

    return s;
  };

  // Render text containing sub/superscripts: e.g. x_{t-1}, W_g, S_t^T, y_l
  const renderSubSupString = (str: string): React.ReactNode => {
    // Regex matching base followed by _sub and/or ^sup
    // E.g. W_{gate}^T, x_t, S_{t-1}
    const tokenRegex = /([A-Za-z0-9α-ωΑ-Ωℝ]+)(?:_\{([^}]+)\}|_([A-Za-z0-9+-]+))?(?:\^\{([^}]+)\}|\^([A-Za-z0-9+-]+))?|([^\sA-Za-z0-9α-ωΑ-Ωℝ]+)|(\s+)/g;
    const elements: React.ReactNode[] = [];
    let match: RegExpExecArray | null;
    let idx = 0;

    while ((match = tokenRegex.exec(str)) !== null) {
      const [, base, subBraced, subSimple, supBraced, supSimple, punctuation, whitespace] = match;

      if (whitespace) {
        elements.push(<span key={idx++}>{whitespace}</span>);
        continue;
      }

      if (punctuation) {
        let opColor = '#E2E8F0';
        if (punctuation === '⊙') opColor = '#FFB000';
        if (punctuation === '·' || punctuation === '*') opColor = '#94A3B8';
        if (punctuation === '=') opColor = '#38BDF8';
        if (punctuation === '←') opColor = '#10B981';
        elements.push(
          <span key={idx++} style={{ color: opColor, margin: '0 2px' }}>
            {punctuation === '*' ? '·' : punctuation}
          </span>
        );
        continue;
      }

      const sub = subBraced || subSimple;
      const sup = supBraced || supSimple;

      elements.push(
        <span key={idx++} style={{ display: 'inline-block', position: 'relative' }}>
          <span>{base}</span>
          {sub && (
            <sub style={{ fontSize: '0.75em', color: 'rgba(255,255,255,0.7)', verticalAlign: '-0.3em', marginLeft: '1px' }}>
              {sub}
            </sub>
          )}
          {sup && (
            <sup style={{ fontSize: '0.75em', color: '#10B981', verticalAlign: '0.45em', marginLeft: '1px', fontWeight: 'bold' }}>
              {sup}
            </sup>
          )}
        </span>
      );
    }

    if (elements.length === 0) {
      return <span>{str}</span>;
    }

    return <>{elements}</>;
  };

  const renderLine = (line: string, lineIdx: number) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('#')) {
      return (
        <div key={lineIdx} style={{ color: '#64748B', fontStyle: 'italic', fontSize: '0.86rem', margin: '3px 0 1px 0' }}>
          {line}
        </div>
      );
    }

    const cleaned = cleanLatexSymbols(line);

    return (
      <div
        key={lineIdx}
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          minHeight: '1.55rem',
          color,
          fontSize: '0.92rem',
          lineHeight: '1.5',
          fontFamily: 'Consolas, "JetBrains Mono", Courier, monospace',
        }}
      >
        {renderSubSupString(cleaned)}
      </div>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        background: 'rgba(2, 4, 10, 0.75)',
        padding: '10px 14px',
        borderRadius: '6px',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        overflowX: 'auto',
        maxWidth: '100%',
        margin: '6px 0 0 0',
      }}
    >
      {lines.map((line, idx) => renderLine(line, idx))}
    </div>
  );
};
