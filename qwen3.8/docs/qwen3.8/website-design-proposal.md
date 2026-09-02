# Qwen3.8 Architecture Explorer 网站设计提案

> 状态：已根据 tester review 修订，并获得 tester agreement；实现中的行为以本提案与验收矩阵为准。
>
> 目标：让已经知道 Token、Embedding、Attention、FFN 和基本 Transformer 的初学者，能够跟随一个输入，理解 Qwen3.8 三条模型路线如何处理上下文、容量和输出。

## 1. 设计原则

1. 先用“输入 → 表示 → 一个层 → 输出”的 Guided entry 讲清 Token 流，再展示参数表；避免让 27B、2.4T 和 125B 变成唯一的故事。
2. 用同一个模型选择器比较三条路线，但所有数字和可用动画都由当前模型配置驱动。
3. 把官方事实、配置可见信息和教学抽象分开标注。
4. 动画表达职责和数据流，不伪造真实 attention heatmap、recurrent state 或视觉 Encoder 内部激活。
5. 每个页面都能回到“当前选中的模型”，但不强迫初学者同时理解所有细节。

## 2. 用户完成学习后的目标

用户应该能回答：

- 27B 为什么是 Dense，而 2.4T-A95B 和 Flash-Next 为什么使用 MoE；
- 三个模型的 `3 × Gated DeltaNet 层 + 1 × Gated Attention/QSA 层` 如何组成并重复一个四层周期；
- Gated DeltaNet、Gated Attention、QSA 和 MoE 各自负责什么；
- 为什么“总参数”和“每 Token 激活参数”不是同一个数字；
- 为什么 2.4T-A95B 不应显示视觉输入，而 27B 和 Flash-Next 可以；
- 哪些画面是教学示意，而不是一次真实推理的内部数据。

## 3. 页面与主要交互

### Series overview

首屏先提供 Guided entry：用户跟随一个简短输入，看到 Token、hidden representation、一个混合层和 LM Output。用一句话解释：hidden representation 是“模型在当前位置对 Token 的连续向量表示”，recurrent state 是“GDN 携带历史信息的状态”，MTP 是“训练时让模型预测多个后续位置的机制”。引导完成后再展示三张模型卡和一张对照表：模型类型、参数组成、激活参数、层数、hidden dimension、模态和原生上下文。点击模型卡后，页面中的所有相关数字、颜色和模块同步更新。

首屏只讲一个结论：Qwen3.8 不是同一个 Transformer 的三个尺寸，而是三种不同的容量与上下文设计。

### Architecture map

用四个连续节点展示一个周期：

```text
GDN → FFN/MoE → GDN → FFN/MoE → GDN → FFN/MoE → Attention/QSA → FFN/MoE
```

滑块选择当前语言模型层，显示周期编号、层位置、当前序列算子和对应 FFN/MoE。节点视觉大小只表示流程位置，不表示真实张量大小。

### Operator lab

用三个可逐步播放的教学实验：

- Gated DeltaNet：`Sₜ₋₁ + hₜ → gated delta update → Sₜ`；标注为 recurrent-state 教学示意；
- Gated Attention / QSA：27B 与 2.4T 展示内容交互，Flash-Next 展示 Indexer、micro-block 和稀疏选择；
- MoE Router：展示 `512 experts → 10 routed + 1 shared → weighted merge`，专家编号保持中性。

Flash-Next 额外显示三个折叠面板：4-way Gated Residual、20M-entry N-gram Embedding、Muon + AdamW。只有 Flash-Next 可以打开这些面板。

### Training & inference

分成两条明确的线：

- 训练机制：27B/A95B 的 MTP 多步训练和 Flash-Next 的优化说明；Flash-Next 才可在有来源支持时说明推测解码；MTP 不画成固定数量的 `t+1/t+2/t+3` 输出分支；
- 使用行为：thinking mode、`reasoning_effort`、`preserve_thinking` 和服务版本边界。

`reasoning_effort` 只改变教学中的行为预算说明，不能让用户以为层数、hidden dimension 或专家数发生变化。

### Sources & boundaries

显示每个数字的来源、来源日期和证据等级。证据标签固定为：`Official model card`、`Official technical report`、`Configuration-visible`、`Teaching abstraction`、`Not disclosed`。

页面末尾明确说明：Qwen3.8-Max / Qwen3.8-Flash 是服务版本，服务功能不能直接写入开放权重架构图。

## 4. 视觉系统

- 背景：深色技术展览风格；
- 青色：GDN / recurrent path；
- 紫色：Gated Attention / QSA / selective path；
- 黄色：MoE / capacity / Flash-Next additions；
- 每个教学动画同时提供文字步骤、暂停、上一步、下一步和重播；
- 所有交互使用原生 `button`、`input[type=range]`、`details` 或等价语义控件；Tab 顺序与视觉顺序一致；
- 当前步骤通过可见文字和 `aria-live="polite"` 通知，不依赖颜色；状态文本与背景组合达到 WCAG AA 对比度；
- `prefers-reduced-motion` 下停用自动移动和闪烁，保留静态图与步骤控制；
- 移动端使用带可见标题、焦点可达和键盘可操作的 bounded horizontal-scroll 容器，不缩小到无法阅读；
- 所有控件有清晰的焦点状态和可见标签。

Kimi K3 资料只作为样式参考。Qwen3.8 页面不得出现 KDA、AttnRes、MLA、MoonViT 或 Kimi 专属参数。

## 5. 单一事实数据源

实现时建立一个 `ModelProfile` 数据源，至少包含：

```text
identity: name, releaseType, sourceUrl, verifiedAt
scale: backboneParams, ngramParams, mtpParams, totalParams, activeParams, hiddenDim, layers, cycleCount
sequence: deltaNet, attentionOrQsa, cycleLayout
capacity: denseOrMoe, experts, routedExperts, sharedExperts
input: text, image, video
extras: mtp, gatedResidual, ngramEmbedding, optimizer
evidence: claimId, sourceUrl, evidenceLevel, note
```

UI 不应在组件中重复硬编码模型数字。`totalParams` 对 27B/A95B 表示主模型参数量；对 Flash-Next 不应显示一个未解释的单一总数，而应分别显示 `backboneParams=125B`、`ngramParams=51B`、`mtpParams=4B` 和 `activeParams=6B main model`。若实现需要计算总和，只能标为“已列出组件合计 180B”，不能称为主模型大小；`activeParams` 只表示主模型每 Token 激活量。`evidence` 字段必须能回到 `architecture-facts.md` 和 `official-sources.md` 的对应条目；在线链接变化时更新 `verifiedAt`，不能静默覆盖旧结论。

## 6. 内容边界

可直接展示的事实包括模型卡明确给出的层数、hidden dimension、头数、专家数、上下文长度和布局。以下内容必须显示为教学抽象或未公开：

- GDN 的真实状态张量和每次推理的状态变化；
- 真实 attention 分布、Router 概率和专家语义；
- 视觉 Encoder 的未披露内部层级；
- 完整训练数据、RL 环境和服务后端实现。

特别注意：27B 与 2.4T 的第四层是 Gated Attention；只有 Flash-Next 的第四层是 QSA。`512 blocks / 2048 tokens` 是 QSA 的官方预算，不应画成所有长文本永远只保留 2048 个 Token。

## 7. MVP 验收标准

### 内容

- 三个模型可从一个入口切换；
- 初学者能在 30 秒内看出 Dense、MoE、视觉输入和 Flash-Next 增量组件的差异；
- GDN、Attention/QSA、MoE、MTP 和输入路径各有一个可逐步理解的画面；
- 每个非示意数字都能从来源页追溯；
- 服务版本与开放权重边界清晰。

### 交互

- 切换模型后没有残留的数字、模块或专家状态；
- 不适用的 Operator 不显示；
- Architecture Map 滑块、周期编号和当前层说明始终一致；
- 所有动画可暂停、重播和键盘操作；
- 窄屏下核心架构图和表格仍可读。

### 可执行测试矩阵

| 范围 | 必测断言 |
|---|---|
| Routes | `/overview`、`/architecture`、`/operators`、`/training`、`/sources` 可直接打开并刷新；模型选择通过 URL query 或 hash 可分享并恢复 |
| Model switch | 27B、A95B、Flash-Next 各切换一次；数字、模块、模态和可用 Operator 全部更新，动画步骤和专家状态重置 |
| Architecture map | slider 的最小值为 1、最大值为当前模型层数；`cycle=floor((layer-1)/4)+1`、`position=((layer-1)%4)+1`；最后一层显示 Attention 或 QSA |
| Operators | GDN、Attention/QSA、MoE（仅适用模型）逐步执行；步骤文字、按钮状态和画面同步；Flash-Next 的 QSA budget 与额外组件可见 |
| MTP | 27B/A95B 只显示模型卡披露的多步训练；Flash-Next 才可显示有来源支持的推测解码；不出现未经来源支持的固定分支数量；LM Output 单独存在 |
| Keyboard / screen reader | Tab 顺序、Enter/Space、方向键 slider、焦点可见、步骤 `aria-live`、图表等价文本均通过检查 |
| Motion / viewport | reduced motion 无自动动画；窄屏无核心信息裁切，横向滚动容器可用且有标题 |

滑块和动画状态的每项测试都应覆盖 27B、2.4T-A95B 和 Flash-Next 三个 profile。

### 评审门槛

1. tester review 本提案，并指出内容、教学顺序、准确性或可用性问题；
2. 根据反馈修订文档；
3. tester 明确同意 MVP 范围后，才开始修改 React/CSS；
4. 实现完成后再由 tester 做交互和内容验收。

## 8. 相关文档

- [系列架构事实表](./architecture-facts.md)
- [面向初学者的交互展示设计](./interactive-design.md)
- [工作流与动画详细规格](./working-flow-and-animation-spec.md)
- [准确性边界与待核实项](./accuracy-boundaries.md)
- [官方资料与引用](./official-sources.md)
- [现有网站方案](./website-plan.md)
