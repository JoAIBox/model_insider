import React, { useState } from 'react';

export const CaseStudies: React.FC = () => {
  const [activeCase, setActiveCase] = useState<'kernel' | 'compiler' | 'chip' | 'research'>('kernel');

  return (
    <div className="tab-panel">
      <div className="badge">Chapter 7 - Case Studies</div>
      <h2 style={{ color: '#FFFFFF', marginTop: '10px' }}>Kimi-K3 Industrial Engineering & Academic Research Cases</h2>
      <p style={{ color: '#94A3B8', fontSize: '1.08rem', marginBottom: '20px' }}>
        Kimi-K3's ultimate capability is demonstrated in tackling high-complexity industrial engineering tasks: from writing GPU compilers and executing silicon verification to drafting complex research codebases.
      </p>

      {/* Selector */}
      <div className="control-panel" style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          className={`btn ${activeCase === 'kernel' ? 'active' : ''}`}
          onClick={() => setActiveCase('kernel')}
        >
          7.1 GPU Operator Performance & Flame Chart
        </button>
        <button 
          className={`btn ${activeCase === 'compiler' ? 'active' : ''}`}
          onClick={() => setActiveCase('compiler')}
        >
          7.2 MiniTriton Compiler & Roofline Limit
        </button>
        <button 
          className={`btn ${activeCase === 'chip' ? 'active' : ''}`}
          onClick={() => setActiveCase('chip')}
        >
          7.3 nano-KPU Neural Chip Specification
        </button>
        <button 
          className={`btn ${activeCase === 'research' ? 'active' : ''}`}
          onClick={() => setActiveCase('research')}
        >
          7.4 Interdisciplinary Scientific Discovery (I-Love-Q)
        </button>
      </div>

      <div className="grid-2" style={{ gap: '20px' }}>
        
        {/* Left Interactive panel */}
        <div className="card">
          {activeCase === 'kernel' && (
            <div>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '15px' }}>🚀 AttnRes Fused Operator Flame Chart (Chrome Tracing Time Analysis)</h3>
              
              {/* Flame graph timelines */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', background: '#02040a', padding: '15px', borderRadius: '8px' }}>
                {/* Before Optimization */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', color: '#94A3B8', marginBottom: '4px' }}>
                    <span>Before Optimization (Naive Block-Attention: 283.6ms)</span>
                    <span style={{ color: '#FF5555' }}>Serial memory bandwidth bottleneck</span>
                  </div>
                  
                  {/* Mock sequential flame blocks */}
                  <div style={{ display: 'flex', gap: '2px', height: '24px', borderRadius: '4px', overflow: 'hidden', fontSize: '8px', color: '#FFF', fontWeight: 'bold' }}>
                    <div style={{ width: '40%', background: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>KV Fetch (113ms)</div>
                    <div style={{ width: '30%', background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>QK MM (85ms)</div>
                    <div style={{ width: '15%', background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Softmax</div>
                    <div style={{ width: '15%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>PV Sync</div>
                  </div>
                </div>

                {/* After Optimization */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', color: '#E2E8F0', marginBottom: '4px' }}>
                    <span>After Optimization (Fused Sequence-Parallel AttnRes: 114.4ms)</span>
                    <span style={{ color: '#10B981', fontWeight: 'bold' }}>Register-level pipeline overlapping</span>
                  </div>
                  
                  {/* Fused overlapped flame blocks */}
                  <div style={{ display: 'flex', gap: '2px', height: '24px', borderRadius: '4px', overflow: 'hidden', fontSize: '8px', color: '#FFF', fontWeight: 'bold' }}>
                    <div style={{ width: '50%', background: '#10B981', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: '4px' }}>
                      <span>Fused Loop (78ms)</span>
                      <span style={{ fontSize: '6px', color: '#A7F3D0' }}>[KV Fetch + QK overlap]</span>
                    </div>
                    <div style={{ width: '30%', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Softmax Fused</div>
                    <div style={{ width: '20%', background: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>PV (22ms)</div>
                  </div>
                </div>
              </div>

              {/* Figure 14 Trajectory Chart (Item 28) */}
              <div style={{ marginTop: '20px', borderTop: '1px solid #1E293B', paddingTop: '15px' }}>
                <h4 style={{ color: '#FFFFFF', fontSize: '0.9rem', marginBottom: '8px' }}>📈 Figure 14: Model Optimization Speedup (%) over 24 Hours</h4>
                <div style={{ background: '#02040a', borderRadius: '6px', padding: '10px', display: 'flex', justifyContent: 'center' }}>
                  <svg width="100%" height="130" viewBox="0 0 400 130" style={{ maxWidth: '400px' }}>
                    <line x1="40" y1="100" x2="380" y2="100" stroke="#475569" strokeWidth="1.5" />
                    <line x1="40" y1="15" x2="40" y2="100" stroke="#475569" strokeWidth="1.5" />
                    
                    <text x="210" y="122" fill="#94A3B8" fontSize="13" textAnchor="middle">24-Hour Budget Timeline (Time, Hours)</text>
                    <text x="12" y="55" fill="#94A3B8" fontSize="13" transform="rotate(-90 12 55)" textAnchor="middle">Speedup (%)</text>
                    
                    <line x1="40" y1="58" x2="380" y2="58" stroke="#1E293B" strokeDasharray="3" />
                    <line x1="40" y1="15" x2="380" y2="15" stroke="#1E293B" strokeDasharray="3" />
                    
                    <text x="35" y="103" fill="#94A3B8" fontSize="12" textAnchor="end">0%</text>
                    <text x="35" y="61" fill="#94A3B8" fontSize="12" textAnchor="end">30%</text>
                    <text x="35" y="18" fill="#94A3B8" fontSize="12" textAnchor="end">60%</text>

                    {/* Curves */}
                    <path d="M 40 100 Q 150 65 280 32 T 380 15.5" fill="none" stroke="#10B981" strokeWidth="2.5" />
                    <circle cx="380" cy="15.5" r="2.5" fill="#10B981" />
                    <text x="385" y="18" fill="#10B981" fontSize="12" fontWeight="bold">K3 (+59.7%)</text>
                    
                    <path d="M 40 100 Q 140 75 260 40 T 380 19.6" fill="none" stroke="#F87171" strokeWidth="1.5" />
                    <text x="385" y="27" fill="#F87171" fontSize="12">Fable5 (+57.1%)</text>
                  </svg>
                </div>
              </div>
            </div>
          )}

          {activeCase === 'compiler' && (
            <div>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '15px' }}>📈 MiniTriton Roofline Performance Bottleneck (NVIDIA L20)</h3>
              
              {/* Roofline Chart */}
              <div style={{ background: '#02040a', borderRadius: '8px', padding: '15px', display: 'flex', justifyContent: 'center' }}>
                <svg width="100%" height="150" viewBox="0 0 320 150" style={{ maxWidth: '320px' }}>
                  {/* Axis */}
                  <line x1="30" y1="120" x2="300" y2="120" stroke="#475569" strokeWidth="1" />
                  <line x1="30" y1="20" x2="30" y2="120" stroke="#475569" strokeWidth="1" />
                  
                  <text x="165" y="142" fill="#94A3B8" fontSize="13" textAnchor="middle">Arithmetic Intensity (Flops/Byte)</text>
                  <text x="10" y="70" fill="#94A3B8" fontSize="13" transform="rotate(-90 10 70)" textAnchor="middle">Performance (TFLOPS)</text>

                  {/* Slanted bandwidth limit line */}
                  <line x1="30" y1="120" x2="160" y2="40" stroke="#475569" strokeWidth="1.5" />
                  {/* Flat peak limit line */}
                  <line x1="160" y1="40" x2="300" y2="40" stroke="#475569" strokeWidth="1.5" />
                  <text x="220" y="32" fill="#94A3B8" fontSize="12">L20 Peak Compute Peak (59 TFLOPS)</text>

                  {/* Scatter points */}
                  {/* MiniTriton GEMM (approximately 90% of the measured roof reference) */}
                  <circle cx="160" cy="45" r="4.5" fill="#10B981" />
                  <text x="170" y="48" fill="#10B981" fontSize="12" fontWeight="bold">MiniTriton GEMM (≈90% measured roof)</text>

                  {/* Standard Triton Template */}
                  <circle cx="100" cy="78" r="4" fill="#EF4444" />
                  <text x="108" y="80" fill="#EF4444" fontSize="12">Standard Triton Template</text>

                  {/* KDA Forward Operator */}
                  <circle cx="80" cy="90" r="4" fill="#38BDF8" />
                  <text x="88" y="92" fill="#38BDF8" fontSize="12">KDA Forward (Bandwidth Bound)</text>
                </svg>
              </div>

              <p style={{ color: '#94A3B8', fontSize: '1.02rem', marginTop: '12px', lineHeight: '1.4' }}>
                💡 <b>Performance & Roofline Analysis (Item 29):</b> On NVIDIA L20, the report presents MiniTriton as approaching approximately <b>90% of the measured machine roof</b> for the tested Tensor Core matrix multiplies; this is not the same as claiming full hardware saturation or a universal 90% cuBLAS result. The generated KDA forward kernels are significantly faster than standard Triton templates. A GPT model trained using MiniTriton converges to a loss matching PyTorch native operators within tiny rounding limits.
              </p>
            </div>
          )}

          {activeCase === 'chip' && (
            <div>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '15px' }}>⚡ nano-KPU Neural Network Inference Chip Specs</h3>
              <div style={{ background: '#090D16', padding: '15px', borderRadius: '6px', fontSize: '1.02rem', lineHeight: '1.6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1E293B', paddingBottom: '4px' }}>
                  <span style={{ color: '#94A3B8' }}>Target Architecture</span>
                  <span style={{ color: '#FFF' }}>KDA-MLA & NoPE-MLA Hybrid Hardware Inference</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1E293B', paddingBottom: '4px', paddingTop: '4px' }}>
                  <span style={{ color: '#94A3B8' }}>Synthesized Area Estimate</span>
                  <span style={{ color: '#FFF' }}>4 mm² (Nangate45 Cell Library)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1E293B', paddingBottom: '4px', paddingTop: '4px' }}>
                  <span style={{ color: '#94A3B8' }}>Operating Frequency</span>
                  <span style={{ color: '#FFF' }}>100 MHz (Timing Closed)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1E293B', paddingBottom: '4px', paddingTop: '4px' }}>
                  <span style={{ color: '#94A3B8' }}>Decoding Throughput (RTL Simulated)</span>
                  <span style={{ color: '#10B981', fontWeight: 'bold' }}>8,700+ tokens / s</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1E293B', paddingBottom: '4px', paddingTop: '4px' }}>
                  <span style={{ color: '#94A3B8' }}>Integrated standard-cell count</span>
                  <span style={{ color: '#FFF' }}>1.46 M standard cells</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
                  <span style={{ color: '#94A3B8' }}>On-chip SRAM Capacity</span>
                  <span style={{ color: '#FFF' }}>0.277 MiB (integrated INT4 MAC with fused dequantization)</span>
                </div>
              </div>
            </div>
          )}

          {activeCase === 'research' && (
            <div>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '15px' }}>🌌 I-Love-Q Astrophysics Universal Relation Reconstruction</h3>
              <p style={{ color: '#94A3B8', fontSize: '1.02rem', lineHeight: '1.5', marginBottom: '10px' }}>
                In gravitational wave and compact object studies, a neutron star's <b>Moment of Inertia (I), Love Number (Tidal deformability), and Quadrupole Moment (Q)</b> exhibit universal relations independent of the Equation of State (EOS).
              </p>
              <div className="formula-box" style={{ fontSize: '1.02rem', lineHeight: '1.6' }}>
                • <b>Literature Extraction & Verification:</b> Read and parsed 20+ physics papers, identifying and fixing logical conflicts in formulas.<br />
                • <b>Large-Scale Numerical Modeling:</b> Wrote 3,000+ lines of Python differential solver code, simulating 300+ Equations of State to reconstruct highly accurate universal curves.<br />
                • <b>Rapid Execution:</b> This multi-disciplinary empirical pipeline completed in just <b>2 hours</b> (typically requiring 1 to 2 weeks for a human researcher).
              </div>
            </div>
          )}
        </div>

        {/* Right Details Panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ color: '#FFFFFF', fontSize: '1.1rem', marginBottom: '10px' }}>Case Highlights & Retrospective</h3>
            
            {activeCase === 'kernel' && (
              <div style={{ fontSize: '1.02rem', color: '#94A3B8', lineHeight: '1.6' }}>
                <p style={{ marginBottom: '10px' }}>
                  • <b>AttnRes Kernel Optimization:</b> Kimi-K3's Attention Residuals involve cross-layer state aggregation, which is highly memory-bound. The model employs Sequence Parallelism to eliminate redundant memory traffic, reducing Hopper latency by <b>60%</b>.
                </p>
                <p>
                  • <b>KDA Forget Operator Rewrite:</b> The forward parallel state update for KDA is tuned at the CUDA Tile level, reducing stride synchronization across registers and shared memory, slashing KDA latency by <b>73.6%</b>.
                </p>
              </div>
            )}

            {activeCase === 'compiler' && (
              <div style={{ fontSize: '1.02rem', color: '#94A3B8', lineHeight: '1.6' }}>
                <p style={{ marginBottom: '10px' }}>
                  • <b>End-to-End Codebases:</b> Unlike legacy assistants that only output isolated CUDA kernels, Kimi-K3 writes <b>complete systems including compilers, MLIR optimization passes, and PTX generation pipelines</b>.
                </p>
                <p>
                  • <b>Strict Numerical Precision:</b> Automatically compares FP32 kernel values against FP64 reference ground truth during development, mathematically verifying automatic differentiation gradients.
                </p>
              </div>
            )}

            {activeCase === 'chip' && (
              <div style={{ fontSize: '1.02rem', color: '#94A3B8', lineHeight: '1.6' }}>
                <p style={{ marginBottom: '10px' }}>
                  • <b>48-Hour RTL Design Prototype:</b> In a 48-hour autonomous design run, the prototype mapped from schematic descriptions to the Nangate45 library and RTL-simulated an implementation containing 1.46M standard cells using open-source EDA tools. This does not mean that a physical chip was taped out.
                </p>
                <p style={{ marginBottom: '10px' }}>
                  • <b>RTL-Simulated Throughput:</b> The prototype reports 8,700+ tokens/s at 100 MHz with 0.277 MiB on-chip SRAM. The report describes an inference-chip prototype, not a fabricated silicon product.
                </p>
              </div>
            )}

            {activeCase === 'research' && (
              <div style={{ fontSize: '1.02rem', color: '#94A3B8', lineHeight: '1.6' }}>
                <p style={{ marginBottom: '10px' }}>
                  • <b>AI ASIC Knowledge Portal:</b> Read 99 historical publications and 87 quarterly reports spanning 42 years of AI ASIC evolution, iterating through 120 self-correction loops to construct a detailed architectural roadmap.
                </p>
                <p style={{ marginBottom: '10px' }}>
                  • <b>GWTC-5 Multi-Agent Analytics:</b> Dispatched 20+ concurrent sub-agents to estimate parameters from gravitational wave waveforms, plotting figures and compiling a comprehensive literature review.
                </p>
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid #1E293B', paddingTop: '10px', marginTop: '15px', color: '#38BDF8', fontSize: '1.02rem' }}>
            🛠️ <b>Evidence boundary:</b> The case-study figures summarize reported experiments and prototypes. They should not be read as evidence of a fabricated nano-KPU chip or as a universal performance guarantee.
          </div>
        </div>

      </div>
    </div>
  );
};
