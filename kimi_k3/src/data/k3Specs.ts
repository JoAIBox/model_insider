/**
 * Authoritative Kimi K3 Model Specifications and Data
 * Sourced from:
 * - Moonshot AI Kimi K3 Technical Report (arXiv:2607.24653v2)
 * - Official Hugging Face config.json & Model Card
 * - Official LaTeX sources in docs/tech_report/
 */

export interface ModelSpec {
  name: string;
  totalParams: string;
  activeParams: string;
  numLayers: number;
  denseLayers: number;
  moeLayers: number;
  kdaLayers: number;
  mlaLayers: number;
  hiddenDim: number;
  numAttentionHeads: number;
  mlaKvLoraRank: number;
  mlaHeadDim: number;
  vocabSize: number;
  vocabSizeDisplay: string;
  maxContextLength: number;
  maxContextDisplay: string;
  moeTotalExperts: number;
  moeActiveExperts: number;
  moeSharedExperts: number;
  moeLatentDim: number;
  moeExpertHiddenDim: number;
  denseIntermediateDim: number;
  situBeta1: number;
  situBeta2: number;
  situOutputBound: number;
  kdaGMin: number;
  vitLayers: number;
  vitParams: string;
  vitHiddenDim: number;
  vitPatchSize: number;
  vitPixelShuffleDownsample: number;
  attnResBlockSize: number;
  attnResNumBlocks: number;
}

export const KIMI_K3_SPEC: ModelSpec = {
  name: "Kimi K3",
  totalParams: "2.78T",
  activeParams: "104.2B",
  numLayers: 93,
  denseLayers: 1, // Layer 1
  moeLayers: 92, // Layers 2..93
  kdaLayers: 69, // 23 cycles * 3
  mlaLayers: 24, // 23 cycles * 1 + 1 final
  hiddenDim: 7168,
  numAttentionHeads: 96,
  mlaKvLoraRank: 512, // d_c
  mlaHeadDim: 128, // d_h
  vocabSize: 163840,
  vocabSizeDisplay: "160K",
  maxContextLength: 1048576,
  maxContextDisplay: "1M",
  moeTotalExperts: 896,
  moeActiveExperts: 16,
  moeSharedExperts: 2,
  moeLatentDim: 3584, // l = 0.5 * d
  moeExpertHiddenDim: 3072,
  denseIntermediateDim: 33792,
  situBeta1: 4,
  situBeta2: 25,
  situOutputBound: 100,
  kdaGMin: -5,
  vitLayers: 27,
  vitParams: "401M",
  vitHiddenDim: 1024,
  vitPatchSize: 14,
  vitPixelShuffleDownsample: 4, // 2x2 = 4x token reduction
  attnResBlockSize: 12,
  attnResNumBlocks: 8, // 7 blocks of 12 + 1 block of 9 = 93 layers
};

export const k3Specs = {
  hiddenDim: KIMI_K3_SPEC.hiddenDim,
  totalLayers: KIMI_K3_SPEC.numLayers,
  kdaLayers: KIMI_K3_SPEC.kdaLayers,
  mlaLayers: KIMI_K3_SPEC.mlaLayers,
  denseLayers: KIMI_K3_SPEC.denseLayers,
  moeLayers: KIMI_K3_SPEC.moeLayers,
  mla: {
    heads: KIMI_K3_SPEC.numAttentionHeads,
    dc: KIMI_K3_SPEC.mlaKvLoraRank,
    dh: KIMI_K3_SPEC.mlaHeadDim,
  },
  moe: {
    sharedExperts: KIMI_K3_SPEC.moeSharedExperts,
    totalRouted: KIMI_K3_SPEC.moeTotalExperts,
    activeRouted: KIMI_K3_SPEC.moeActiveExperts,
    latentDim: KIMI_K3_SPEC.moeLatentDim,
    expertDim: KIMI_K3_SPEC.moeExpertHiddenDim,
  },
  vit: {
    layers: KIMI_K3_SPEC.vitLayers,
    params: KIMI_K3_SPEC.vitParams,
    hiddenDim: KIMI_K3_SPEC.vitHiddenDim,
    downsample: KIMI_K3_SPEC.vitPixelShuffleDownsample,
  }
};

export interface BenchmarkRecord {
  name: string;
  category: "Reasoning & Knowledge" | "Coding" | "Agentic" | "Vision";
  kimiK3: number | string;
  claudeFable5: number | string | null;
  gpt56Sol: number | string | null;
  opus48: number | string | null;
  gpt55: number | string | null;
  glm52: number | string | null; // null represents '-'
}

export const OFFICIAL_BENCHMARKS: BenchmarkRecord[] = [
  // Reasoning & Knowledge
  { name: "GPQA Diamond", category: "Reasoning & Knowledge", kimiK3: 93.5, claudeFable5: 92.6, gpt56Sol: 94.1, opus48: 91.0, gpt55: 93.5, glm52: 91.2 },
  { name: "CritPt", category: "Reasoning & Knowledge", kimiK3: 23.4, claudeFable5: 28.6, gpt56Sol: 32.3, opus48: 20.9, gpt55: 27.1, glm52: 20.9 },
  { name: "AA-LCR", category: "Reasoning & Knowledge", kimiK3: 74.7, claudeFable5: 70.0, gpt56Sol: 73.7, opus48: 67.7, gpt55: 74.3, glm52: 71.3 },
  // Coding
  { name: "DeepSWE", category: "Coding", kimiK3: 67.5, claudeFable5: 70.0, gpt56Sol: 73.0, opus48: 59.0, gpt55: 67.0, glm52: 46.2 },
  { name: "ProgramBench", category: "Coding", kimiK3: 77.8, claudeFable5: 76.8, gpt56Sol: 77.6, opus48: 71.9, gpt55: 70.8, glm52: 63.7 },
  { name: "Terminal-Bench 2.1", category: "Coding", kimiK3: 88.3, claudeFable5: 88.0, gpt56Sol: 88.8, opus48: 84.6, gpt55: 83.4, glm52: 82.7 },
  { name: "FrontierSWE", category: "Coding", kimiK3: 81.2, claudeFable5: 86.6, gpt56Sol: 71.3, opus48: 66.7, gpt55: 64.9, glm52: 67.3 },
  { name: "SWE-Marathon", category: "Coding", kimiK3: 42.0, claudeFable5: 35.0, gpt56Sol: 39.0, opus48: 40.0, gpt55: 14.0, glm52: 13.0 },
  // Agentic
  { name: "BrowseComp", category: "Agentic", kimiK3: 91.2, claudeFable5: 88.0, gpt56Sol: 90.4, opus48: 84.3, gpt55: 84.4, glm52: null }, // Table 1 GLM-5.2 is '-'
  { name: "MCPMark-Verified", category: "Agentic", kimiK3: 94.5, claudeFable5: 87.4, gpt56Sol: 92.9, opus48: 76.4, gpt55: 92.9, glm52: null },
  { name: "Toolathlon-Verified", category: "Agentic", kimiK3: 76.5, claudeFable5: 77.9, gpt56Sol: 74.9, opus48: 76.2, gpt55: 73.5, glm52: 59.9 },
  { name: "OSWorld-Verified", category: "Agentic", kimiK3: 84.8, claudeFable5: 85.0, gpt56Sol: 83.0, opus48: 83.4, gpt55: 79.0, glm52: null },
  // Vision
  { name: "OmniDocBench", category: "Vision", kimiK3: 91.1, claudeFable5: 89.8, gpt56Sol: 85.8, opus48: 87.9, gpt55: 89.4, glm52: null },
  { name: "Video-MME (w/ sub)", category: "Vision", kimiK3: 90.0, claudeFable5: null, gpt56Sol: 89.5, opus48: 86.0, gpt55: 89.3, glm52: null },
  { name: "MMVU", category: "Vision", kimiK3: 82.1, claudeFable5: null, gpt56Sol: 81.2, opus48: 79.2, gpt55: 81.7, glm52: null },
];

export const CONTEXT_CURRICULUM_STAGES = [
  {
    stage: 1,
    title: "Stage 1: 8K Initial Pre-training",
    tokens: "8K",
    tokenCount: 8192,
    phase: "Pre-training",
    description: "Initial pre-training starts with an 8K-token context window.",
    whatChanges: "Sequences are packed up to 8,192 tokens. Keeps initial training compute costs efficient while learning basic grammar, facts, and short-horizon associations.",
    kdaMemoryImpact: "Recurrent state matrix S_t remains fixed-size [96 heads, d_k × d_v] (O(1)).",
    mlaMemoryImpact: "Latent KV-cache records: N × 24 layers × d_c (512) = 1× reference.",
  },
  {
    stage: 2,
    title: "Stage 2: 64K Pre-training Extension",
    tokens: "64K",
    tokenCount: 65536,
    phase: "Pre-training",
    description: "Context window is extended to 64K tokens during later pre-training.",
    whatChanges: "Sequence length increases 8×. KDA Context Parallelism (KCP) and intra-device planners allow linear compute scaling.",
    kdaMemoryImpact: "Recurrent state matrix S_t remains fixed-size [96 heads, d_k × d_v] (O(1)).",
    mlaMemoryImpact: "Latent KV-cache records scale 8× compared to 8K stage.",
  },
  {
    stage: 3,
    title: "Stage 3: 256K Cooldown Adaptation",
    tokens: "256K",
    tokenCount: 262144,
    phase: "Cooldown",
    description: "Cooldown extends context to 256K tokens with synthetic long-document tasks.",
    whatChanges: "Cosine learning rate schedule anneals towards minimum while training on synthesized multi-hop and scattered-evidence long documents.",
    kdaMemoryImpact: "Recurrent state matrix S_t remains fixed-size [96 heads, d_k × d_v] (O(1)).",
    mlaMemoryImpact: "Latent KV-cache records scale 32× compared to 8K stage.",
  },
  {
    stage: 4,
    title: "Stage 4: 1M Native Long Context",
    tokens: "1M",
    tokenCount: 1048576,
    phase: "Cooldown",
    description: "Final cooldown reaches native 1M-token context window without any positional encoding modifications.",
    whatChanges: "NoPE in MLA + implicit recurrent decay in KDA allows direct sequence extrapolation to 1M without YaRN or RoPE frequency tuning.",
    kdaMemoryImpact: "Recurrent state matrix S_t remains fixed-size [96 heads, d_k × d_v] (O(1)).",
    mlaMemoryImpact: "Latent KV-cache records scale 128× compared to 8K stage (1,048,576 / 8,192).",
  },
];

export const MOPD_TEACHER_DOMAINS = [
  { id: "general_tasks", label: "General Tasks", desc: "General experience, vision, reasoning, faithfulness, search, and knowledge work" },
  { id: "general_agents", label: "General Agents", desc: "Long-horizon assistant tasks, deep research, and paragraph-level synthesis" },
  { id: "coding_agents", label: "Coding Agents", desc: "Software engineering (SWE), coding experience, GPU kernel development, and web dev" },
];

export const MOPD_EFFORT_LEVELS = [
  { id: "low", label: "Low Effort", desc: "Concise direct answers with minimal chain-of-thought overhead" },
  { id: "high", label: "High Effort", desc: "In-depth multi-step reasoning and intermediate reflection" },
  { id: "max", label: "Max Effort", desc: "Full-budget exploration, tool calls, and sandboxed test validation" },
];
