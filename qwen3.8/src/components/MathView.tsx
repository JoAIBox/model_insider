import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    katex?: {
      renderToString: (tex: string, options?: { displayMode?: boolean; throwOnError?: boolean }) => string;
    };
  }
}

// Convert LaTeX string to formatted Unicode representation as fallback
export function formatFallbackMath(tex: string): string {
  if (!tex) return '';
  return tex
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\mathrm\{([^}]+)\}/g, '$1')
    .replace(/\\mathbb\{R\}/g, 'ℝ')
    .replace(/\\mathbb\{([^}]+)\}/g, '$1')
    .replace(/\\quad/g, '  ')
    .replace(/\\qquad/g, '    ')
    .replace(/\\alpha_t/g, 'αₜ')
    .replace(/\\beta_t/g, 'βₜ')
    .replace(/\\delta_t/g, 'δₜ')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\odot/g, ' ⊙ ')
    .replace(/\\otimes/g, ' ⊗ ')
    .replace(/\\times/g, ' × ')
    .replace(/\\sum_\{([^}]+)\}/g, '∑₍$1₎')
    .replace(/\\in/g, ' ∈ ')
    .replace(/\\to/g, ' → ')
    .replace(/\\cdot/g, ' · ')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
    .replace(/_t/g, 'ₜ')
    .replace(/_\{t-1\}/g, 'ₜ₋₁')
    .replace(/_\{t\}\^T/g, 'ₜᵀ')
    .replace(/_\{t\}/g, 'ₜ')
    .replace(/_k/g, 'ₖ')
    .replace(/_v/g, 'ᵥ')
    .replace(/_o/g, 'ₒ')
    .replace(/_g/g, '₉')
    .replace(/_u/g, 'ᵤ')
    .replace(/_d/g, 'd')
    .replace(/\^T/g, 'ᵀ')
    .replace(/\\/g, '');
}

export function MathView({ math, display = false, className = '' }: { math: string; display?: boolean; className?: string }) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (window.katex) {
      try {
        const html = window.katex.renderToString(math, {
          displayMode: display,
          throwOnError: false,
        });
        containerRef.current.innerHTML = html;
        return;
      } catch (e) {
        console.warn('KaTeX render error:', e);
      }
    }

    // Fallback if KaTeX is not loaded or fails
    containerRef.current.textContent = formatFallbackMath(math);
  }, [math, display]);

  return (
    <span
      ref={containerRef}
      className={`math-view ${className}`}
      style={{
        display: display ? 'block' : 'inline-block',
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        color: '#67e8f9',
      }}
    >
      {formatFallbackMath(math)}
    </span>
  );
}
