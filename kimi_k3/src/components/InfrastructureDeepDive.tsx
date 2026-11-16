import React, { useState, useMemo } from 'react';
import { calculateMemoryEstimates } from '../utils/toyMath';

export const InfrastructureDeepDive: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'kdaMoe' | 'memory' | 'serving'>('kdaMoe');
  
  // Fleet load balancer states
  const [ep3Enabled, setEp3Enabled] = useState<boolean>(false);

  // KDA dual-pool cache state
  const [contextSlider, setContextSlider] = useState<number>(128); // K tokens

  // Full-model cache calculation across 93 layers (69 KDA + 24 MLA)
  const memEst = useMemo(() => {
    return calculateMemoryEstimates(1, contextSlider * 1024);
  }, [contextSlider]);

  // ViT bubble packing state
  const [vitPacked, setVitPacked] = useState<boolean>(true);

  // VM state machine variables
  const [vmState, setVmState] = useState<'idle' | 'running' | 'paused' | 'checkpointing'>('idle');
  const [logMessages, setLogMessages] = useState<string[]>([
    "[AgentEnv] System initialized. MicroVM snapshot pool ready."
  ]);
  const [showFormula, setShowFormula] = useState<boolean>(false);

  // Deterministic educational profiles for GPU rank utilization
  // Unbalanced: Hot ranks 0, 2, 4, 6 overloaded by token clustering; Cold ranks 1, 3, 5, 7 starved.
  // Balanced (MoonEP3): Hierarchical redistribution equalizes token counts across all 8 ranks.
  const gpuLoads = useMemo(() => {
    const UNBALANCED = [92, 16, 88, 20, 95, 18, 90, 22];
    const BALANCED = [68, 67, 69, 68, 68, 67, 69, 68];
    return ep3Enabled ? BALANCED : UNBALANCED;
  }, [ep3Enabled]);

  const triggerVMAction = (action: 'run' | 'pause' | 'checkpoint' | 'resume') => {
    if (action === 'run') {
      setVmState('running');
      setLogMessages(prev => [
        ...prev,
        "[Simulation Mockup] Starting Firecracker microVM from snapshot...",
        "[Simulation Mockup] Restoring memory state (reference benchmark ~49ms)...",
        "[Simulation Mockup] Agent tool container running in isolated guest OS."
      ]);
    } else if (action === 'pause') {
      setVmState('paused');
      setLogMessages(prev => [
        ...prev,
        "[Simulation Mockup] VM paused. RAM state frozen in memory. Host CPU utilization dropped to 0.0%."
      ]);
    } else if (action === 'checkpoint') {
      setVmState('checkpointing');
      setLogMessages(prev => [
        ...prev,
        "[Simulation Mockup] Tracking dirty memory pages...",
        "[Simulation Mockup] Writing incremental snapshot to NVMe (reference benchmark ~133ms)..."
      ]);
      setTimeout(() => {
        setVmState('idle');
      }, 1000);
    } else if (action === 'resume') {
      setVmState('running');
      setLogMessages(prev => [
        ...prev,
        "[Simulation Mockup] Resuming microVM execution from snapshot (reference benchmark ~49ms)...",
        "[Simulation Mockup] Agent resuming step execution."
      ]);
    }
  };

  return (
    <div className="tab-panel">
      <div className="badge">Chapter 5 - Infrastructure Deep Dive</div>
      <h2 style={{ color: '#FFFFFF', marginTop: '10px' }}>Kimi-K3 Multi-Trillion Parameter Infrastructure System</h2>
      <p style={{ color: '#94A3B8', fontSize: '1.08rem', marginBottom: '20px' }}>
        Kimi-K3 integrates three major system challenges: hybrid KDA attention, multi-trillion sparse MoE pre-training, and million-token agent rollout. It achieves ultra-high hardware utilization through co-designed core operators and scheduling.
      </p>

      {/* Internal Subtabs */}
      <div className="control-panel" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button 
          className={`btn ${activeSubTab === 'kdaMoe' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('kdaMoe')}
        >
          5.1 KDA Parallelism & MoonEP3 Load Balancing
        </button>
        <button 
          className={`btn ${activeSubTab === 'memory' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('memory')}
        >
          5.2 Dual Cache Comparison & Pipeline Bubble Scheduling
        </button>
        <button 
          className={`btn ${activeSubTab === 'serving' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('serving')}
        >
          5.3 AgentEnv VM Lifecycle
        </button>
      </div>

      <div className="grid-2" style={{ gap: '20px' }}>
        
        {/* Left Side: Interactive Widgets & Diagrams */}
        <div className="card">
          
          {activeSubTab === 'kdaMoe' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', margin: 0 }}>🔗 Fleet GPU Cluster MoE Load Distribution (Item 26)</h3>
                <span style={{ fontSize: '0.72rem', background: 'rgba(56, 189, 248, 0.12)', color: '#38BDF8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '2px 8px', borderRadius: '4px' }}>
                  Educational Simulation (Demonstrates rank redistribution; not live data center telemetry)
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontSize: '1.02rem', color: '#94A3B8' }}>Cluster Expert Routing Strategy:</span>
                <button 
                  className={ep3Enabled ? 'btn-primary' : 'btn-secondary'} 
                  onClick={() => setEp3Enabled(!ep3Enabled)}
                  style={{ padding: '4px 12px', fontSize: '1.02rem' }}
                >
                  {ep3Enabled ? 'Disable MoonEP3' : 'Enable MoonEP3 (Perfect Balance)'}
                </button>
              </div>

              {/* 8 GPU cards container */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', background: '#02040a', padding: '15px', borderRadius: '8px' }}>
                {gpuLoads.map((load, idx) => {
                  const isHot = load > 85;
                  const isCold = load < 30;
                  
                  let border = '1px solid rgba(255,255,255,0.06)';
                  let bg = 'rgba(255,255,255,0.02)';
                  if (!ep3Enabled) {
                    if (isHot) {
                      border = '1px solid #EF4444';
                      bg = 'rgba(239, 68, 68, 0.05)';
                    } else if (isCold) {
                      border = '1px solid #475569';
                      bg = 'rgba(71, 85, 105, 0.05)';
                    }
                  } else {
                    border = '1px solid #10B981';
                    bg = 'rgba(16, 185, 129, 0.03)';
                  }

                  return (
                    <div 
                      key={idx}
                      style={{ 
                        border,
                        background: bg,
                        padding: '10px', 
                        borderRadius: '6px', 
                        textAlign: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ fontSize: '1.15rem', color: '#94A3B8' }}>GPU {idx + 1}</div>
                      <div 
                        style={{ 
                          fontSize: '1rem', 
                          fontWeight: 'bold', 
                          color: ep3Enabled ? '#10B981' : isHot ? '#EF4444' : '#94A3B8', 
                          margin: '4px 0' 
                        }}
                      >
                        {load}%
                      </div>
                      <div style={{ fontSize: '0.9rem', color: ep3Enabled ? '#10B981' : isHot ? '#EF4444' : '#64748B' }}>
                        {ep3Enabled ? 'Balanced' : isHot ? '🔥 Overload' : '💤 Starved'}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: '15px', fontSize: '1.02rem', color: '#94A3B8', lineHeight: '1.4' }}>
                💡 <b>MoonEP3 Perfect Balance:</b> Traditional Expert Parallelism (EP) leaves many GPUs idle while others overload. MoonEP3 allocates redundant expert slots to each GPU and eliminates host-device sync blocking, allowing all GPUs to run at near-perfect utilization.
              </div>
            </div>
          )}

          {activeSubTab === 'memory' && (
            <div>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '15px' }}>⚡ KDA Constant Cache vs. Standard KV Memory (Item 73)</h3>
              
              {/* Context slider */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: '6px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.02rem', marginBottom: '5px' }}>
                  <span style={{ color: '#E2E8F0' }}>Current Context Length: <b style={{ color: '#00F2FE' }}>{contextSlider}K Tokens</b></span>
                </div>
                <input 
                  type="range" 
                  min="32" 
                  max="1024" 
                  step="32"
                  value={contextSlider}
                  onChange={(e) => setContextSlider(parseInt(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer', accentColor: '#00F2FE' }}
                />
              </div>

              {/* Cache size visual comparison bars (RAM Stick SVGs) */}
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', background: '#02040a', padding: '20px 15px', borderRadius: '8px' }}>
                <small style={{ flexBasis: '100%', display: 'block', color: '#64748B', lineHeight: '1.45' }}>
                  Unified Cache Comparison: Evaluated across all 93 layers (69 KDA + 24 MLA) using official dimensions (Batch Size = 1, FP16 precision). Standard MHA baseline models all 93 layers with 96 heads (d_h = 128).
                </small>
                
                {/* Standard KV Cache RAM Stick */}
                <div style={{ flex: '1', minWidth: '240px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', color: '#94A3B8', marginBottom: '8px' }}>
                    <span>Standard 93L MHA KV (O(N))</span>
                    <span style={{ color: memEst.standardMhaKvGiB >= 150 ? '#EF4444' : '#FFB000', fontWeight: 'bold' }}>
                      {memEst.standardMhaKvGiB.toFixed(1)} GiB {memEst.standardMhaKvGiB >= 150 && '⚠️ Out of Single HBM!'}
                    </span>
                  </div>
                  
                  {/* SVG RAM Stick */}
                  <svg width="100%" height="70" viewBox="0 0 260 70" style={{ background: '#05070c', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)' }}>
                    {/* RAM Board */}
                    <rect x="10" y="15" width="240" height="35" rx="3" fill="#1e2530" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                    
                    {/* Chip Blocks (8 chips) */}
                    {Array.from({ length: 8 }).map((_, idx) => {
                      const chipX = 20 + idx * 28;
                      const activeChips = Math.min(8, Math.max(1, Math.ceil((memEst.standardMhaKvGiB / 200) * 8)));
                      const isActive = idx < activeChips;
                      const chipColor = memEst.standardMhaKvGiB >= 150 ? '#EF4444' : '#FFB000';
                      
                      return (
                        <rect 
                          key={idx} 
                          x={chipX} 
                          y="22" 
                          width="18" 
                          height="18" 
                          rx="1" 
                          fill={isActive ? chipColor : '#0c0f14'} 
                          stroke="rgba(255,255,255,0.05)"
                          strokeWidth="0.5"
                          style={{ transition: 'fill 0.2s' }}
                        />
                      );
                    })}

                    {/* RAM gold finger pins */}
                    <line x1="15" y1="50" x2="245" y2="50" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="3,2" />
                    <line x1="15" y1="53" x2="245" y2="53" stroke="#F59E0B" strokeWidth="1" strokeDasharray="1,1" />
                  </svg>
                </div>

                {/* KDA + MLA Cache RAM Stick */}
                <div style={{ flex: '1', minWidth: '240px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', color: '#E2E8F0', marginBottom: '8px' }}>
                    <span>K3 Hybrid Cache (69 KDA + 24 MLA)</span>
                    <span style={{ color: '#10B981', fontWeight: 'bold' }}>
                      {memEst.totalK3CacheGiB.toFixed(2)} GiB
                    </span>
                  </div>
                  <small style={{ display: 'block', color: '#94A3B8', marginBottom: '8px', lineHeight: '1.45' }}>
                    69 KDA recurrent states: {memEst.kdaRecurrentStateGiB.toFixed(2)} GiB (O(1) constant); 24 MLA latent KV entries: {memEst.mlaLatentKvGiB.toFixed(2)} GiB (d_c=512).
                  </small>
                  
                  {/* SVG RAM Stick */}
                  <svg width="100%" height="70" viewBox="0 0 260 70" style={{ background: '#05070c', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)' }}>
                    {/* RAM Board - green tinted */}
                    <rect x="10" y="15" width="240" height="35" rx="3" fill="#0D2E27" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1" />
                    
                    {/* Chip Blocks (8 chips, only fraction active) */}
                    {Array.from({ length: 8 }).map((_, idx) => {
                      const chipX = 20 + idx * 28;
                      const activeChips = Math.min(8, Math.max(1, Math.ceil((memEst.totalK3CacheGiB / 200) * 8)));
                      const isActive = idx < activeChips;
                      
                      return (
                        <rect 
                          key={idx} 
                          x={chipX} 
                          y="22" 
                          width="18" 
                          height="18" 
                          rx="1" 
                          fill={isActive ? '#10B981' : '#0c0f14'} 
                          stroke="rgba(255,255,255,0.05)"
                          strokeWidth="0.5"
                        />
                      );
                    })}

                    {/* RAM gold finger pins */}
                    <line x1="15" y1="50" x2="245" y2="50" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="3,2" />
                    <line x1="15" y1="53" x2="245" y2="53" stroke="#F59E0B" strokeWidth="1" strokeDasharray="1,1" />
                  </svg>
                </div>

              </div>
            </div>
          )}

          {activeSubTab === 'serving' && (
            <div>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '15px' }}>🛠️ AgentEnv VM State Machine & Console</h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '15px' }}>
                <button className="btn" onClick={() => triggerVMAction('run')} disabled={vmState === 'running'}>Start VM</button>
                <button className="btn" onClick={() => triggerVMAction('pause')} disabled={vmState !== 'running'}>Suspend VM</button>
                <button className="btn" onClick={() => triggerVMAction('resume')} disabled={vmState !== 'paused'}>Resume VM</button>
                <button className="btn" onClick={() => triggerVMAction('checkpoint')} disabled={vmState !== 'running' && vmState !== 'paused'}>Save Checkpoint</button>
              </div>

              {/* Interactive VM State Machine visualization */}
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', background: '#02040a', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  {/* Node Idle */}
                  <div 
                    style={{
                      border: `2px solid ${vmState === 'idle' ? '#38BDF8' : '#334155'}`,
                      background: vmState === 'idle' ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '1.15rem',
                      color: vmState === 'idle' ? '#FFF' : '#64748B',
                      transition: 'all 0.3s'
                    }}
                  >
                    Idle
                  </div>
                  <span style={{ color: '#334155' }}>→</span>

                  {/* Node Running */}
                  <div 
                    style={{
                      border: `2px solid ${vmState === 'running' ? '#10B981' : '#334155'}`,
                      background: vmState === 'running' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '1.15rem',
                      color: vmState === 'running' ? '#FFF' : '#64748B',
                      transition: 'all 0.3s'
                    }}
                  >
                    Running
                  </div>
                  <span style={{ color: '#334155' }}>→</span>

                  {/* Node Paused */}
                  <div 
                    style={{
                      border: `2px solid ${vmState === 'paused' ? '#FFB000' : '#334155'}`,
                      background: vmState === 'paused' ? 'rgba(255, 176, 0, 0.1)' : 'transparent',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '1.15rem',
                      color: vmState === 'paused' ? '#FFF' : '#64748B',
                      transition: 'all 0.3s'
                    }}
                  >
                    Suspended
                  </div>
                </div>
              </div>

              <div style={{ background: '#090D16', borderRadius: '6px', padding: '10px', height: '100px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '1.15rem', border: '1px solid #1E293B', color: '#38BDF8' }}>
                {logMessages.slice(-4).map((msg, idx) => (
                  <div key={idx} style={{ marginBottom: '2px' }}>{msg}</div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Side: ViT Pipeline bubble & specifications */}
        <div className="card">
          
          {activeSubTab === 'kdaMoe' && (
            <div>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '10px' }}>KDA Operator & MoE Routing Design Principles</h3>
              <p style={{ color: '#94A3B8', fontSize: '1.02rem', lineHeight: '1.5' }}>
                • <b>FlashKDA Fused Operator:</b> Built natively with CUTLASS, merging intermediate operators for Sequence-parallel and Head-parallel execution at the GPU register level to avoid cross-SRAM synchronization.
              </p>
              <p style={{ color: '#94A3B8', fontSize: '1.02rem', lineHeight: '1.5', marginTop: '6px' }}>
                • <b>Projected Input Caching (Item 27):</b> Only projected inputs of draft tokens are cached in memory. Once speculatively accepted, states are immediately reconstructed on-chip and written back to global memory, dramatically reducing memory bandwidth.
              </p>
            </div>
          )}

          {activeSubTab === 'memory' && (
            <div>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '12px' }}>⏰ Pipeline Parallel Bubble ViT Compute Allocation (DEP Evolution)</h3>
              
              {/* ViT bubble packing Gantt timeline chart (Item 74) */}
              <div style={{ background: '#02040a', padding: '12px', borderRadius: '8px', marginBottom: '15px', overflowX: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.15rem', color: '#E2E8F0', fontWeight: 'bold' }}>PP Pipeline Stages Timeline</span>
                  <button 
                    className="btn" 
                    onClick={() => setVitPacked(!vitPacked)}
                    style={{ padding: '2px 8px', fontSize: '1.15rem' }}
                  >
                    {vitPacked ? 'Hide ViT Bubble Filling' : 'Show ViT Bubble Filling'}
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '1.15rem', minWidth: '280px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <div style={{ width: '50px', color: '#94A3B8' }}>GPU 1:</div>
                    <div style={{ width: '40px', background: '#38BDF8', height: '14px', borderRadius: '2px' }} title="LLM Forward" />
                    {vitPacked ? (
                      <div style={{ width: '60px', background: '#EC4899', height: '14px', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: '7px' }}>ViT Fill</div>
                    ) : (
                      <div style={{ width: '60px', border: '1px dashed #475569', height: '14px', borderRadius: '2px' }} />
                    )}
                    <div style={{ width: '40px', background: '#10B981', height: '14px', borderRadius: '2px' }} title="LLM Backward" />
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <div style={{ width: '50px', color: '#94A3B8' }}>GPU 2:</div>
                    <div style={{ width: '30px', background: '#090D16', height: '14px' }} />
                    <div style={{ width: '40px', background: '#38BDF8', height: '14px', borderRadius: '2px' }} title="LLM Forward" />
                    {vitPacked ? (
                      <div style={{ width: '40px', background: '#EC4899', height: '14px', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: '7px' }}>ViT Fill</div>
                    ) : (
                      <div style={{ width: '40px', border: '1px dashed #475569', height: '14px', borderRadius: '2px' }} />
                    )}
                    <div style={{ width: '40px', background: '#10B981', height: '14px', borderRadius: '2px' }} title="LLM Backward" />
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '1.02rem', color: '#94A3B8', lineHeight: '1.5' }}>
                👉 <b>Bubble Throughput:</b> Traditional multimodal pipelines can generate idle bubbles because image processing and language generation are out of sync. Kimi-K3 splits ViT processing into micro-batches and overlaps it with pipeline bubbles; the report describes improved utilization, not a universal 100% guarantee.
              </div>
            </div>
          )}

          {activeSubTab === 'serving' && (
            <div>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '10px' }}>🌐 Fleet-Level Load Balancing & Admission (Item 26)</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#02040a', padding: '12px', borderRadius: '8px' }}>
                <div style={{ borderLeft: '3px solid #38BDF8', paddingLeft: '8px' }}>
                  <div style={{ fontSize: '1.02rem', color: '#FFF', fontWeight: 'bold' }}>Cache-aware Affinity Scheduling</div>
                  <div style={{ fontSize: '1.15rem', color: '#94A3B8', marginTop: '2px' }}>
                    Uses a dual-cluster primary-secondary routing algorithm based on consistent hashing to ensure agent requests sharing the same long prefix are routed to the same cache-hot GPU node.
                  </div>
                </div>

                <div style={{ borderLeft: '3px solid #10B981', paddingLeft: '8px' }}>
                  <div style={{ fontSize: '1.02rem', color: '#FFF', fontWeight: 'bold' }}>Budget Control & Admission</div>
                  <div style={{ fontSize: '1.15rem', color: '#94A3B8', marginTop: '2px' }}>
                    Dynamically monitors global GPU memory utilization, automatically fine-tuning Token budget thresholds for long-context generation to prevent ultra-long agent interactions from exhausting hardware resources.
                  </div>
                </div>

                <div style={{ borderLeft: '3px solid #F59E0B', paddingLeft: '8px' }}>
                  <div style={{ fontSize: '1.02rem', color: '#FFF', fontWeight: 'bold' }}>Firecracker MicroVM Snapshot Restore (49ms)</div>
                  <div style={{ fontSize: '1.15rem', color: '#94A3B8', marginTop: '2px' }}>
                    The 49ms metric measures the Firecracker microVM memory snapshot restoration latency. AgentEnv loads pre-forked RAM pages directly into execution, bypassing Linux kernel and Python runtime cold-boot penalties.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Collapsible Math Panel */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px', marginTop: '10px' }}>
            <button 
              className="btn" 
              style={{ width: '100%', justifyContent: 'space-between', display: 'flex', fontSize: '1.02rem', padding: '8px 12px' }}
              onClick={() => setShowFormula(!showFormula)}
            >
              <span>{showFormula ? '▼ Collapse Mathematical Principles & Formulas' : '▶ Click ? to View Mathematical Principles & Formulas'}</span>
            </button>

            {showFormula && (
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="formula-box" style={{ fontSize: '1.15rem', lineHeight: '1.4' }}>
                  <strong>EP Bounded Redundancy Slots Allocation Formula:</strong>
                  <div style={{ fontFamily: 'monospace', color: '#10B981', margin: '4px 0', textAlign: 'center' }}>
                    Redundancy Slot ≤ ⌈ E(R-1) / R² ⌉ 
                  </div>
                  Ensures that during expert routing allocation, slot limits prevent memory overflow, safeguarding the system against deadlocks.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
