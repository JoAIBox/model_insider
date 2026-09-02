import React, { useState } from 'react';

const concepts = [
  { term: 'Token', label: 'a text unit', description: 'The basic unit a model processes. A character, a word, or part of a word can be one token.', analogy: 'Like cutting an article into building blocks.' },
  { term: 'Parameter', label: 'a learned adjustment', description: 'A number adjusted during training that stores language, knowledge, and reasoning patterns.', analogy: 'Like countless adjustable bookmarks and indexes in a library.' },
  { term: 'Activated parameters', label: 'the part working now', description: 'Parameters actually used for one token, which is different from the model’s total capacity.', analogy: 'A large hospital calls only the relevant departments for one patient.' },
  { term: 'MoE', label: 'Mixture of Experts', description: 'A model is divided into many experts, and a router decides which experts process each token.', analogy: 'Hospital triage, rather than asking every doctor to consult.' },
  { term: 'Context', label: 'what the model can reference now', description: 'The input range visible when the model generates an answer. 1M means up to one million tokens.', analogy: 'A very large desk that can hold many pages.' },
  { term: 'Training', label: 'learning from examples', description: 'The model repeatedly predicts and adjusts parameters from its errors. Pre-training builds foundations; post-training improves task behavior.', analogy: 'Read textbooks first, then solve problems and correct mistakes.' },
];

export const ConceptGlossary: React.FC = () => {
  const [openTerm, setOpenTerm] = useState<string | null>(null);
  return (
    <section className="card glossary" aria-labelledby="glossary-title">
      <div className="card-title" id="glossary-title">📖 Six terms to know first</div>
      <p className="flow-intro">You do not need prior AI vocabulary. Select a term to see its role in Kimi K3.</p>
      <div className="glossary-grid">
        {concepts.map((concept) => {
          const isOpen = openTerm === concept.term;
          return (
            <button key={concept.term} className={`glossary-item ${isOpen ? 'active' : ''}`} onClick={() => setOpenTerm(isOpen ? null : concept.term)} aria-expanded={isOpen}>
              <span className="glossary-term">{concept.term}</span>
              <strong>{concept.label}</strong>
              {isOpen && <span className="glossary-description">{concept.description}<br /><em>💡 {concept.analogy}</em></span>}
            </button>
          );
        })}
      </div>
    </section>
  );
};
