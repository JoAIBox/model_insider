# Qwen3.8 系列架构资料

> 资料整理日期：2026-08-31
>
> 目标：为面向初学者的 Qwen3.8 系列架构介绍、交互动画和技术说明提供事实依据。

## 资料范围

本目录按官方公开资料，将 Qwen3.8 相关模型分为三条架构路线：

1. `Qwen3.8-27B`：27B Dense 多模态模型，支持图像和视频。
2. `Qwen3.8-2.4T-A95B`：2.4T 总参数、95B 激活参数的稀疏 MoE 文本模型。
3. `Qwen3.8-Flash-Next`：包含 Qwen Sparse Attention、Gated Residual 和 N-gram Embedding 的实验性多模态架构预览。

`Qwen3.8-Max` 和 `Qwen3.8-Flash` 是基于相应开放模型的官方服务版本，应在产品能力层单独说明，不能直接当作开放权重的架构名称。

## 文档索引

- [官方资料与引用](./official-sources.md)
- [系列架构事实表](./architecture-facts.md)
- [适合初学者的原理与交互设计](./interactive-design.md)
- [准确性边界与待核实项](./accuracy-boundaries.md)
- [网站高层架构与动画方案](./website-plan.md)
- [工作流与动画详细规格](./working-flow-and-animation-spec.md)

## 核心结论

Qwen3.8 系列不能用一个“放大版 Transformer”概括。三个分支共享以 Gated DeltaNet 为代表的混合序列建模方向，但在注意力、FFN/MoE、残差、Embedding 和视觉输入方面存在明显差异。

最适合教学的主线是：

```text
输入 / 视觉输入
      ↓
Token 或视觉表示
      ↓
混合序列建模周期
  3 × Gated DeltaNet
  1 × Gated Attention 或 QSA
      ↓
FFN 或 MoE
      ↓
LM 输出（MTP 按模型分别标注：多步训练；Flash-Next 另有推测解码支持说明）
```

其中“混合周期”是对官方布局的教学化展开，动画中必须标注为架构结构示意，避免让用户误解为每个模型的完整源码执行图。
