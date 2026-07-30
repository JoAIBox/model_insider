# Kimi-K3 技术报告交互演示

这是一个基于 React、TypeScript 与 Vite 的技术报告可视化站点，用于把 Kimi-K3 的模型架构、训练流程、推理系统和工程案例整理成可交互的章节。

## 内容结构

- 宏观架构：模型拓扑与关键规格概览
- 模型架构：KDA、Attention Residuals、Stable LatentMoE、MoonViT、Per-Head Muon 模拟器
- 训练与推理：预训练数据、后训练 RL、投机解码与推理外推沙盒
- 基建与评测：算子、集群、AgentEnv、公开指标、安全评测和工程案例

## 本地运行

```bash
npm install
npm run dev
```

生产构建与代码检查：

```bash
npm run lint
npm run build
```

项目默认使用浏览器端状态驱动交互；模拟器中的数值与曲线是用于解释机制的演示数据，不代表线上模型服务或实时基准结果。
