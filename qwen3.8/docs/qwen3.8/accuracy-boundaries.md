# 准确性边界与待核实项

## 可以直接作为官方事实展示

- 27B、2.4T-A95B 和 Flash-Next 的模型类型。
- 参数总量、激活参数、层数和隐藏维度。
- Gated DeltaNet、Gated Attention、QSA 的层布局关系。
- 各模型的 Q/KV 头数、头维度和 RoPE 维度。
- MoE 专家总数、激活专家数和专家中间维度。
- Flash-Next 的 Gated Residual、N-gram Embedding 和 QSA 参数。
- 原生上下文长度与可扩展上下文长度。
- 27B 和 Flash-Next 的视觉输入能力。

## 只能作为“教学抽象”展示

- Gated DeltaNet 的内部状态变化曲线。
- Router 的概率分布和专家颜色分配。
- Gated Attention 的注意力热力图。
- Token 在不同模块中的二维位置图。
- 视觉 Token 与文本 Token 的对齐动画。
- MTP 的逐 Token 预测过程；27B/A95B 只能展示为多步训练机制，Flash-Next 才能在有来源支持时展示推测解码关系，不能自行假定固定数量的输出分支。

这些内容可以帮助理解，但除非有对应官方数据，不应宣称是某次真实推理的内部激活或注意力结果。

## 当前公开资料未完整说明的内容

以下项目不应在页面中编造成确定事实：

- 完整训练数据配比、数据清洗规则和训练样本数量。
- 全部预训练阶段的 batch、学习率、优化器调度和硬件集群。
- 完整 RL 环境、奖励模型和 agent 训练流程。
- 27B 与 Flash-Next 视觉编码器的全部内部结构。
- 所有推理框架的统一缓存实现和真实内存占用。
- 服务版 Qwen3.8-Max / Qwen3.8-Flash 的全部后端实现。

## 需要避免的错误

1. 把 Qwen3.8-27B、2.4T-A95B 和 Flash-Next 合并成一个相同结构。
2. 把 Qwen3.8-Max 的服务功能直接当作 2.4T-A95B 开放权重的固有能力。
3. 把 Gated DeltaNet 画成普通 Transformer Attention 或标准 KV Cache。
4. 把“10 个路由专家 + 1 个共享专家”误写成每层只有 11 个专家；官方给出的专家总数是 512。
5. 把 262K 原生上下文、1M 可扩展上下文和服务版默认上下文混为同一个数字。
6. 把 Flash-Next 的 QSA、Gated Residual 和 N-gram Embedding 放到 27B 或 2.4T 的架构图中。
7. 用未经官方支持的 benchmark 雷达、容量比例或性能结论替代具体任务和官方分数。

## 发布前建议

发布交互页面前，应建立一份 claim registry：每一个数字、结构名和能力描述都记录来源 URL、模型名称、版本日期和证据等级。模型卡发生更新时，只更新对应模型条目，不要用一个全局参数表覆盖整个系列。
