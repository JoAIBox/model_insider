# Qwen3.8 Architecture Explorer 网站方案

> 状态：待确认方案
>
> 目标用户：了解 Token、Embedding、Attention、FFN 和基本 Transformer 概念，但不了解 Qwen3.8 系列架构的设计者。

## 1. 产品目标

用与 Kimi K3 页面相近的深色技术展览风格，制作一个“系列级”Qwen3.8 架构解释器。

重点不是复制 Kimi K3 的章节名称，而是让用户能够回答：

1. Qwen3.8-27B、Qwen3.8-2.4T-A95B 和 Qwen3.8-Flash-Next 分别是什么模型？
2. 模型规模变化时，深度、宽度、Dense/MoE、注意力和输入路径如何变化？
3. Gated DeltaNet、Gated Attention、QSA 和 MoE 分别解决什么问题？
4. 哪些内容是官方披露的事实，哪些只是为了理解而做的教学抽象？

## 2. 页面范围

### 一级导航

```text
01 Series Overview
   三个模型的共通点和差异

02 Architecture Map
   4 层重复周期、层数、hidden dimension 和输入路径

03 Operator Lab
   Gated DeltaNet / Gated Attention / QSA / MoE

04 Training & Inference
   MTP、thinking control、reasoning_effort、preserve_thinking

05 Sources & Boundaries
   官方来源、证据等级和未公开内容
```

### 二级导航原则

每个页面都保留当前模型选择器。切换模型后，参数、层数、头数、模态、FFN/MoE 和可用动画必须同步变化。

## 3. 全局模型数据结构

网站应使用一个数据驱动的模型配置，而不是在组件中散落模型名称和数字：

```text
ModelProfile
├─ identity
│  ├─ model name
│  ├─ release type: open weight / experimental preview / service
│  └─ source URL
├─ scale
│  ├─ total parameters
│  ├─ activated parameters
│  ├─ hidden dimension
│  └─ number of layers
├─ sequence modeling
│  ├─ Gated DeltaNet heads
│  ├─ Gated Attention or QSA heads
│  └─ repeating cycle count
├─ capacity path
│  ├─ Dense FFN or MoE
│  ├─ total experts
│  ├─ routed experts
│  └─ shared experts
├─ input path
│  ├─ text
│  ├─ image
│  └─ video
└─ extra components
   ├─ MTP
   ├─ Gated Residual
   └─ N-gram Embedding
```

## 4. 系列级架构叙事

### 共同骨架

```text
文本 Token / 视觉表示
          ↓
3 × Gated DeltaNet → FFN 或 MoE
          ↓
1 × Gated Attention 或 QSA → FFN 或 MoE
          ↓
下一周期 hidden state
          ↓
MTP / LM Output
```

这只是三类模型的共同教学入口，不能替代各模型的完整配置。

### 规模差异重点

必须明确展示“规模不是一个滑块”：

- `27B`：Dense，64 层，hidden 5120，使用共享 FFN；每个 Token 都走同一套 FFN。
- `2.4T-A95B`：MoE，92 层，hidden 8192，512 个专家；每个 Token 激活 10 个路由专家和 1 个共享专家。
- `Flash-Next`：48 层、hidden 2560，使用 QSA、MoE、Gated Residual 和 N-gram Embedding；它是效率方向的实验性架构预览。

模型卡中的“总参数”和“激活参数”必须并排出现，并解释二者不是同一个概念。

## 5. 动画设计

### 5.1 Family Selector

交互：用户点击三个模型卡片。

动画反馈：

- 当前模型颜色改变；
- 主架构图中的层数、周期数和最后一个序列模块改变；
- Dense / MoE / Vision 标签改变；
- 对应的关键技术标签出现或消失。

验收标准：切换模型后，页面任何数字和模块名称都不能残留上一个模型的信息。

### 5.2 Architecture Map

交互：Current Layer 滑块。

展示：

1. 当前位于第几个 4-layer cycle；
2. 当前层是 Gated DeltaNet 还是 Gated Attention/QSA；
3. 当前 FFN 是 Dense FFN 还是 MoE；
4. 当前模型的层数和周期数。

动画原则：只强调“周期如何重复”，不把节点的视觉大小当成真实张量大小。

### 5.3 Gated DeltaNet

分三步：

```text
Read current token
        ↓
Apply gated delta update
        ↓
Carry recurrent state
```

视觉表达：用 `Sₜ₋₁ → Sₜ` 表示状态更新，用短序列 Token 表示历史被压缩进状态。

必须标注：这是 recurrent-state 教学示意，不是官方发布的真实内部激活图，也不能画成普通 KV Cache。

### 5.4 Gated Attention / QSA

对于 27B 和 2.4T-A95B：

- 展示 Gated Attention 在周期末进行选择性内容交互；
- 分别显示对应模型的 Q/KV 头数，不能写死为一个模型的头数。

对于 Flash-Next：

- 显示轻量 Indexer；
- 显示 micro-block 选择；
- 展示 512 blocks / 2048 tokens budget；
- 不把 QSA 画成完整 dense attention 的简单颜色替换。

### 5.5 MoE Router

仅在 2.4T-A95B 和 Flash-Next 中显示：

```text
Token hidden state
        ↓
Router scores
        ↓
10 routed experts + 1 shared expert
        ↓
weighted merge
```

动画可将真实 512 个专家缩略成网格，但必须写明“专家网格为缩略图”。

### 5.6 Flash-Next 增量组件

只有选择 Flash-Next 时展开：

- QSA：micro-block 级上下文筛选；
- Gated Residual：4 个残差分支，展示 read/write gate；
- N-gram Embedding：用局部二元/三元 N-gram 查表增加容量；
- Muon + AdamW：放在训练/优化页面，不要放进推理主干图。

### 5.7 MTP 和推理控制

分离“训练机制”和“行为接口”：

- MTP：展示多个后续 Token 预测分支，说明它是模型卡披露的训练组件；
- `reasoning_effort`：展示推理深度的 API 控制示意；
- `preserve_thinking`：展示历史 reasoning context 的保留行为；
- 不把 reasoning effort 画成增加 Transformer 层数或改变 hidden dimension。

## 6. 视觉语言输入

27B 和 Flash-Next 显示：

```text
image / video → vision encoder → visual representation → language sequence
```

视觉 Encoder 默认折叠，只展示“Vision Encoder”边界和视觉表示进入语言模型的位置。除非资料中有明确证据，不展示具体 patch、temporal pooling 或融合层。

2.4T-A95B 的开放模型视图不显示视觉 Encoder。

## 7. 视觉和交互风格

可以参考 Kimi K3 的：

- 深色技术展览视觉；
- 侧边导航；
- 卡片、标签和 Operator Lab；
- SVG/CSS 轻量动画；
- Beginner / Technical 两种理解层级。

但 Qwen3.8 版本应使用自己的信息体系：

- 青色：Gated DeltaNet / recurrent path；
- 紫色：Gated Attention / QSA / selective path；
- 黄色：MoE / capacity / Flash additions；
- 每个数字旁显示模型名和来源层级。

## 8. 事实标注体系

每个模块或数字使用以下标签之一：

- `Official model card`：模型卡明确披露；
- `Official technical report`：技术报告披露；
- `Configuration-visible`：公开模型配置可见；
- `Teaching abstraction`：为了理解而简化；
- `Not disclosed`：当前公开资料没有完整说明。

不能出现以下表达：

- 把三个模型写成同一套层数或 head 配置；
- 把 Qwen3.8-Max 服务能力直接归因于开放权重；
- 把 Flash-Next 的实验性结构写成所有 Qwen3.8 模型共有；
- 用示意热力图声称是真实注意力分布；
- 用服务版上下文默认值替代开放模型的原生上下文值。

## 9. 实现阶段

### Phase 1：数据和骨架

- 建立单一 `ModelProfile` 数据源；
- 完成五个一级页面；
- 完成模型选择器和全局联动；
- 清除 Kimi K3 的产品、章节和术语残留。

### Phase 2：核心动画

- 4 层周期动画；
- GDN state update；
- Gated Attention / QSA selection；
- MoE Router；
- Flash-Next 独有组件。

### Phase 3：教学和准确性

- 增加 Beginner / Technical 展示层级；
- 每个数字加来源标签；
- 增加 Sources & Boundaries 页面；
- 对模型切换、窄屏和键盘操作做验收。

### Phase 4：发布前审核

- 逐项对照 `qwen3.8/docs/qwen3.8/architecture-facts.md`；
- 检查代码中不存在 Kimi K3 主叙事；
- 检查所有动画说明没有把教学抽象写成官方事实；
- 执行 lint、build 和浏览器功能测试。

## 10. 验收标准

### 内容

- 三个模型均可从同一入口访问；
- 模型规模差异可被初学者一眼看见；
- GDN、Attention/QSA、MoE、MTP 和 Flash-Next 增量组件均有解释；
- 27B 的视觉输入和 2.4T-A95B 的文本模型边界清晰。

### 交互

- 模型切换同步更新所有依赖数字；
- 不适用的 Operator 不显示；
- Architecture Map 的滑块与当前层说明同步；
- 动画支持暂停、重播或逐步操作；
- 键盘和窄屏可用，图表不会把核心信息裁掉。

### 准确性

- 所有公开数字可追溯到 `qwen3.8/docs/` 或官方链接；
- 所有示意数据有明确标签；
- 不使用 Kimi K3 专属 MLA、KDA、AttnRes、MoonViT 术语描述 Qwen3.8；
- 不把服务版本能力与开放权重架构混淆。

## 11. 参考文档

- [系列架构事实表](./architecture-facts.md)
- [官方资料与引用](./official-sources.md)
- [准确性边界](./accuracy-boundaries.md)
- [Qwen3.8 官方仓库](https://github.com/QwenLM/Qwen3.8)
