# Kimi-K3 架构深度探秘与交互演示 (Model Insider - Kimi K3)

[![React](https://img.shields.io/badge/Frontend-React%20%7C%20TypeScript%20%7C%20Vite-61dafb?logo=react)](https://reactjs.org/)
[![Status](https://img.shields.io/badge/Status-Complete-brightgreen)]()

本子项目是 **Model Insider** 针对月之暗面 **Kimi K3 (2.78 万亿参数 Mixture-of-Experts 混合专家模型)** 技术报告的完整可视化深度解密演示系统。

---

## 🗺️ 内容结构与模块导览

* **第 1 章：系统宏观概览 (System Overview)**
  * 93 层 Backbone + 27 层 MoonViT 全景拓扑交互图
  * 90 秒模型设计理念引导导览 (Scale, Compute, Routing, Context, Training)

* **第 2 章：核心模型架构探秘 (Model Architecture)**
  * **§2.1 Delta Attention (KDA)**：增量注意力循环状态更新 $S_t$ 矩阵与动态门控衰减模拟器；
  * **§2.2 Attention Residuals (AttnRes)**：跨层隐藏状态召回与层深度信号衰减分析；
  * **§2.3 Stable LatentMoE**：16/896 路由专家 + 2 共享专家与隐空间路由负载平衡；
  * **§2.4 Native Vision**：MoonViT-V2 视觉切片编码与 Factorized 空间+时间注意力；
  * **§2.5 Per-Head Muon**：Newton-Schulz 正交迭代正交化矩阵更新模拟；
  * **§2.6 Multimodal Tokenizer (最新特性)**：
    * 离散文本 BPE 查表 ($W_{\text{emb}}$) vs 连续图像神经网络矩阵乘法 ($W_{\text{proj}}$) 本质对比；
    * 14×14×3 (588d 像素) $\rightarrow$ 512d ViT 向量 $\rightarrow$ 2×2 Pixel Shuffle (2,048d) $\rightarrow$ 7,168d 对齐全流程推导；
    * 512 个 $14 \times 14 \times 3$ 卷积核特征提取模拟器（检测边缘、色彩对比、纹理梯度）；
    * 7,168 维高维潜空间向量点积注意力相关度计算模拟；
    * 2,048d 单 Token 逆向重构还原 $28 \times 28$ 像素画面验证器。

* **第 3 章：预训练 (Pre-training)**
  * 20T+ 混合数据桶权重与学习率 Schedule 动态曲线

* **第 4 章：后训练与推理 (Post-training & Inference)**
  * Async RL 强化学习训练轨迹
  * EAGLE-3 投机解码与推理外推交互沙盒

* **第 5 章：硬件基建 (Infrastructure)**
  * Multi-GPU 流水线并行与 Memory Budget 计算器

* **第 6 章：评测与安全 (Evaluation & Safety)**
  * 6.1 交互式 6 维能力雷达图 (Capability Radar Chart)
  * 6.2 动态基准得分柱状图 (Growth Bars)
  * 6.3 成本/性能散点图 (GPQA Diamond Scatter Plot)

* **第 7 章：工程案例 (Case Studies)**
  * 编译器与芯片项目算子拓扑图

---

## 🛠️ 本地运行指南

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 生产构建与 Lint
npm run lint
npm run build
```

---

## 📌 说明

项目默认使用浏览器端状态驱动交互；模拟器中的数值与曲线是用于解释机制的演示数据，不代表线上模型服务或实时基准结果。
