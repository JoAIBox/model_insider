# Kimi K3 技术资料库 (Kimi K3 Tech Library)

Kimi K3 (2.8T MoE, 104B active, 1M context) 官方发布资料的本地归档。收集于 2026-08-01。

**核心规格速览**: 93 层 (1 dense + 69 KDA + 24 Gated MLA) | 896 专家激活 16 | 2 共享专家 | hidden 7168 | 96 heads | 160K vocab | MoonViT-V2 视觉编码器 (401M) | MXFP4/MXFP8 量化 | 相对 Kimi K2 扩展效率提升 ~2.5×

---

## 📁 目录结构

```
docs/
├── README.md                        ← 本索引
├── tech_report/                     ← 官方技术报告 (主文档)
│   ├── k3_tech_report.pdf           官方 GitHub 版 PDF (47 页)
│   └── k3_latex_source/             arXiv 版 LaTeX 源码 (按章节拆分)
├── papers/                          ← 关联论文 PDF (全部 arXiv 官方版)
└── official/ + infra/               ← 官方 README / 许可证 / 博客 / 基础设施文档
```

---

## 📄 技术报告 (Tech Report)

| 文件 | 说明 | 来源 |
|---|---|---|
| `tech_report/k3_tech_report.pdf` | Kimi K3 技术报告 (47 页, GitHub 版, 引用编号与 arXiv v1 略有差异) | https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf |
| `tech_report/k3_latex_source/` | 同报告 LaTeX 源码: 2-架构/3-预训练/4-后训练/5-基建/6-评测/7-案例 + `main.tex`/`references.bib` | https://arxiv.org/e-print/2607.24653 |
| `papers/kimi_k3_arxiv_2607.24653.pdf` | arXiv v1 版 PDF (带 arXiv 页眉) | https://arxiv.org/abs/2607.24653 |

## 📚 关联论文 (Papers, arXiv 官方 PDF)

| 文件 | 论文 | arXiv |
|---|---|---|
| `kimi_linear_kda_2510.26692.pdf` | Kimi Linear (提出 KDA 增量注意力, 3:1 混合, 6.3× 解码加速) | https://arxiv.org/abs/2510.26692 |
| `attention_residuals_2603.15031.pdf` | Attention Residuals (注意力残差, <2% 成本换 ~25% 训练效率) | https://arxiv.org/abs/2603.15031 |
| `kimi_k2_2507.20534.pdf` | Kimi K2 技术报告 (前代基线) | https://arxiv.org/abs/2507.20534 |
| `kimi_k2_5_2602.02276.pdf` | Kimi K2.5 (Visual Agentic Intelligence) | https://arxiv.org/abs/2602.02276 |
| `kimi_k1_5_2501.12599.pdf` | Kimi k1.5 (RL 强化学习里程碑) | https://arxiv.org/abs/2501.12599 |
| `kimi_vl_2504.07491.pdf` | Kimi-VL 技术报告 (视觉编码演进) | https://arxiv.org/abs/2504.07491 |

## 🏢 官方文档 (Official)

| 文件 | 说明 | 来源 |
|---|---|---|
| `official/kimi_k3_github_README.md` | GitHub 官方 README: 模型规格表 / 完整评测分数 / API 示例 / 部署指南 | https://github.com/MoonshotAI/Kimi-K3 |
| `official/kimi_k3_github_LICENSE.md` | Kimi K3 License (Modified-MIT 类, 商用有条件) | https://github.com/MoonshotAI/Kimi-K3/blob/main/LICENSE |
| `official/kimi_k3_huggingface_model_card.md` | Hugging Face 模型卡 (含量化/推理引擎说明) | https://huggingface.co/moonshotai/Kimi-K3 |
| `official/kimi_k3_official_blog.md` | 官方博客: 发布公告 + 能力介绍 + 案例 (MiniTriton 编译器/芯片) | https://www.kimi.com/blog/kimi-k3 |

## 🛠️ 基础设施开源项目 (Infra)

| 文件 | 项目 | 说明 |
|---|---|---|
| `infra/MoonshotAI_MoonEP_README.md` | MoonEP | 超大规模细粒度 MoE 专家并行通信库 |
| `infra/MoonshotAI_FlashKDA_README.md` | FlashKDA | KDA 高性能算子 (H20 上 prefill 比 flash-linear-attention 快 1.72-2.22×) |
| `infra/kvcache-ai_AgentEnv_README.md` | AgentEnv | 与 KVCache.ai 联合开发的 Agent 沙箱系统 (快照/恢复/分叉) |
| `infra/MoonshotAI_Kimi-Linear_README.md` | Kimi-Linear | KDA 架构开源仓库 (含 vLLM 集成) |
| `infra/MoonshotAI_Attention-Residuals_README.md` | Attention-Residuals | AttnRes 实现 + 训练/推理代码 |

---

## 🔗 在线资源 (未下载, 链接留档)

| 资源 | 说明 | 链接 |
|---|---|---|
| 模型权重 (HF) | 96 个 safetensors 分片, ~1.42 TiB — 体积过大, 未下载 | https://huggingface.co/moonshotai/Kimi-K3 |
| ModelScope 镜像 | 国内权重镜像 | https://modelscope.cn/organization/moonshotai |
| vLLM 部署配方 | 官方推理配置 | https://recipes.vllm.ai/moonshotai/Kimi-K3 |
| SGLang 部署 | Cookbook | https://docs.sglang.ai/ |
| API 快速开始 | platform.kimi.ai 文档 | https://platform.kimi.ai/docs/guide/kimi-k3-quickstart |
| API 定价 | 输入 $3 / 输出 $15 每百万 token | https://platform.kimi.ai/docs/pricing/chat-k3 |
| Kimi Code CLI | 推荐 Agent 框架 | https://www.kimi.com/code |

## 📌 备注

- `k3_tech_report.pdf` (GitHub 版) 与 arXiv v1 PDF 内容一致, 仅引用编号/排版不同; 本地项目原根目录的 `k3_tech_report.pdf` 已移入 `docs/tech_report/`。
- 所有 arXiv PDF 均为官方提交版本; LaTeX 源码来自 arXiv e-print。
- 资料更新时间: 2026-08-01; 权重发布日: 2026-07-27。
