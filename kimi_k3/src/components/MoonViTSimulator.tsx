import React, { useState, useEffect, useRef } from 'react';

export const MoonViTSimulator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pixelShuffle' | 'factorizedAttn' | 'stability'>('pixelShuffle');
  const isPlaying = true;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Slicing patch state variables
  const [sliceProgress, setSliceProgress] = useState<number>(0);
  const [isSlicing, setIsSlicing] = useState<boolean>(false);
  const [selectedImgIdx, setSelectedImgIdx] = useState<number>(0);

  // Gradient stability zoom state
  const [zoomRange, setZoomRange] = useState<number>(100); // 100% visible

  // Attention Heatmap states
  const [hoveredHeatCell, setHoveredHeatCell] = useState<{ r: number; c: number } | null>(null);

  // Sample image options (4x4 grids)
  const imagesMock = [
    [
      ['#FF5555', '#FF5555', '#38BDF8', '#38BDF8'],
      ['#FF5555', '#FF5555', '#38BDF8', '#38BDF8'],
      ['#10B981', '#10B981', '#FFB000', '#FFB000'],
      ['#10B981', '#10B981', '#FFB000', '#FFB000']
    ],
    [
      ['#38BDF8', '#FFF', '#FFF', '#38BDF8'],
      ['#FFF', '#38BDF8', '#38BDF8', '#FFF'],
      ['#FFF', '#38BDF8', '#38BDF8', '#FFF'],
      ['#38BDF8', '#FFF', '#FFF', '#38BDF8']
    ],
    [
      ['#FFB000', '#FFB000', '#FFB000', '#FFB000'],
      ['#FFB000', '#10B981', '#10B981', '#FFB000'],
      ['#FFB000', '#10B981', '#10B981', '#FFB000'],
      ['#FFB000', '#FFB000', '#FFB000', '#FFB000']
    ]
  ];

  // Trigger patch slicing animation
  const handleSliceClick = () => {
    setIsSlicing(true);
    setSliceProgress(0);
  };

  useEffect(() => {
    let intervalId: number;
    if (isSlicing) {
      intervalId = window.setInterval(() => {
        setSliceProgress(prev => {
          if (prev >= 1) {
            setIsSlicing(false);
            return 1;
          }
          return prev + 0.04;
        });
      }, 30);
    }
    return () => clearInterval(intervalId);
  }, [isSlicing]);

  // Main Canvas loop for visual drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let tick = 0;

    const draw = () => {
      const width = (canvas.width = canvas.parentElement?.clientWidth || 550);
      const height = (canvas.height = canvas.parentElement?.clientHeight || 300);

      ctx.clearRect(0, 0, width, height);
      tick++;

      if (activeTab === 'pixelShuffle') {
        // Draw 4x4 Grid image slicing and Pixel-Shuffle
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.fillText('4×4 Pixel Input Image', 30, 30);
        ctx.fillText('Patch Segmentation & Embedding (d_pixel=14×14×3)', width * 0.46, 30);

        const currentImg = imagesMock[selectedImgIdx];
        const cellSize = 30;
        const gridX = 40;
        const gridY = 60;

        // Draw 4x4 source grid
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            ctx.fillStyle = currentImg[r][c];
            ctx.fillRect(gridX + c * cellSize, gridY + r * cellSize, cellSize - 2, cellSize - 2);
          }
        }

        // Draw slice bounds
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.strokeRect(gridX - 4, gridY - 4, cellSize * 4 + 6, cellSize * 4 + 6);

        // Splitting patches animation
        const patchStartX = width * 0.48;
        const patchStartY = 60;
        const patchSpacing = 38;

        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            const color = currentImg[r][c];
            const originalX = gridX + c * cellSize;
            const originalY = gridY + r * cellSize;
            
            // Interpolate position based on sliceProgress
            const targetX = patchStartX + c * patchSpacing;
            const targetY = patchStartY + r * patchSpacing;
            
            const currentX = originalX + (targetX - originalX) * sliceProgress;
            const currentY = originalY + (targetY - originalY) * sliceProgress;

            ctx.fillStyle = color;
            ctx.fillRect(currentX, currentY, 20, 20);

            // Draw vector bar morphing at 100% sliceProgress
            if (sliceProgress >= 0.9) {
              ctx.fillStyle = 'rgba(56, 189, 248, 0.1)';
              ctx.fillRect(currentX + 24, currentY, 12, 20);
              ctx.fillStyle = '#00F2FE';
              ctx.fillRect(currentX + 26, currentY + 2, 8, 16);
            }
          }
        }

        if (sliceProgress >= 0.9) {
          ctx.fillStyle = '#94A3B8';
          ctx.font = '13px Inter, sans-serif';
          ctx.fillText("Lossless channel transformation: Input image downsampled, each block converted to a 1D Token embedding vector", 30, height - 20);
        }

      } else if (activeTab === 'factorizedAttn') {
        // Spatial + Temporal Factorized Attention Visuals
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.fillText('Intra-frame Spatial Self-Attention', 30, 25);
        ctx.fillText('Inter-frame Temporal Attention', width * 0.52, 25);

        const drawFrame = (x: number, y: number, name: string, active: boolean, attentionType: 'spatial' | 'temporal') => {
          ctx.strokeStyle = active ? '#10B981' : '#334155';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x, y, 130, 90);
          ctx.fillStyle = '#090D16';
          ctx.fillRect(x, y, 130, 90);

          ctx.fillStyle = active ? '#10B981' : '#64748B';
          ctx.font = 'bold 12px Inter, sans-serif';
          ctx.fillText(name, x + 8, y + 15);

          // Draw active token dots
          const tokens = [
            { lx: 25, ly: 35 }, { lx: 105, ly: 35 },
            { lx: 25, ly: 70 }, { lx: 105, ly: 70 }
          ];

          tokens.forEach((tok) => {
            ctx.fillStyle = active ? '#34D399' : '#475569';
            ctx.beginPath();
            ctx.arc(x + tok.lx, y + tok.ly, 4, 0, Math.PI * 2);
            ctx.fill();
          });

          // Draw spatial links
          if (attentionType === 'spatial' && active) {
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i < tokens.length; i++) {
              for (let j = i + 1; j < tokens.length; j++) {
                ctx.moveTo(x + tokens[i].lx, y + tokens[i].ly);
                ctx.lineTo(x + tokens[j].lx, y + tokens[j].ly);
              }
            }
            ctx.stroke();
          }
        };

        // Draw Spatial
        drawFrame(30, 45, 'Video Frame 1 (t=1)', true, 'spatial');
        drawFrame(30, 155, 'Video Frame 2 (t=2)', false, 'spatial');

        // Draw Temporal
        const tempX = width * 0.52;
        drawFrame(tempX, 45, 'Video Frame 1 (t=1)', true, 'temporal');
        drawFrame(tempX, 155, 'Video Frame 2 (t=2)', true, 'temporal');

        // Draw temporal links (matching tokens across frames)
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.lineDashOffset = -(tick * 0.8) % 16;
        
        ctx.beginPath();
        const tokens = [
          { lx: 25, ly: 35 }, { lx: 105, ly: 35 },
          { lx: 25, ly: 70 }, { lx: 105, ly: 70 }
        ];
        tokens.forEach(tok => {
          ctx.moveTo(tempX + tok.lx, 45 + tok.ly);
          ctx.lineTo(tempX + tok.lx, 155 + tok.ly);
        });
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#94A3B8';
        ctx.font = '10px Outfit';
        ctx.fillText("Spatial attention only associates pixels within the same frame", 30, height - 15);
        ctx.fillText("Temporal alignment attention associates identical pixels across frames, reducing redundant modeling", width * 0.52, height - 15);

      } else if (activeTab === 'stability') {
        // Gradient norm chart with zoom control
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px Outfit';
        ctx.fillText('Gradient Norm Stability Comparison (First 20,000 steps details)', 30, 25);

        // Draw axes
        const chartX = 40;
        const chartY = 40;
        const chartWidth = width - 80;
        const chartHeight = height - 100;

        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(chartX, chartY, chartWidth, chartHeight);

        // Grid lines
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 1; i <= 4; i++) {
          const ly = chartY + (chartHeight / 5) * i;
          ctx.moveTo(chartX, ly);
          ctx.lineTo(chartX + chartWidth, ly);
        }
        ctx.stroke();

        // Limit data count based on zoomRange (zoomRange % of 100 steps)
        const visibleSteps = Math.ceil((zoomRange / 100) * 100);
        
        // Render Line chart
        // SigLIP norm line (noisy with spikes)
        ctx.strokeStyle = '#FF5555';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let s = 0; s < visibleSteps; s++) {
          const cx = chartX + (s / visibleSteps) * chartWidth;
          // SigLIP norm simulates noisy norm spiking
          let val = 0.4 + Math.sin(s / 6) * 0.08 + (Math.sin(s * 2.2) * 0.15);
          if (s === 12 || s === 35 || s === 52 || s === 74) val += 0.45; // spikes
          const cy = chartY + chartHeight - Math.min(0.95, val) * chartHeight;
          if (s === 0) ctx.moveTo(cx, cy);
          else ctx.lineTo(cx, cy);
        }
        ctx.stroke();

        // MoonViT-V2 from scratch line (stable, flat)
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let s = 0; s < visibleSteps; s++) {
          const cx = chartX + (s / visibleSteps) * chartWidth;
          const val = 0.2 + Math.sin(s / 12) * 0.03 + (Math.sin(s * 1.5) * 0.02);
          const cy = chartY + chartHeight - val * chartHeight;
          if (s === 0) ctx.moveTo(cx, cy);
          else ctx.lineTo(cx, cy);
        }
        ctx.stroke();

        // Legend
        ctx.fillStyle = '#FF5555';
        ctx.fillRect(chartX + 15, chartY + 15, 12, 6);
        ctx.fillStyle = '#94A3B8';
        ctx.font = '10px Outfit';
        ctx.fillText("SigLIP Visual Contrastive Norm (highly unstable)", chartX + 32, chartY + 21);

        ctx.fillStyle = '#10B981';
        ctx.fillRect(chartX + 200, chartY + 15, 12, 6);
        ctx.fillStyle = '#94A3B8';
        ctx.fillText("MoonViT-V2 Self-developed Native (perfect convergence)", chartX + 217, chartY + 21);
      }
    };

    if (isPlaying) {
      const renderLoop = () => {
        draw();
        animId = requestAnimationFrame(renderLoop);
      };
      renderLoop();
    } else {
      draw();
    }

    return () => cancelAnimationFrame(animId);
  }, [activeTab, isPlaying, sliceProgress, selectedImgIdx, zoomRange]);

  // Generate heatmap matrix details
  const heatmapRows = 6;
  const heatmapCols = 6;

  return (
    <div className="tab-panel">
      <div className="badge">Chapter 2.4 - Native Vision (Native Multimodal Vision)</div>
      <h2 style={{ color: '#FFFFFF', marginTop: '10px' }}>MoonViT-V2 Native Multimodal Vision Encoder</h2>
      <p style={{ color: '#94A3B8', fontSize: '1.08rem', marginBottom: '20px' }}>
        Kimi-K3 completely discards external pre-trained image encoders such as SigLIP, and instead uses the <b>MoonViT-V2</b> vision model trained from scratch, jointly encoded in an autoregressive manner.
      </p>

      <div className="grid-2" style={{ gap: '20px' }}>
        
        {/* Left Column: Canvas animations */}
        <div className="card">
          <div className="control-panel" style={{ marginBottom: '15px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              className={`btn ${activeTab === 'pixelShuffle' ? 'active' : ''}`}
              onClick={() => setActiveTab('pixelShuffle')}
              style={{ padding: '4px 10px', fontSize: '1.02rem' }}
            >
              Patch Segmentation & Rearrangement
            </button>
            <button 
              className={`btn ${activeTab === 'factorizedAttn' ? 'active' : ''}`}
              onClick={() => setActiveTab('factorizedAttn')}
              style={{ padding: '4px 10px', fontSize: '1.02rem' }}
            >
              Spatio-Temporal Factorized Self-Attention
            </button>
            <button 
              className={`btn ${activeTab === 'stability' ? 'active' : ''}`}
              onClick={() => setActiveTab('stability')}
              style={{ padding: '4px 10px', fontSize: '1.02rem' }}
            >
              Gradient Norm Training Stability
            </button>
          </div>

          <div className="visualizer-container" style={{ height: '240px' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
          </div>

          {/* Interactive controls based on activeTab */}
          {activeTab === 'pixelShuffle' && (
            <div className="control-panel" style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button className="btn-primary" onClick={handleSliceClick}>
                Start Patch Segmentation Animation
              </button>
              <span style={{ fontSize: '1.02rem', color: '#94A3B8' }}>Switch Sample Image:</span>
              <select 
                value={selectedImgIdx} 
                onChange={(e) => {
                  setSelectedImgIdx(parseInt(e.target.value));
                  setSliceProgress(0);
                }}
                style={{ padding: '4px 10px', fontSize: '1.02rem' }}
              >
                <option value="0">Sample Image A (Color Matrix)</option>
                <option value="1">Sample Image B (Central Symmetry)</option>
                <option value="2">Sample Image C (Ring Contour)</option>
              </select>
            </div>
          )}

          {activeTab === 'stability' && (
            <div className="control-panel" style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '1.02rem', color: '#94A3B8' }}>Drag/Zoom to view training details:</span>
              <input 
                type="range" 
                min="10" 
                max="100" 
                value={zoomRange}
                onChange={(e) => setZoomRange(parseInt(e.target.value))}
                style={{ flex: 1, cursor: 'pointer', accentColor: '#10B981' }}
              />
              <span style={{ fontSize: '1.02rem', color: '#10B981', width: '35px' }}>{zoomRange}%</span>
            </div>
          )}
        </div>

        {/* Right Column: Attention heatmap & details */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="card-title">🎯 Visual Attention Heatmap</div>

          {/* Interactive Heatmap grid visualization */}
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(6, 1fr)', 
                gap: '2px', 
                background: '#090D16', 
                padding: '8px', 
                borderRadius: '6px',
                width: '120px'
              }}
            >
              {Array.from({ length: heatmapRows * heatmapCols }).map((_, idx) => {
                const r = Math.floor(idx / heatmapCols);
                const c = idx % heatmapCols;
                // Generate a visual focus spot in the center
                const distToCenter = Math.sqrt(Math.pow(r - 2.5, 2) + Math.pow(c - 2.5, 2));
                const focusVal = Math.max(0.05, 1 - distToCenter * 0.35);
                const isHovered = hoveredHeatCell && hoveredHeatCell.r === r && hoveredHeatCell.c === c;

                return (
                  <div 
                    key={idx}
                    onMouseEnter={() => setHoveredHeatCell({ r, c })}
                    onMouseLeave={() => setHoveredHeatCell(null)}
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '2px',
                      background: `rgba(236, 72, 153, ${focusVal})`,
                      border: isHovered ? '1px solid #FFF' : 'none',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                  />
                );
              })}
            </div>

            <div style={{ flex: 1, fontSize: '1.02rem', color: '#94A3B8', lineHeight: '1.4' }}>
              <span style={{ color: '#E2E8F0', fontWeight: 'bold' }}>Adaptive Capture of Salient Image Features</span>
              <p style={{ marginTop: '4px' }}>
                • Hover over the left grid to probe the attention weight coefficient of each image block.<br />
                • In joint learning, the attention weights stably lock onto the boundaries of core objects, indicating a physical-level semantic alignment between self-supervised image features and natural language.
              </p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px', fontSize: '1.02rem', lineHeight: '1.5' }}>
            <span style={{ color: '#FFB000', fontWeight: 'bold' }}>🍳 The 'Puzzle Pieces' Metaphor for Image Patching</span>
            <p style={{ color: '#94A3B8', marginTop: '4px' }}>
              It's like cutting a complete puzzle card into 16 small fragments, and rolling each piece into a small scroll (vector). The traditional approach requires putting a hard outer shell (an external image network) on the scrolls. Kimi-K3's self-developed vision model allows these small scrolls to be stitched perfectly with the subsequent text scrolls, reducing information leakage and gradient misalignment at the seams.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
