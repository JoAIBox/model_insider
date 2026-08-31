# Model Insider

[![GitHub Repo](https://img.shields.io/badge/GitHub-JoAIBox%2Fmodel__insider-blue?logo=github)](https://github.com/JoAIBox/model_insider)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/Frontend-React%20%7C%20TypeScript%20%7C%20Vite-61dafb?logo=react)](https://react.dev/)

Model Insider is an interactive visual guide to modern large-model and native
multimodal architecture. The current implementation focuses on Kimi K3 and
turns reported architecture mechanisms into explorable diagrams, animations,
formula panels, and small teaching simulations.

The application UI is written in English. The README and local source archive
also make the evidence boundary explicit so that reported facts are not
confused with illustrative values used for teaching.

---

## Project goals

- Explain the data flow from text and vision inputs to autoregressive token
  generation.
- Make core operators inspectable: KDA, MLA, Block AttnRes, Stable LatentMoE,
  MoonViT-V2, RMSNorm, Per-Head Muon, and unembedding/sampling.
- Connect macro architecture, operator-level formulas, cache accounting,
  training stages, infrastructure, evaluation, and engineering case studies.
- Serve both beginners and technical readers without hiding the equations or
  silently presenting a teaching toy as an official implementation.

---

## Repository layout

```
model_insider/
├── README.md
├── LICENSE
└── kimi_k3/
    ├── src/
    │   ├── components/              React visualizations and simulators
    │   │   ├── beginner/            six guided beginner lessons
    │   │   ├── Dashboard.tsx        application shell and navigation
    │   │   ├── MacroArchitectureFlow.tsx
    │   │   ├── KDAOperatorDeepDive.tsx
    │   │   ├── MLAOperatorDeepDive.tsx
    │   │   ├── AttnResOperatorDeepDive.tsx
    │   │   ├── MoEOperatorDeepDive.tsx
    │   │   ├── MoonViTSimulator.tsx
    │   │   ├── MultimodalTokenSimulator.tsx
    │   │   ├── UnembeddingOperatorDeepDive.tsx
    │   │   └── ...
    │   └── App.tsx
    ├── docs/                         reports, model cards, and references
    ├── public/transformer-explainer/  optional interactive Transformer reference
    ├── package.json
    └── vite.config.ts
```

The current repository contains the Kimi K3 experience. Other model-specific
experiences are future extensions rather than completed modules.

---

## Kimi K3 learning path

The sidebar is organized as a guided path from an overview to the individual
operators and then to training and systems concerns:

- **Architecture Overview** — 93-layer hybrid backbone, repeated KDA/MLA
  cycles, AttnRes highways, MoE routing, and the output path.
- **Beginner Academy** — six short lessons covering tokens, attention, KDA,
  MoE, AttnRes, and the end-to-end pipeline with interactive steps.
- **KDA / Kimi Delta Attention** — recurrent state update, channel-wise
  retention, prediction residual, and fixed-size state behavior.
- **MLA / Multi-Head Latent Attention** — latent KV compression, absorbed
  projections, position/recency inputs, attention, and output merging.
- **Stable LatentMoE** — 896 routed experts, Top-16 routing, two shared
  experts, and Quick Balance bias adaptation.
- **Block AttnRes** — source sets, block-level aggregation, eight blocks across
  the 93-layer backbone, and the final partial block.
- **MoonViT-V2 and multimodal input** — patch features, 2×2 Pixel Shuffle,
  visual tokens, factorized spatial/temporal attention, and text/vision
  alignment.
- **RMSNorm, Per-Head Muon, and Unembedding** — normalization, optimizer
  updates, vocabulary logits, temperature, Top-p, cumulative probability, and
  sampling.
- **Pre-training, post-training, and reasoning** — context extension,
  multi-teacher on-policy distillation, RL/reasoning demonstrations, and
  speculative decoding.
- **Infrastructure, evaluation, and case studies** — cache accounting,
  pipeline scheduling, benchmark interpretation, safety evidence, API cost
  context, nano-KPU, and MiniTriton examples.

## Architecture facts and teaching conventions

The visualizations use the following reported K3 facts where applicable:

- 93 backbone layers: 69 KDA layers and 24 Gated MLA layers;
- 96 attention heads, 896 routed experts, Top-16 routing, and 2 shared experts;
- 3,584-dimensional latent MoE representation and a 160K vocabulary;
- 401M-parameter, 27-layer MoonViT-V2 with 14×14 patches and 2×2 Pixel
  Shuffle;
- progressive context curriculum: 8K → 64K in pre-training, then 256K → 1M
  during cooldown.

The page labels the status of information whenever it matters:

- **Official / reported** means the value is stated in the local report,
  model card, or official engineering material under `kimi_k3/docs/`.
- **Illustrative / toy** means the number or diagram is intentionally reduced
  for interaction, such as the 4×4 KDA state matrix or a normalized radar.
- **Undisclosed** means the public material does not provide the dimension or
  implementation detail; the application does not invent one.

### Context length and KV-cache accounting

The progressive context timeline is not only a sequence of numbers. It shows
why longer context changes memory pressure and why K3 combines KDA with MLA:

- At context length `N`, MLA retains a per-token latent KV record. Its logical
  cache count scales as `C_MLA(N) = N × 24 × d_c`, where the latent width
  `d_c` is not disclosed in the public materials.
- KDA retains a recurrent state `S ∈ R^(d_k × d_v)` for each attention head.
  Its logical state size is independent of `N`; the aggregate size scales with
  the number of KDA layers and heads. The interactive teaching table uses
  `C_KDA = 69 × d_k × d_v` as a layer-level illustrative term and does not
  invent the undisclosed head aggregation.
- A conventional full K/V cache grows with sequence length, approximately
  `C_fullKV(N) = N × L × 2 × H × d_h` for `L` layers and `H` heads.

The timeline exposes the published stages `8,192 → 65,536 → 262,144 →
1,000,000` tokens and their relative sequence-scaled cache records (`1×`,
`8×`, `32×`, and approximately `122.1×`). Byte figures shown in individual
panels are labeled as illustrative estimates, not total inference memory.
They must not be read as including all weights, activations, workspace, batch
effects, or both KDA and MLA unless the panel says so.

---

## Run locally

```bash
git clone git@github.com:JoAIBox/model_insider.git
cd model_insider/kimi_k3
npm install
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173/`.
For access from another device on the same network:

```bash
npm run dev -- --host 0.0.0.0
```

## Verification

Run the project-provided checks from `kimi_k3/`:

```bash
npm run lint
npm run build
```

`npm run build` performs the TypeScript check and production Vite build.

## Sources

The checked-in `kimi_k3/docs/` directory contains the K3 paper/report source,
official model-card and blog snapshots, related operator references, and
infrastructure notes used to write the teaching panels. The optional
Interactive Transformer reference is kept under
`kimi_k3/public/transformer-explainer/` and is not part of the main K3 path.

---

## Contributing and license

Issues and pull requests are welcome. When adding a technical visualization,
please distinguish reported facts, implementation details that are not public,
and teaching examples. Model Insider is released under the [MIT License](LICENSE).
