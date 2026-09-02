# Qwen3.8 工作流与动画详细规格

> 状态：待确认方案
>
> 本文补充 `website-plan.md` 中的工作流细节。所有没有被官方模型卡直接给出的内部数值，都必须在产品中标记为“教学示意”。

## 1. 用户最终要看懂什么

用户完成学习后，应能用自己的话解释：

```text
一个输入 Token 先变成 hidden representation，
经过三个 Gated DeltaNet 层压缩和更新历史状态，
再经过一个 Gated Attention 或 QSA 层选择上下文，
然后通过 Dense FFN 或稀疏 MoE 更新表示，
重复这个 4 层周期，最后进入 LM Output；27B 和 2.4T-A95B 的 MTP 只作为多步训练说明，Flash-Next 再单独说明其公开的推测解码支持。
```

这段话是教学主线。它不表示每个模型的所有外围实现都完全相同。

## 2. 全部组件的职责

### 2.1 Text input

用户输入的字符串首先成为文本序列。页面只需要展示几个带语义的 Token，例如：

```text
"The cat sat" → ["The", " cat", " sat"]
```

不要在没有官方 Tokenizer 证据时硬编码真实分词边界或词表 ID。动画中的 Token 只用于说明序列位置。

### 2.2 Token embedding

每个离散 Token 被查表转换成 hidden vector：

```text
token id → embedding lookup → h₀ ∈ Rᵈ
```

页面中需要说明：

- Token 是语言模型处理的离散输入单位；
- Embedding 把离散符号映射为连续向量；
- `d` 由当前模型的 hidden dimension 决定；
- Embedding 不是 Gated DeltaNet 的 recurrent state，也不是 MoE expert。

27B、2.4T-A95B 和 Flash-Next 的 Embedding 输出都要进入对应模型的语言主干，但 Flash-Next 还存在额外的 N-gram Embedding 路径。

### 2.3 Vision encoder boundary

27B 和 Flash-Next 支持图像和视频。教学页面只展开到以下边界：

```text
image / video
       ↓
vision encoder
       ↓
visual representation
       ↓
language sequence
```

详细步骤：

1. 用户上传图像或视频。
2. Vision Encoder 抽取视觉表示。
3. 视觉表示被整理为可以与文本序列共同处理的表示。
4. 文本和视觉表示一起进入语言模型主干。

视觉 Encoder 内部的 patch、帧采样、temporal pooling 和融合层，如果没有官方资料支撑，应显示为锁定的“未展开”模块，不能伪造具体算子。

2.4T-A95B 的开放模型视图不显示 Vision Encoder，因为官方模型卡将其描述为 Causal Language Model。

### 2.4 Hidden state

每一个主干层都接收一个序列 hidden state：

```text
H = [h₁, h₂, ..., hₙ]
```

其中每个 `hₜ` 的宽度是当前模型的 hidden dimension：

- 27B：5120；
- 2.4T-A95B：8192；
- Flash-Next：2560。

动画要区分：

- `hₜ`：当前 Token 的表示；
- recurrent state：Gated DeltaNet 为历史维护的状态；
- KV 或 sparse context：Attention/QSA 用于上下文交互的路径。

不能把三者画成同一个“缓存盒子”。

## 3. 一个完整的 4 层周期

### 3.1 周期结构

Qwen3.8 公开模型卡给出了明确的层布局：

```text
Layer 1: Gated DeltaNet → FFN / MoE
Layer 2: Gated DeltaNet → FFN / MoE
Layer 3: Gated DeltaNet → FFN / MoE
Layer 4: Gated Attention 或 QSA → FFN / MoE
```

周期数量：

| 模型 | 周期 | 每周期层数 | 总层数 |
|---|---:|---:|---:|
| 27B | 16 | 4 | 64 |
| 2.4T-A95B | 23 | 4 | 92 |
| Flash-Next | 12 | 4 | 48 |

动画应把四个节点显示成同一组周期，并在模型切换时更新周期总数。不要把“3 个 GDN”解释成 3 个专家；它们是 3 个语言模型层。

### 3.2 层内通用工作流

每个层可以用以下教学流程表示：

```text
输入 hidden state Hˡ
        ↓
当前层的序列建模算子
        ↓
当前层的 FFN 或 MoE
        ↓
输出 hidden state Hˡ⁺¹
```

具体归属：

- 前三层使用 Gated DeltaNet；
- 第四层使用 Gated Attention 或 QSA；
- 27B 的后半部分是 Dense FFN；
- 2.4T-A95B 和 Flash-Next 使用 MoE；
- Flash-Next 还会展示 Gated Residual 相关路径。

## 4. Gated DeltaNet 的详细工作流

### 4.1 概念

Gated DeltaNet 提供高效的历史路径。对当前 Token 来说，它不需要重新把整段历史逐项展开，而是通过门控更新 recurrent state：

```text
历史状态 Sₜ₋₁ + 当前输入 hₜ
              ↓
        delta update + gate
              ↓
            Sₜ
```

### 4.2 动画步骤

动画拆成四步：

1. **Read current token**：高亮当前 `hₜ`。
2. **Project signals**：显示当前输入产生更新信号；不展示未经公开的内部矩阵数值。
3. **Apply gated delta update**：用一条带门控的 delta 箭头把 `Sₜ₋₁` 更新为 `Sₜ`。
4. **Carry recurrent state**：将 `Sₜ` 传递到下一个 Token。

### 4.3 初学者示例

输入：

```text
"The cat sat on the mat"
```

当处理 `mat` 时：

- 早先的 Token 不需要都以可见节点重新连到 `mat`；
- 它们对当前序列的部分信息已经被 GDN 路径压缩到 recurrent state；
- 当前 Token 通过门控 delta 更新这个状态；
- 下一位置继续读取更新后的状态。

这不是说所有历史信息都被无损保存，也不是说 GDN 等同于普通 Attention。动画应使用“压缩历史路径”而不是“完整记忆”。

### 4.4 头数展示

GDN 头数必须随模型变化：

- 27B：48 V heads / 16 QK heads，head dimension 128；
- 2.4T-A95B：128 V heads / 16 QK heads，head dimension 128；
- Flash-Next：48 V heads / 16 QK heads，head dimension 128。

建议做一个“Head view”开关：默认显示少量教学头，展开时显示官方头数，但明确写“视觉缩略图”。

## 5. Gated Attention 的详细工作流

### 5.1 概念

Gated Attention 是四层周期中的精确上下文交互层：

```text
当前 query
    ↓
与候选上下文交互
    ↓
得到加权上下文
    ↓
更新 hidden state
```

它与 Gated DeltaNet 的职责不同：

- GDN：以 recurrent state 路径高效携带历史；
- Gated Attention：进行更直接的上下文选择和内容交互。

### 5.2 头数示例

- 27B：24 Q heads / 4 KV heads，head dimension 256；
- 2.4T-A95B：64 Q heads / 4 KV heads，head dimension 256。

动画可以将每个 Q head 画成查询者，将 KV head 画成共享的上下文来源，并解释“头数不同”不等于每个 Q head 都拥有独立 KV head。

### 5.3 示例

输入：

```text
"Alice gave Bob the key because he needed it. Who needed the key?"
```

动画可以让当前 query 在 `Alice`、`Bob`、`key` 和 `needed` 之间移动，显示当前层正在进行内容相关的上下文交互。

该注意力分布是教学示意，不应标记为 Qwen3.8 的真实 attention heatmap。

## 6. Qwen Sparse Attention 的详细工作流

QSA 只在 Flash-Next 分支显示。

### 6.1 为什么需要 QSA

长上下文中，如果每个 query 都对所有 Token 做完整注意力，计算成本会快速增加。QSA 的教学主线是：

```text
长序列
  ↓
轻量 Indexer
  ↓
按 micro-block 筛选重要上下文
  ↓
对筛选结果做稀疏注意力
```

### 6.2 官方参数的展示

Flash-Next 模型卡给出了：

- 24 Q heads / 2 KV heads；
- head dimension 256；
- Indexer 为 4 Query heads / 1 Shared Key head；
- budget 为 512 blocks 或 2048 tokens。

动画用 8–12 个块缩略展示，旁边写：

```text
visual demo: reduced number of blocks
official budget: 512 blocks / 2048 tokens
```

不能让用户误解为模型永远只读取 2048 个 Token，也不能把 QSA 画成普通 dense attention 的换色版本。

### 6.3 长上下文示例

输入是一份长报告，当前问题是：

```text
"第 18 节中的结论与第 2 节的假设是否一致？"
```

动画：

1. 把文档切成多个 micro-block；
2. Indexer 对块进行轻量筛选；
3. 被选中的块亮起；
4. QSA 在被选块上进行后续上下文交互；
5. 当前 query 得到聚合结果。

## 7. FFN 与 MoE 的详细工作流

### 7.1 27B Dense FFN

27B 使用 Dense FFN。教学流程：

```text
hₜ
 ↓
FFN projection / activation / projection
 ↓
更新后的 hₜ
```

每个 Token 都经过同一套 FFN。页面要强调：

```text
27B total params = 27B activated params
```

这里的“同一套”是指共享的 Dense 路径，不表示所有 Token 的输出相同。

### 7.2 MoE Router

2.4T-A95B 和 Flash-Next 使用 MoE。教学流程：

```text
当前 Token hₜ
       ↓
Router scores
       ↓
从 512 个专家中选择
       ↓
10 个 routed experts + 1 个 shared expert
       ↓
weighted merge
       ↓
更新后的 hₜ
```

要同时显示：

- 512：专家总数；
- 10：每个 Token 的路由专家数；
- 1：共享专家数；
- 95B：2.4T-A95B 的激活参数规模；
- 6B：Flash-Next 主模型的激活参数规模。

### 7.3 MoE 示例

输入：

```text
"Implement a binary search tree and explain its complexity."
```

动画不应声称某个专家“就是编程专家”，因为官方没有披露专家语义。正确的展示是：

1. 当前 Token 进入 Router；
2. Router 产生候选分数；
3. 亮起少量 routed experts；
4. shared expert 同时参与；
5. 各路结果加权合并。

专家名称使用 `E₁`、`E₂` 等中性编号，不要伪造专家功能标签。

## 8. Gated Residual 的详细工作流

Gated Residual 只在 Flash-Next 分支显示。

官方模型卡给出：4 个分支、Bottleneck Rank 320。教学动画可以这样解释：

```text
输入 hidden state
    ├─ branch 1 ─┐
    ├─ branch 2 ─┤
    ├─ branch 3 ─┼─ gated merge → next hidden state
    └─ branch 4 ─┘
```

动画分三步：

1. hidden state 分到 4 路 residual branch；
2. read gate 决定读取哪些信息；
3. write gate 决定每一路写回多少，再合并到下一个状态。

必须标注：这是 Flash-Next 的组件说明；不能把它改名成所有 Qwen3.8 模型共有的普通 residual 结构。

## 9. N-gram Embedding 的详细工作流

N-gram Embedding 只在 Flash-Next 分支显示。

示例：

```text
Token[i−1], Token[i]             → bigram lookup
Token[i−2], Token[i−1], Token[i] → trigram lookup
```

工作流：

1. 取当前 Token 附近的局部 n-gram；
2. 用 n-gram 查表；
3. 把得到的额外表示合并到模型表示路径；
4. 与主模型计算并行或按实现方式衔接。

Flash-Next 模型卡给出第二层使用 20,000,000 个 bigram/trigram 表项。这个数字应显示在 Technical view，而 Beginner view 只显示“局部上下文查表”。

## 10. Residual 与周期之间的关系

页面需要区分三种概念：

1. **层内输出**：某个 GDN/Attention 和 FFN/MoE 完成后的结果；
2. **周期输出**：四层周期完成后的 hidden state；
3. **Flash-Next Gated Residual**：Flash-Next 明确新增的多路门控残差组件。

不要把四层周期画成四条彼此独立、最后才合并的分支。正确视觉语义是：

```text
layer 1 output → layer 2 input → layer 3 input → layer 4 input → next cycle
```

## 11. MTP 与 LM Output

### 11.1 主输出

主语言模型输出可以用以下教学路径表示：

```text
final hidden state
       ↓
LM output projection
       ↓
next-token logits
       ↓
sampling / selected token
```

### 11.2 MTP

27B 和 2.4T-A95B 模型卡只披露了多步 MTP（Multi-Token Prediction）训练；它们应显示为训练说明。Flash-Next 另外明确给出一个 MTP layer，并在公开部署资料中说明推测解码支持；只有 Flash-Next 可以将后者作为推理机制说明。所有模型都不应把 MTP 画成主干之后固定数量的输出分支：

```text
27B / 2.4T-A95B：多步训练说明
Flash-Next：多步训练说明 + 有来源支持的推测解码说明
```

需要写清楚：

- 27B 和 2.4T-A95B 的模型卡只说明多步 MTP 训练，没有要求页面画出 `t+1/t+2/t+3` 这类固定三分支；
- Flash-Next 的 “1 layer” 是模型卡披露的组件信息，应在 Technical view 单独标注；
- 只有 Flash-Next 可以在有来源支持时说明 MTP 与推测解码的关系；MTP 与主 LM Output、普通 sampling 或 top-p 不是同一个机制；
- 不把 MTP 画成替代主干 Transformer 的独立推理路径。

## 12. 推理与用户可见行为

### 12.1 Thinking mode

Qwen3.8 的 thinking 行为应单独放在推理控制层：

```text
user request
     ↓
reasoning_effort / enable_thinking
     ↓
reasoning content
     ↓
final answer
```

### 12.2 preserve_thinking

多轮对话示例：

```text
Turn 1: 设计一个数据结构方案
Turn 2: 保留之前的推理上下文，继续优化方案
```

动画可以显示历史 reasoning context 被保留或不保留的两条路径，但不能把它画成模型权重发生变化。

### 12.3 reasoning_effort

用 Low / Medium / Xhigh 三档展示推理预算差异：

- Low：更快开始回答；
- Medium：折中；
- Xhigh：给复杂任务保留更深的推理空间。

必须说明：这是 API 行为控制，不是改变层数、hidden dimension 或专家总数。

## 13. 三个完整示例

### 示例 A：27B 文本问题

输入：

```text
"Why does a binary search run in O(log n)?"
```

逐步动画：

1. 文本变为教学 Token 序列；
2. Token 查 Embedding 表得到 hidden vectors；
3. 每个 4 层周期中，前三层用 GDN 携带历史；
4. 第四层用 Gated Attention 选择与“二分、区间、折半”相关的上下文；
5. 27B 使用 Dense FFN 更新 Token 表示；
6. 重复 16 个周期，共 64 层；
7. LM Output 产生下一个 Token 的 logits；
8. reasoning control 决定是否展示更深的推理过程。

页面提示：27B 的“27B”不是每个 Token 都在 27B 个专家之间路由，它是 Dense 模型。

### 示例 B：2.4T-A95B 文本问题

输入：

```text
"Review this API design and suggest failure handling." 
```

逐步动画：

1. Token Embedding 产生 8192 维 hidden state；
2. GDN 通过 recurrent state 处理当前序列；
3. Gated Attention 在每个周期的第四层进行内容交互；
4. MoE Router 从 512 个专家中选择 10 个 routed experts；
5. 1 个 shared expert 同时参与；
6. 路由结果加权合并；
7. 重复 23 个周期，共 92 层；
8. 最后进入 LM Output；27B 和 2.4T-A95B 的 MTP 只作为多步训练说明，Flash-Next 再单独说明其公开的推测解码支持。

页面提示：2.4T 是总容量，95B 是官方给出的激活参数规模，不代表每个 Token 执行全部 2.4T。

### 示例 C：Flash-Next 多模态长上下文

输入：

```text
[一段长视频] + "找出第一个实验结果和最终结论之间的变化。"
```

逐步动画：

1. 视频先进入 Vision Encoder，得到视觉表示；
2. 文本和视觉表示组成语言序列；
3. GDN 路径压缩序列历史；
4. QSA Indexer 将长序列组织成 micro-block；
5. QSA 筛选重要 block，再对筛选结果进行稀疏注意力；
6. MoE Router 在 512 个专家中选择 10 个 routed + 1 个 shared；
7. 4-way Gated Residual 控制跨层信息写回；
8. N-gram Embedding 提供局部 Token 上下文查表路径；
9. 重复 12 个周期，共 48 层；
10. 输出进入 LM Output；Flash-Next 的 MTP 推测解码支持单独说明，并根据 reasoning_effort 控制推理深度。

页面提示：这是 Flash-Next 的实验性架构预览，不是 27B 或 2.4T-A95B 的完整共同结构。

## 14. 动画状态机

每个详细动画建议使用同一套状态：

```text
idle
  ↓ play
input-visible
  ↓ next
operator-processing
  ↓ next
capacity-processing
  ↓ next
cycle-output
  ↓ next
complete / replay
```

状态必须显示在文字说明中，而不是只用颜色表达。用户可以：

- Play / Pause；
- Next step / Previous step；
- Replay；
- 切换模型；
- 键盘操作；
- 打开 Technical details。

模型切换时应重置动画到 `idle`，避免上一模型的专家数、头数或模块名称残留。

## 15. 组件与来源标注

| UI 组件 | 默认信息层级 | 来源标签 |
|---|---|---|
| Model selector | Beginner | Official model card |
| 4-layer cycle | Beginner | Official model card |
| GDN state animation | Beginner | Teaching abstraction |
| Q/KV head comparison | Technical | Official model card |
| MoE router | Beginner → Technical | Official model card + teaching abstraction |
| QSA indexer | Technical | Flash-Next model card / report |
| Gated Residual | Technical | Flash-Next model card / report |
| N-gram lookup | Technical | Flash-Next model card |
| MTP | Beginner → Technical | Official model card |
| Reasoning control | Beginner | Official model card |
| Vision Encoder internals | Collapsed | Not fully disclosed |

## 16. 完成标准

页面只有在以下问题都能回答时才算完成：

1. 用户能指出三个模型的 4 层周期差异。
2. 用户能解释 GDN 和 Gated Attention 的职责差异。
3. 用户能解释 27B Dense 与 2.4T-A95B MoE 的计算差异。
4. 用户能说明 QSA、Gated Residual 和 N-gram Embedding 只属于 Flash-Next 分支。
5. 用户能区分 hidden state、recurrent state、KV/context path 和专家输出。
6. 用户能从一个输入示例跟随 Token 到最终输出。
7. 用户能看出哪些动画是官方配置、哪些是教学示意。
