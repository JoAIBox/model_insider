# 面向初学者的交互展示设计

## 目标用户

假设用户已经知道 Token、Embedding、Attention、FFN 和 Transformer Block，但不了解 Gated DeltaNet、MoE、QSA 以及 Qwen3.8 的系列差异。

## 推荐页面结构

### 0. Guided entry

第一次进入时先用一个不超过四步的引导，让用户跟随同一个输入完成：

```text
输入 Token → hidden representation → 一个混合层 → LM output
```

引导结束后再进入系列比较。参数卡片和对照表仍然是总览的重要内容，但不应成为初学者看到的第一层概念。

### 1. 系列总览

开场先回答三个问题：

- 哪些模型是 Dense，哪些是 MoE？
- 哪些模型支持视觉输入？
- 哪些模块在三个模型之间相同，哪些模块只属于 Flash-Next？

引导完成后使用模型卡片切换，而不是只显示一个参数量，并在卡片上始终显示：

```text
参数总量 / 激活参数 / 层数 / 模型类型 / 是否多模态 / 原生上下文
```

卡片中的参数必须拆开标记 Flash-Next 的主模型、N-gram Embedding、MTP 和每 Token 激活参数，不能把它们合并成一个无法解释的总数。

### 2. 混合 Block 动画

默认展示一个四层周期。动画顺序应为：

1. 当前 Token 进入 Gated DeltaNet。
2. Gated DeltaNet 更新或压缩历史状态。
3. 进入 FFN 或 MoE。
4. 重复三次后进入 Gated Attention 或 QSA。
5. 输出下一周期的隐藏表示。

要明确告诉初学者：

- Gated DeltaNet 和 Gated Attention 都参与序列建模，但不是同一种注意力。
- “3 个 GDN + 1 个 Attention”是层布局，不是 3 个专家。
- 27B 使用 FFN，2.4T 和 Flash-Next 使用 MoE；参数激活方式不同。

### 3. Gated DeltaNet

建议动画同时显示两条信息流：

```text
当前输入 → 门控更新 → recurrent state
历史 Token ───────────→ 被压缩后的历史信息
```

不要把它画成普通 KV Cache，也不要直接宣称它等于某个固定大小的缓存。若具体状态大小未由模型卡说明，应使用“教学示意状态”。

### 4. Gated Attention

使用 27B 作为容易理解的示例：

```text
24 个 Query heads → 4 个 KV heads → 分组查询 → 加权上下文
```

动画中应解释 Q/KV 头数不同意味着 GQA 风格的共享，而不是 24 个 Q 头各自拥有独立的 KV 头。

### 5. MoE Router

使用 2.4T-A95B 或 Flash-Next 展示：

```text
Token hidden state
        ↓
Router
        ↓
10 个 Routed Experts + 1 个 Shared Expert
        ↓
加权合并
```

建议加入“总参数”和“本 Token 激活参数”的并排数字，避免初学者把 2.4T 理解成每个 Token 都完整执行 2.4T 参数。

### 6. QSA 与 Gated Residual

这两个模块只放在 Flash-Next 分支：

- QSA：先用轻量 Indexer 在 micro-block 粒度选取重要上下文，再进行稀疏注意力。
- Gated Residual：展示 4 路残差分支、逐元素 read gate 和按分支的 write gate。

QSA 的“512 blocks / 2048 tokens”应显示为官方模型卡给出的预算，不要画成所有序列永远只保留 2048 个 Token。

### 7. N-gram Embedding

使用局部二元或三元 N-gram 查表动画：

```text
Token[i-2], Token[i-1], Token[i] → trigram table
Token[i-1], Token[i]             → bigram table
```

重点解释“通过局部上下文查表增加容量”，不要将它画成标准 Token Embedding 的替换品。

### 8. 视觉输入

27B 和 Flash-Next 可以展示：

```text
图像 / 视频 → Vision Encoder → 视觉表示 → 语言模型序列
```

官方模型卡没有在该资料范围内完整披露视觉编码器的所有内部层级。因此视觉 Encoder 内部只能使用“未展开”或“教学抽象”标签，不能自行补充具体 patch、时间池化或融合层细节。

### 9. 推理控制

将以下概念单独放在“模型行为”页面，不要画进 Transformer Block：

- `reasoning_effort`：控制推理深度的接口参数。
- `preserve_thinking`：保留历史推理上下文的行为控制。
- Thinking / non-thinking 模式。
- MTP：27B/A95B 只展示模型卡披露的多步训练；Flash-Next 才可展示有来源支持的推测解码；应与逐层主干和 LM Output 分开，不要自行画出固定数量的预测分支。

### 10. 完整架构图

完整图建议默认折叠，提供三种视图：

1. Beginner：只显示输入、4 层周期和输出。
2. Technical：显示 head、hidden dimension、MoE 和 MTP 细节。
3. Compare：同时高亮三个模型之间新增、删除和替换的模块。

## 交互准确性检查清单

- 切换模型后，参数量、层数、模块名称和头数同时更新。
- Dense 模型不显示专家路由动画。
- 2.4T-A95B 不显示视觉编码器。
- QSA、Gated Residual、N-gram Embedding 只在 Flash-Next 视图出现。
- “激活参数”旁边始终显示解释。
- 上下文长度区分“原生支持”和“可扩展上限”。
- 所有教学矩阵、概率和 Token 数量都标注 toy / illustrative。
- 动画暂停、重播、键盘操作和窄屏横向查看都可用。
