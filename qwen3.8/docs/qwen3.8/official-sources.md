# 官方资料与引用

## 一级资料

### Qwen3.8 官方仓库

- 地址：<https://github.com/QwenLM/Qwen3.8>
- 用途：系列范围、官方模型名称、发布关系、部署方式、服务版本说明。
- 关键事实：官方仓库将 Qwen3.8 描述为建立在 Qwen3.5 架构基础上的系列，并列出 27B 和 2.4T-A95B 两个开放模型。

### Qwen3.8-27B 模型卡

- 地址：<https://huggingface.co/Qwen/Qwen3.8-27B>
- 用途：27B 模型的类型、层数、隐藏维度、混合层布局、视觉输入、上下文长度和推理参数。

### Qwen3.8-2.4T-A95B 模型卡

- 地址：<https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B>
- 用途：2.4T/A95B 模型的 MoE 规模、层数、专家路由、混合层布局、上下文长度和 MTP 信息。

### Qwen3.8-Flash-Next 模型卡

- 地址：<https://huggingface.co/Qwen/Qwen3.8-Flash-Next>
- 用途：Flash-Next 的 QSA、Gated Residual、N-gram Embedding、MoE 和多模态结构。

### Flash-Next 技术报告

- 地址：<https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf>
- 用途：Flash-Next 架构设计动机、效率、训练稳定性和组件说明。

## 二级资料

- Qwen3.8 官方博客：<https://qwen.ai/blog?id=qwen3.8>
- Qwen3.8-Flash-Next 官方博客：<https://qwen.ai/blog?id=qwen3.8-flash-next>
- Qwen 官方文档：<https://qwen.readthedocs.io/>
- Qwen3.8 官方仓库中的部署说明：<https://github.com/QwenLM/Qwen3.8#deployment>

## 引用原则

1. 模型尺寸、层数、头数、专家数、上下文长度等数字优先引用对应 Hugging Face 官方模型卡。
2. 产品能力与开放权重能力分开描述。模型卡明确写出的服务增强不能直接归因于开放权重。
3. 官方没有披露的内容必须标为“未公开”，不能根据相邻版本、代码实现或常见 Transformer 结构推断为 Qwen3.8 官方事实。
4. 交互动画中的简化矩阵、概率、Token 数量和颜色均应标注为教学示意，除非它们直接来自官方配置或模型卡。

## 快照、定位与核验日期

以下定位用于当前网站设计稿的事实追溯；核验日期为 **2026-08-31**。实现时若来源更新，应更新 revision、定位和 `verifiedAt`，不能只保留一个可变的 `main` 链接。

| 来源 | revision | 精确定位 | 核验日期 |
|---|---|---|---|
| Qwen3.8 官方仓库 | `2ea10dc725823bf7c3e21ce8557cbe15245132ae` | [README / Models](https://github.com/QwenLM/Qwen3.8/tree/2ea10dc725823bf7c3e21ce8557cbe15245132ae#models) | 2026-08-31 |
| Qwen3.8-27B 模型卡 | `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` | [Model Overview](https://huggingface.co/Qwen/Qwen3.8-27B/tree/1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0#model-overview) | 2026-08-31 |
| Qwen3.8-2.4T-A95B 模型卡 | `207bd685a7e3696cfaff12ded7c6a7ea0f88c996` | [Model Overview](https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B/tree/207bd685a7e3696cfaff12ded7c6a7ea0f88c996#model-overview) | 2026-08-31 |
| Qwen3.8-Flash-Next 模型卡 | `de4b8e4d43b917e7706784d8bb445c9af86a3540` | [Model Overview](https://huggingface.co/Qwen/Qwen3.8-Flash-Next/tree/de4b8e4d43b917e7706784d8bb445c9af86a3540#model-overview) | 2026-08-31 |
| Flash-Next 官方仓库/报告 | `69885871a64393807d988b27b1b5e380e8f28526` | [README / four architectural directions](https://github.com/QwenLM/Qwen3.8-Flash-Next/tree/69885871a64393807d988b27b1b5e380e8f28526#qwen38-flash-next) | 2026-08-31 |
| Flash-Next 官方博客 | `2026-08-26 release` | [QSA / Gated Residual / N-gram sections](https://qwen.ai/blog?id=qwen3.8-flash-next) | 2026-08-31 |
