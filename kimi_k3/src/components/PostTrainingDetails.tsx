import React, { useState, useEffect, useCallback } from 'react';
import { MOPD_TEACHER_DOMAINS, MOPD_EFFORT_LEVELS } from '../data/k3Specs';

// Worker Slot representing a physical worker running a rollout trajectory
interface WorkerSlot {
  slotId: number;
  trajId: string;
  promptId: number;
  rolloutK: number;
  progress: number;
  speed: number;
  status: 'running' | 'paused' | 'completed' | 'consumed';
  policyVersion: number;
}

// Completed item in the result pool
interface CompletedResult {
  trajId: string;
  promptId: number;
  rolloutK: number;
  policyVersion: number;
}

export const PostTrainingDetails: React.FC = () => {
  const [subTab, setSubTab] = useState<'rlRollout' | 'speculative' | 'taskSynth'>('rlRollout');
  const [lambdaVal, setLambdaVal] = useState<number>(0.75); // 75% completion threshold
  const [showFormula, setShowFormula] = useState<boolean>(false);

  // MOPD interactive state
  const [selectedDomain, setSelectedDomain] = useState<string>('general_agents');
  const [selectedEffort, setSelectedEffort] = useState<string>('high');

  // Policy version tracking
  const [policyVersion, setPolicyVersion] = useState<number>(1);
  const [nextPromptCounter, setNextPromptCounter] = useState<number>(5); // P1..P4 initially
  const [nextTrajCounter, setNextTrajCounter] = useState<number>(17);

  // Completed results pool & consumed groups log
  const [completedPool, setCompletedPool] = useState<Record<number, CompletedResult[]>>({});
  const [consumedPromptIds, setConsumedPromptIds] = useState<number[]>([]);

  // Initial 16 worker slots (4 prompts x 4 rollouts)
  const initialSlots = (): WorkerSlot[] => {
    return Array.from({ length: 16 }, (_, idx) => {
      const promptId = Math.floor(idx / 4) + 1;
      const rolloutK = (idx % 4) + 1;
      // Stagger speeds: some fast (prompts 1 & 2), some slower stragglers (prompts 3 & 4)
      const speed = 1.2 + ((idx * 7) % 11) * 0.28;
      return {
        slotId: idx,
        trajId: `T-${idx + 1}`,
        promptId,
        rolloutK,
        progress: 0,
        speed,
        status: 'running',
        policyVersion: 1
      };
    });
  };

  const [workerSlots, setWorkerSlots] = useState<WorkerSlot[]>(initialSlots);
  const [isRolloutRunning, setIsRolloutRunning] = useState<boolean>(true);

  // Compute active batch completion metrics
  const activeCompletedCount = workerSlots.filter(s => s.status === 'completed').length;
  const targetThreshold = Math.ceil(16 * lambdaVal);
  const thresholdReached = activeCompletedCount >= targetThreshold;

  // Prompts that currently have all K=4 rollouts completed in the pool
  const readyPromptIds = Object.keys(completedPool)
    .map(Number)
    .filter(pId => !consumedPromptIds.includes(pId) && (completedPool[pId]?.length || 0) >= 4);

  // Simulation step function
  const stepSimulation = useCallback(() => {
    setWorkerSlots(prev => {
      const currentCompleted = prev.filter(s => s.status === 'completed').length;
      if (currentCompleted >= targetThreshold) {
        // Pause all incomplete workers once threshold is reached
        return prev.map(s => s.status === 'running' ? { ...s, status: 'paused' } : s);
      }

      return prev.map(s => {
        if (s.status !== 'running') return s;
        const nextProg = Math.min(100, s.progress + s.speed * 2.5);
        if (nextProg >= 100) {
          // Record to completed pool if not already present
          setCompletedPool(pool => {
            const existing = pool[s.promptId] || [];
            if (!existing.some(item => item.trajId === s.trajId)) {
              return {
                ...pool,
                [s.promptId]: [
                  ...existing,
                  { trajId: s.trajId, promptId: s.promptId, rolloutK: s.rolloutK, policyVersion: s.policyVersion }
                ]
              };
            }
            return pool;
          });
          return {
            ...s,
            progress: 100,
            status: 'completed'
          };
        }
        return { ...s, progress: nextProg };
      });
    });
  }, [targetThreshold]);

  // Rollout simulation loop
  useEffect(() => {
    if (!isRolloutRunning) return;
    const timer = window.setInterval(stepSimulation, 100);
    return () => clearInterval(timer);
  }, [isRolloutRunning, stepSimulation]);

  // Action: Optimize complete groups and resume paused stragglers (R03 fix)
  const handleOptimizeAndResume = () => {
    if (readyPromptIds.length === 0 && !thresholdReached) return;

    // 1. Mark complete prompt groups as consumed and advance policy version
    const newlyConsumed = [...readyPromptIds];
    setConsumedPromptIds(prev => [...prev, ...newlyConsumed]);
    const nextVer = newlyConsumed.length > 0 ? policyVersion + 1 : policyVersion;
    if (newlyConsumed.length > 0) {
      setPolicyVersion(nextVer);
    }

    // 2. Update worker slots:
    // - For slots whose prompt was consumed: assign a NEW prompt with new IDs and 0% progress
    // - For slots whose prompt is incomplete (stragglers): RESUME FROM PAUSED PROGRESS (do NOT reset!)
    setWorkerSlots(prev => {
      const promptAssignCounter = nextPromptCounter;
      let trajAssignCounter = nextTrajCounter;

      const newSlots = prev.map(s => {
        if (newlyConsumed.includes(s.promptId)) {
          // This slot belonged to a consumed prompt group -> assign next new prompt
          // Group of 4 slots gets the same new promptId
          const newPromptId = promptAssignCounter;
          const newTrajId = `T-${trajAssignCounter++}`;
          return {
            ...s,
            trajId: newTrajId,
            promptId: newPromptId,
            progress: 0,
            status: 'running' as const,
            speed: 1.0 + ((s.slotId * 5) % 9) * 0.3,
            policyVersion: nextVer
          };
        } else if (s.status === 'paused') {
          // Resumed straggler continues from exact paused progress!
          return {
            ...s,
            status: 'running' as const
          };
        }
        return s;
      });

      if (newlyConsumed.length > 0) {
        setNextPromptCounter(c => c + newlyConsumed.length);
        setNextTrajCounter(trajAssignCounter);
      }
      return newSlots;
    });

    setIsRolloutRunning(true);
  };

  const handleResetRollout = () => {
    setWorkerSlots(initialSlots());
    setCompletedPool({});
    setConsumedPromptIds([]);
    setPolicyVersion(1);
    setNextPromptCounter(5);
    setNextTrajCounter(17);
    setIsRolloutRunning(true);
  };

  // Speculative decoding Gantt animation state
  const [specTick, setSpecTick] = useState<number>(0);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setSpecTick(prev => (prev + 1) % 30);
    }, 250);
    return () => clearInterval(timerId);
  }, []);

  const getGanttBlocks = () => {
    if (specTick < 10) {
      return {
        phase: "Draft Generation",
        desc: "Draft model (EAGLE-3) pre-generates 4 speculative tokens sequentially...",
        blocks: [
          { name: "Draft T1", color: '#10B981', w: 30, x: 20 },
          { name: "Draft T2", color: '#10B981', w: 30, x: 55 },
          { name: "Draft T3", color: '#10B981', w: 30, x: 90 },
          { name: "Draft T4", color: '#10B981', w: 30, x: 125 }
        ]
      };
    } else if (specTick < 18) {
      return {
        phase: "Target Verification",
        desc: "Target model (Kimi-K3) validates all 4 draft tokens in parallel in a single forward pass...",
        blocks: [
          { name: "Draft T1", color: '#059669', w: 30, x: 20 },
          { name: "Draft T2", color: '#059669', w: 30, x: 55 },
          { name: "Draft T3", color: '#059669', w: 30, x: 90 },
          { name: "Draft T4", color: '#059669', w: 30, x: 125 },
          { name: "Target Verification (Parallel)", color: '#38BDF8', w: 135, x: 20, y: 35 }
        ]
      };
    } else {
      return {
        phase: "Acceptance & Prefix Restoration",
        desc: "3 tokens accepted; 4th rejected. Validated prefix is preserved; target model resumes without leaking rejected draft state.",
        blocks: [
          { name: "Accept ✅", color: '#10B981', w: 30, x: 20 },
          { name: "Accept ✅", color: '#10B981', w: 30, x: 55 },
          { name: "Accept ✅", color: '#10B981', w: 30, x: 90 },
          { name: "Reject ❌", color: '#EF4444', w: 30, x: 125 },
          { name: "Target Correction (Corrected T4)", color: '#A78BFA', w: 35, x: 160 }
        ]
      };
    }
  };

  const ganttInfo = getGanttBlocks();

  // Helper for teacher button short codes to avoid T_gene collision
  const getDomainShortCode = (domId: string) => {
    if (domId === 'general_tasks') return 'T_task';
    if (domId === 'general_agents') return 'T_agent';
    if (domId === 'coding_agents') return 'T_code';
    return 'T_spec';
  };

  return (
    <div className="tab-panel">
      <div className="badge">Chapter 4 - Post-Training Evolution</div>
      <h2 style={{ color: '#FFFFFF', marginTop: '10px' }}>Kimi-K3 Post-Training Reinforcement Learning &amp; Alignment</h2>
      <p style={{ color: '#94A3B8', fontSize: '1.08rem', marginBottom: '20px' }}>
        Kimi-K3 post-training integrates Multi-Teacher On-Policy Distillation (MOPD) and asynchronous partial rollout mechanisms, eliminating straggler waiting deadlocks across distributed GPU clusters.
      </p>

      {/* Sub-tab navigation */}
      <div className="control-panel" style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          className={`btn ${subTab === 'rlRollout' ? 'active' : ''}`}
          onClick={() => setSubTab('rlRollout')}
        >
          4.1 Asynchronous Partial Rollout (Worker Lifecycle)
        </button>
        <button 
          className={`btn ${subTab === 'speculative' ? 'active' : ''}`}
          onClick={() => setSubTab('speculative')}
        >
          4.2 Cascaded Feature Fusion &amp; Speculative Draft
        </button>
        <button 
          className={`btn ${subTab === 'taskSynth' ? 'active' : ''}`}
          onClick={() => setSubTab('taskSynth')}
        >
          4.3 Multi-Teacher On-Policy Distillation (MOPD)
        </button>
      </div>

      <div className="grid-2" style={{ gap: '20px' }}>
        
        {/* Left Column: Dynamic Visualizations */}
        <div className="card">
          
          {/* SUB-TAB 4.1: ASYNCHRONOUS PARTIAL ROLLOUT */}
          {subTab === 'rlRollout' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', margin: 0 }}>
                  ⚡ Asynchronous Partial Rollout (Sample Lifecycle &amp; Queue)
                </h3>
                <span style={{ color: '#38BDF8', fontSize: '0.85rem', fontFamily: 'monospace', background: 'rgba(56, 189, 248, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                  Policy Version: v{policyVersion}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.92rem' }}>
                <span style={{ color: '#94A3B8' }}>Completion Threshold Ratio (λ):</span>
                <span style={{ color: '#10B981', fontWeight: 'bold' }}>{Math.round(lambdaVal * 100)}% ({targetThreshold} / 16 active trajectories)</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="0.95" 
                step="0.05"
                value={lambdaVal} 
                onChange={(e) => setLambdaVal(Number(e.target.value))}
                style={{ width: '100%', marginBottom: '16px', accentColor: '#10B981' }}
              />

              {/* Status Banner */}
              <div style={{ 
                padding: '10px 14px', 
                borderRadius: '6px', 
                marginBottom: '16px',
                background: thresholdReached ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.1)',
                border: `1px solid ${thresholdReached ? '#10B981' : '#38BDF8'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div>
                  <span style={{ fontWeight: 'bold', color: thresholdReached ? '#10B981' : '#38BDF8' }}>
                    {thresholdReached ? '🎉 λ Threshold Reached! Stragglers Paused without Loss.' : '⏳ Worker Sampling in Progress...'}
                  </span>
                  <div style={{ color: '#94A3B8', fontSize: '0.82rem', marginTop: '2px' }}>
                    Completed in batch: {activeCompletedCount}/16 · Ready prompt groups (K=4 in pool): {readyPromptIds.length > 0 ? readyPromptIds.map(p => `P${p}`).join(', ') : 'None yet'}
                  </div>
                </div>
                {(thresholdReached || readyPromptIds.length > 0) && (
                  <button onClick={handleOptimizeAndResume} style={{ background: '#10B981', color: '#000', border: 'none', padding: '6px 14px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                    🚀 Optimize Ready &amp; Resume Stragglers ➔
                  </button>
                )}
              </div>

              {/* Worker Swimlanes Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#02040a', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '2px' }}>
                  Worker Execution Slots (16 concurrent rollouts):
                </div>
                {/* Group workers by Prompt ID currently assigned */}
                {Array.from(new Set(workerSlots.map(s => s.promptId))).map(pId => {
                  const slotsForP = workerSlots.filter(s => s.promptId === pId);
                  const isGroupReady = (completedPool[pId]?.length || 0) >= 4;
                  const isConsumed = consumedPromptIds.includes(pId);
                  return (
                    <div key={pId} style={{ background: isConsumed ? 'rgba(100, 116, 139, 0.1)' : isGroupReady ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.02)', padding: '8px 10px', borderRadius: '6px', border: `1px solid ${isConsumed ? 'rgba(100, 116, 139, 0.3)' : isGroupReady ? '#10B981' : 'rgba(255,255,255,0.06)'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                        <span style={{ color: isConsumed ? '#94A3B8' : isGroupReady ? '#10B981' : '#E2E8F0', fontWeight: 'bold' }}>
                          Prompt {pId} {isConsumed ? '✔ (Optimized & Consumed)' : isGroupReady ? '✅ (All K=4 Complete in Pool → Ready)' : `(Pool: ${completedPool[pId]?.length || 0} / 4)`}
                        </span>
                        <span style={{ color: '#64748B', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          Slots [{slotsForP.map(s => s.slotId + 1).join(', ')}]
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                        {slotsForP.map(slot => {
                          const isDone = slot.status === 'completed';
                          const isPaused = slot.status === 'paused';
                          const color = isDone ? '#10B981' : isPaused ? '#F59E0B' : '#38BDF8';
                          return (
                            <div key={slot.slotId} style={{ background: '#0B0F19', padding: '5px 8px', borderRadius: '4px', border: `1px solid ${color}40` }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '2px' }}>
                                <span style={{ color: '#94A3B8' }}>{slot.trajId}</span>
                                <span style={{ color, fontWeight: 'bold' }}>
                                  {isDone ? 'Done' : isPaused ? 'Paused' : `${Math.round(slot.progress)}%`}
                                </span>
                              </div>
                              <div style={{ background: '#1E293B', height: '5px', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ background: color, width: `${slot.progress}%`, height: '100%', transition: 'width 0.1s' }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Toolbar */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                <button className="btn" onClick={() => setIsRolloutRunning(!isRolloutRunning)} style={{ fontSize: '0.85rem' }}>
                  {isRolloutRunning ? '⏸️ Pause Workers' : '▶️ Resume Workers'}
                </button>
                <button className="btn" onClick={stepSimulation} style={{ fontSize: '0.85rem' }}>
                  ⚡ Step Advance
                </button>
                <button className="btn-secondary" onClick={handleResetRollout} style={{ fontSize: '0.85rem' }}>
                  ↺ Reset Simulation
                </button>
              </div>

              <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '12px', lineHeight: '1.45' }}>
                💡 <b>Asynchronous Partial Rollout (R03):</b> Worker slots, completed result pools, and prompt groups are strictly decoupled. When the λ threshold pauses unfinished workers, previously completed trajectories are <b>retained in the pool</b>. When complete groups (K=4) are optimized, paused stragglers continue from their exact saved progress, eliminating redundant re-sampling.
              </div>
            </div>
          )}

          {/* SUB-TAB 4.2: SPECULATIVE DRAFT */}
          {subTab === 'speculative' && (
            <div>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '15px' }}>🚀 Speculative Decoding Gantt Chart (EAGLE-3 Verification)</h3>
              
              <div style={{ background: '#02040a', padding: '15px', borderRadius: '8px', minHeight: '130px' }}>
                <div style={{ fontSize: '1rem', color: '#FFF', fontWeight: 'bold', marginBottom: '5px' }}>
                  Current Phase: <span style={{ color: '#38BDF8' }}>{ganttInfo.phase}</span>
                </div>
                <div style={{ fontSize: '0.88rem', color: '#94A3B8', marginBottom: '15px' }}>
                  {ganttInfo.desc}
                </div>

                {/* Draw Gantt blocks using relative positions */}
                <div style={{ position: 'relative', height: '70px', background: '#090D16', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  {ganttInfo.blocks.map((block, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: 'absolute',
                        left: `${block.x}px`,
                        top: block.y ? `${block.y}px` : '5px',
                        width: `${block.w}px`,
                        height: '24px',
                        background: block.color,
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#000',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                      }}
                    >
                      {block.name}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ fontSize: '0.88rem', color: '#94A3B8', marginTop: '12px', lineHeight: '1.45' }}>
                💡 <b>Speculative State Restoration:</b> Lightweight EAGLE-3 drafts 4 tokens in sequence. Target model Kimi-K3 evaluates all 4 candidates in a single parallel step. Upon rejection, the valid accepted prefix is preserved in the MLA cache while the KDA state is restored from the accepted prefix inputs, ensuring mathematical equivalence with standard generation.
              </div>
            </div>
          )}

          {/* SUB-TAB 4.3: MOPD */}
          {subTab === 'taskSynth' && (
            <div>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '15px' }}>
                3 Domains × 3 Effort Levels = 9 Teacher Configurations (MOPD §4.2)
              </h3>
              
              <div style={{ background: '#02040a', padding: '16px', borderRadius: '8px' }}>
                {/* 3x3 Teacher Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '130px repeat(3, 1fr)', gap: '8px', alignItems: 'center' }}>
                  <div style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: 'bold' }}>Domain \ Effort</div>
                  {MOPD_EFFORT_LEVELS.map(eff => (
                    <div key={eff.id} style={{ color: '#38BDF8', fontSize: '0.8rem', fontWeight: 'bold', textAlign: 'center' }}>
                      {eff.label}
                    </div>
                  ))}

                  {MOPD_TEACHER_DOMAINS.map(dom => (
                    <React.Fragment key={dom.id}>
                      <div style={{ color: '#E2E8F0', fontSize: '0.82rem', fontWeight: 'bold' }}>
                        {dom.label}
                      </div>
                      {MOPD_EFFORT_LEVELS.map(eff => {
                        const isSelected = selectedDomain === dom.id && selectedEffort === eff.id;
                        return (
                          <button
                            key={`${dom.id}-${eff.id}`}
                            onClick={() => { setSelectedDomain(dom.id); setSelectedEffort(eff.id); }}
                            style={{
                              padding: '8px 4px',
                              borderRadius: '4px',
                              border: `1px solid ${isSelected ? '#10B981' : 'rgba(255,255,255,0.1)'}`,
                              background: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.03)',
                              color: isSelected ? '#10B981' : '#CBD5E1',
                              cursor: 'pointer',
                              textAlign: 'center',
                              fontSize: '0.8rem',
                              fontWeight: isSelected ? 'bold' : 'normal',
                              transition: 'all 0.2s'
                            }}
                          >
                            {getDomainShortCode(dom.id)}_{eff.id}
                          </button>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>

                {/* Selected Teacher & Distillation Dataflow */}
                <div style={{ marginTop: '16px', padding: '12px', borderRadius: '6px', background: '#0B0F19', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{ color: '#10B981', fontWeight: 'bold', fontSize: '0.95rem' }}>
                      🎯 Active Teacher: {MOPD_TEACHER_DOMAINS.find(d => d.id === selectedDomain)?.label} · {MOPD_EFFORT_LEVELS.find(e => e.id === selectedEffort)?.label}
                    </span>
                    <span style={{ background: '#0F172A', color: '#F59E0B', border: '1px solid #F59E0B40', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                      sg(·) wraps complete reward r_t
                    </span>
                  </div>
                  <div style={{ color: '#94A3B8', fontSize: '0.82rem', lineHeight: '1.45', marginBottom: '8px' }}>
                    {MOPD_TEACHER_DOMAINS.find(d => d.id === selectedDomain)?.desc} ({MOPD_EFFORT_LEVELS.find(e => e.id === selectedEffort)?.desc}).
                  </div>

                  {/* Math Formula Box */}
                  <div style={{ background: '#070913', padding: '10px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.82rem', color: '#E2E8F0', lineHeight: '1.6' }}>
                    <div style={{ color: '#38BDF8' }}>1. Student π_θ samples on-policy rollouts: y ~ π_θ(x)</div>
                    <div style={{ color: '#F59E0B' }}>2. Detached reward: r_t = clip( sg( log T(y_t) - log π_θ(y_t) ), -R_max, R_max )</div>
                    <div style={{ color: '#10B981' }}>3. Policy update: L_MOPD(θ) = -E[ ∑_t r_t · log π_θ(y_t) ] (Gradients update θ only)</div>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '12px', lineHeight: '1.45' }}>
                💡 <b>MOPD Stop-Gradient Principle (R07):</b> The stop-gradient operator <code>sg(·)</code> is applied to the <b>entire token reward difference</b> <code>log T - log π_θ</code>. This detaches both the teacher probabilities and the student denominator in the reward expression, ensuring student model parameters θ receive policy gradients strictly through the standard policy log-likelihood <code>log π_θ(y_t)</code>.
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Comparative tables & collapsible math */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="card-title">📖 Quantized Parameter Allocation &amp; Training Recipe</div>

          {/* Quantization bit width details table */}
          <div style={{ background: '#02040a', padding: '12px', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.95rem', color: '#E2E8F0', fontWeight: 'bold', marginBottom: '6px' }}>
              MXFP Deployment-Aware Quantization Bit-Width Allocation (§5.1)
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '10px', lineHeight: '1.45' }}>
              <b>SFT ➔ RL Continuous QAT Timeline:</b> Quantization-Aware Training begins during Supervised Fine-Tuning (SFT) and continues through Reinforcement Learning (RL). Performing RL directly on quantized weights prevents post-training accuracy collapse upon deployment.
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155', color: '#94A3B8' }}>
                  <th style={{ padding: '6px' }}>Component</th>
                  <th style={{ padding: '6px' }}>Precision</th>
                  <th style={{ padding: '6px' }}>Rationale</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '6px', color: '#E2E8F0' }}>MoE Routed Weights</td>
                  <td style={{ padding: '6px', color: '#10B981', fontWeight: 'bold' }}>MXFP4</td>
                  <td style={{ padding: '6px', color: '#94A3B8' }}>Drastically shrinks model memory footprint &amp; inter-GPU communication bandwidth across 896 routed experts</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '6px', color: '#E2E8F0' }}>Feature Activations</td>
                  <td style={{ padding: '6px', color: '#38BDF8' }}>MXFP8</td>
                  <td style={{ padding: '6px', color: '#94A3B8' }}>Preserves dynamic range and suppresses outlier overflow in dense representations</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px', color: '#E2E8F0' }}>Shared Experts, Attention, Router, Latent Projections</td>
                  <td style={{ padding: '6px', color: '#F59E0B' }}>BF16 / FP8</td>
                  <td style={{ padding: '6px', color: '#94A3B8' }}>High-precision backbone layers, router logits, and latent compression (MLA d_c=512, MoE l=3584) prevent catastrophic accumulation error</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Collapsible Math Panel */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
            <button 
              className="btn" 
              style={{ width: '100%', justifyContent: 'space-between', display: 'flex', fontSize: '0.9rem', padding: '8px 12px' }}
              onClick={() => setShowFormula(!showFormula)}
            >
              <span>{showFormula ? '▼ Collapse Mathematical Principles & Formulas' : '▶ Click to View Mathematical Principles & Formulas'}</span>
            </button>

            {showFormula && (
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="formula-box" style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
                  <strong>Multi-Teacher On-Policy Distillation (MOPD) Clipped Ratio Loss (Eq. 4.15):</strong>
                  <div style={{ fontFamily: 'monospace', color: '#10B981', margin: '4px 0' }}>
                    r_opd = clip( sg( log( T / π_student ) ), -R_max, R_max)
                  </div>
                  <div style={{ color: '#94A3B8', fontSize: '0.82rem' }}>
                    The stop-gradient sg(·) truncates gradients through the reward difference, so student updates occur exclusively through policy log-probability gradients.
                  </div>
                </div>

                <div className="formula-box" style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
                  <strong>Quantile Balancing (QB) Batch Margin Quantile Formulation (Eq. 2.5):</strong>
                  <div style={{ fontFamily: 'monospace', color: '#38BDF8', margin: '4px 0', fontSize: '0.82rem' }}>
                    M_(i,j) = s_(i,j) - α_i^(t),  b̂_j = -Quantile(M_(:,j), 1 - C/M)
                  </div>
                  <div style={{ fontFamily: 'monospace', color: '#38BDF8', margin: '2px 0', fontSize: '0.82rem' }}>
                    b_j^(t+1) = b̂_j - Mean(b̂)
                  </div>
                  <div style={{ color: '#94A3B8', fontSize: '0.82rem' }}>
                    Unlike standard gradient updates based on load error, Quantile Balancing computes the exact margin distribution quantile across batch tokens to determine bias b^(t+1) for the next training batch.
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
