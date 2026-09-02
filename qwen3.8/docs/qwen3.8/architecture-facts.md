# Qwen3.8 系列架构事实表

## 1. 系列级比较

| 项目 | Qwen3.8-27B | Qwen3.8-2.4T-A95B | Qwen3.8-Flash-Next |
|---|---:|---:|---:|
| 模型类型 | Causal LM + Vision Encoder | Causal LM | Causal LM + Vision Encoder |
| 参数组成 | 27B | 2.4T | 125B 主模型 + 51B N-gram Embedding + 4B MTP |
| 每 Token 激活 | 27B | 95B | 6B 主模型激活 |
| 隐藏维度 | 5120 | 8192 | 2560 |
| 层数 | 64 | 92 | 48 |
| 层布局 | 16 × (3 × GDN→FFN + 1 × Gated Attention→FFN) | 23 × (3 × GDN→MoE + 1 × Gated Attention→MoE) | 12 × (3 × GDN→MoE + 1 × QSA→MoE) |
| 原生上下文 | 262,144 Token | 262,144 Token | 262,144 Token |
| 可扩展上下文 | 1,000,000 Token | 1,010,000 Token | 1,000,000 Token |
| 多模态 | 图像、视频 | 当前开放模型卡标为文本模型 | 图像、视频 |

> “每 Token 激活”对 MoE 模型表示路由计算中实际参与的模型参数；不是整个检查点大小。

## 2. Qwen3.8-27B

- Dense 模型，总参数约 27B。
- 隐藏维度：5120。
- Token Embedding 和 LM Output：248,320，含 Padding。
- 64 层，分为 16 个四层周期。
- 每个周期：

  ```text
  Gated DeltaNet → FFN
  Gated DeltaNet → FFN
  Gated DeltaNet → FFN
  Gated Attention → FFN
  ```

- Gated DeltaNet：48 个 V 线性注意力头、16 个 QK 头，头维度 128。
- Gated Attention：24 个 Q 头、4 个 KV 头，头维度 256。
- Rotary Position Embedding 维度：64。
- FFN 中间维度：17,408。
- 支持视觉输入，官方模型卡将其描述为原生视觉语言模型。
- 原生上下文长度为 262,144 Token，可扩展至 1,000,000 Token。
- 训练了多步 MTP（Multi-Token Prediction）。

## 3. Qwen3.8-2.4T-A95B

- 稀疏 MoE 模型，总参数约 2.4T，每 Token 激活约 95B。
- 隐藏维度：8192。
- Token Embedding 和 LM Output：248,320，含 Padding。
- 92 层，分为 23 个四层周期。
- 每个周期：

  ```text
  Gated DeltaNet → MoE
  Gated DeltaNet → MoE
  Gated DeltaNet → MoE
  Gated Attention → MoE
  ```

- Gated DeltaNet：128 个 V 线性注意力头、16 个 QK 头，头维度 128。
- Gated Attention：64 个 Q 头、4 个 KV 头，头维度 256。
- Rotary Position Embedding 维度：64。
- MoE：512 个专家；每个 Token 激活 10 个路由专家和 1 个共享专家。
- 专家中间维度：2048。
- 官方开放模型卡将其标为 Causal Language Model，没有把视觉编码器列为该开放权重的组成部分。
- 原生上下文长度为 262,144 Token，可扩展至 1,010,000 Token。
- 训练了多步 MTP。

## 4. Qwen3.8-Flash-Next

Flash-Next 应作为独立的实验性架构分支介绍。它不是简单地把 27B 或 2.4T 缩小，而是增加了新的注意力、残差和 Embedding 组件。

- 主模型 125B，6B 激活；另有 51B N-gram Embedding 和 4B MTP 参数。
- 隐藏维度：2560，48 层。
- 每 4 层为一个周期，共 12 个周期：

  ```text
  Gated DeltaNet → MoE
  Gated DeltaNet → MoE
  Gated DeltaNet → MoE
  Qwen Sparse Attention → MoE
  ```

- Gated DeltaNet：48 个 V 头、16 个 QK 头，头维度 128。
- QSA：24 个 Q 头、2 个 KV 头，头维度 256。
- QSA Indexer：4 个 Query 头、1 个共享 Key 头，Indexer 头维度 128。
- QSA 预算：512 个 block，即 2048 个 Token。
- MoE：512 个专家；每个 Token 激活 10 个路由专家和 1 个共享专家；专家中间维度 640。
- Gated Residual：4 个分支，Bottleneck Rank 为 320。
- N-gram Embedding：第二层使用 20,000,000 个二元或三元 N-gram 表项，共计 51B 参数。
- MTP：4B 参数、1 个 MTP layer；模型卡说明其训练使用多步预测。
- 原生上下文长度为 262,144 Token，可扩展至 1,000,000 Token。

## 5. 统一的教学流程

对于 27B 和 2.4T，可以先展示共通骨架：

```text
输入
 ├─ 文本 → Token Embedding
 └─ 图像/视频 → Vision Encoder → 视觉表示（仅展示在官方标注支持视觉的模型）
        ↓
混合序列建模
 ├─ 3 个 Gated DeltaNet 层
 └─ 1 个 Gated Attention 或 QSA 层
        ↓
FFN 或 MoE
        ↓
LM Output
```

MTP 对 27B 和 2.4T-A95B 只作为“模型卡说明的多步训练机制”展示；Flash-Next 还可根据其公开资料单独说明 MTP layer 与推测解码支持。MTP 不应被画成主干后的固定输出分支。动画必须在模型切换时同步改变模块名称和数据，尤其不能把 QSA、Gated Residual、N-gram Embedding 显示在 27B 或 2.4T 的主路径中。
