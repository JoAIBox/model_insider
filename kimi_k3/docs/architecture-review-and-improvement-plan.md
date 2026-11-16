# Kimi K3 交互原理展示：审查与改善方案

审查日期：2026-09-08。状态：方案阶段，尚未修改应用代码。

## 1. 结论与审查范围

项目已经具备可保留的教学框架：Transformer 入门课程、93 层架构总览、核心算子详情、视觉输入、预训练、后训练、基础设施、评测与案例。主要问题是不同页面对同一机制采用了不同公式和拓扑；部分动画只改变颜色、进度或预设数字，没有执行它声称展示的计算；某些已加“教学示例”注释的图形仍然保留了错误的因果关系。

改善目标是让用户能够跟随一个输入，解释它的张量如何变化、历史状态如何更新、输出如何产生，以及训练怎样改变参数。小维度模拟完全可行，但必须保留真实算法的操作顺序、数据依赖与数学不变量。

本轮检查了应用路由、现有组件实现、本地报告中的架构／预训练／后训练／基础设施章节，并对照官方在线报告与模型配置。浏览器遍历了 17 个主导航入口，检查代表性桌面页面及 390px 手机布局，复现了总览 MoE 双击空白问题。未运行 K3 权重，未做真实 GPU 性能或模型能力评测，也没有穷举每一个交互组合。

依据：

- [本地架构原文](tech_report/k3_latex_source/2-model-architecture.tex)
- [本地预训练原文与规格表](tech_report/k3_latex_source/3-pre-training.tex)
- [本地后训练原文](tech_report/k3_latex_source/4-post-training.tex)
- [本地基础设施原文](tech_report/k3_latex_source/5-infrastructure.tex)
- [官方报告 v2](https://arxiv.org/html/2607.24653v2)，arXiv 标注修订于 2026-08-07；项目资料索引仍标注 2026-08-01。
- [官方模型配置](https://huggingface.co/moonshotai/Kimi-K3/blob/main/config.json)
- [官方视觉与 projector 实现](https://huggingface.co/moonshotai/Kimi-K3/blob/main/modeling_kimi_k3.py)
- [官方语言模型实现](https://huggingface.co/moonshotai/Kimi-K3/blob/main/modeling_kimi_linear.py)

后续应固定报告版本和配置／实现的 commit。报告解释训练设计，配置解释发布规格，参考实现与优化部署实现可能不同，不能把三个层面的信息混成一个未注明版本的“真实模型”。

## 2. 项目结构与可保留内容

应用是 React + TypeScript + Vite 的浏览器教学项目，没有连接真实 K3 推理服务。主导航实际挂载 KDAOperatorDeepDive、AttnResOperatorDeepDive 和 MoEOperatorDeepDive。旧的 KDASimulator、AttnResSimulator、MoESimulator，以及其依赖的 MoETrainingExplorer，未接入当前主导航；RoPEOperatorDeepDive、LessonInteractive、EcosystemCards 也没有当前入口。

这一区别影响修复范围：旧 MoETrainingExplorer 中已有较准确的“下一批应用 QB 偏置”和“推理冻结偏置”说明，但用户当前进入的页面没有完整呈现这些内容。旧组件的问题应在重新使用前处理，不能把修改未挂载组件当作修复已上线页面。

建议保留：

- 93 层标记的主循环生成逻辑：23 个完整的 3 KDA + 1 MLA 循环，加第 93 层 MLA；第一层 FFN 为 dense。
- 文本与视觉先映射到共同 backbone 宽度的基本叙事。
- RMSNorm 小向量计算，以及输出页 temperature、softmax、top-p 的计算骨架。
- 入门课程的分镜、前后翻页和术语辅助方式。
- 已正确给出“混合模型仍有 MLA 缓存”的说明，以及正确的 Block AttnRes 来源集合说明。
- 有来源的评测数值、报告案例，附上评测条件后作为原理学习的补充。

这些内容需要统一数据和术语，避免被同一页面中的错误图形抵消。

## 3. 已确认问题清单

P0：机制／拓扑错误，可能让用户学错。P1：关键创新缺失或交互不能验证解释。P2：阅读与工程维护问题。以下位置均为当前审查版本。

| 编号 | 优先级 | 位置 | 确认的问题 | 修正方向 |
|---|---|---|---|---|
| A01 | P0 | Dashboard.tsx:143、AttentionOperatorAnimation.tsx:30 | KDA 把衰减放进 I−βkkᵀ 的括号内；总览还使用 1−sigmoid(z) 的保留率，与 K3 有下界的映射不符。 | 统一使用先逐通道衰减、再 delta 修正的公式。 |
| A02 | P0 | KDAOperatorDeepDive.tsx:28、:269 | matrixState 没有 setter；write/read 显示原矩阵，write 只突出对角线；下一 token 没继承更新状态。 | 真实计算低维状态轨迹；外积更新按所有受影响单元显示。 |
| A03 | P0 | Dashboard.tsx:193、AttnResOperatorDeepDive.tsx:98 | 总览把 pseudo-query 写为 W_l h_l，加入额外 √d；详情再加外层残差；示例代码用 L2 normalize 并执行 current_layer + retrieved。 | learned pseudo-query w_l、RMSNorm keys、softmax 加权未归一化 values；消除额外残差支路。 |
| A04 | P0 | beginner/LessonAttnRes.tsx:157、:193 | 把 attention weights 写成训练后固定；“最近块权重最大”被写成规律；详情曲线是未归一化高斯值却标为 α。 | 参数固定但权重随 token 表示变化；用实际得分 softmax 得到概率，不以层间距离代替内容。 |
| A05 | P0 | MacroArchitectureFlow.tsx、MLAOperatorDeepDive.tsx:330、:617 | 总流程将 attention、AttnRes、MoE 画成三个独立阶段；NoPE 对照图保留两路分叉合流，容易被理解为 KDA 位于 MLA 内部的并行位置支路。 | 总览折叠为重复层结构；画明每层选择 KDA 或 MLA，AttnRes 位于模块输入；NoPE 是设计属性。 |
| A06 | P0 | MoEOperatorDeepDive.tsx:106、ExpertPathAnimation.tsx | 共享专家连在 router 后；输出框把共享和路由分支汇总后一起 W↑。另一图把 router 放在 W↓ 后。 | x 同时供给 router、共享专家和 W↓；只有路由专家结果经过 RMSNorm、W↑。 |
| A07 | P0 | Dashboard.tsx:175、:1080、beginner/LessonMoE.tsx:106 | SiTU-GLU 表达式缺失独立 up 分支 softcap；专家输出分别被标成 7168 或 3072；路由权重被称为 softmax。 | routed expert 是 3584→3072→3584；完整展示两支 SiTU；混合权重由选中的原始 sigmoid 分数归一化。 |
| A08 | P0 | MoEOperatorDeepDive.tsx:7 | QB 用 (目标负载−当前负载)×0.12，之后直接切换硬编码均衡数组；没有计算分位数。 | 由 scores、Top-(k+1) cutoff、margins、expert quantile 推导下一步偏置，再重新路由。 |
| A09 | P0 | PostTrainingDetails.tsx:92、:173 | λ 被画成“120 steps 截为 96 steps”，把完成轨迹比例误作单轨迹截断长度。 | 展示 N×K 条轨迹；达阈值时暂停未完成轨迹并在后续迭代恢复；同一 prompt 的 K 个结果齐备才形成可优化组。 |
| A10 | P0 | PostTrainingDetails.tsx:247、:295、:348 | 教师领域写成 Math/Code/General；把 stop-gradient 解释为避免教师冲突；把 per-token reward 直接叫 loss。 | 三领域为 general tasks、general agents、coding agents；与 low/high/max 组成九教师。学生采样，选定教师评分，停止梯度的奖励再用于学生更新。 |
| A11 | P0 | beginner/LessonAttention.tsx:272、:738 | 下一页宣称 K 向量来自前页 W_K x，却更换了数值；KV Cache 图称缓存后每 token 成本恒定、整体 O(n)。 | 各分镜复用同一计算；区分 QKV 投影节省与仍随历史长度增长的 attention read。 |
| A12 | P1 | MultimodalTokenSimulator.tsx:7、:633、:901 | 512／2048 教学维度占据 K3 主路径；神经编码被简化为一组滤波器；存在逆重构页，虽有免责声明但无 K3 对应模块。 | 主路径采用已公开 1024／4096 维度和完整 MoonViT、MLP；将打包可逆与视觉编码不可保证可逆分开，移走逆图像重构。 |
| A13 | P1 | MLAOperatorDeepDive.tsx:5、Dashboard.tsx:1010 | 已公开的 KV latent 512、head width 128 等仍写未披露；dense hidden 写 19456，激活写 SwiGLU。 | 按发布配置校准；dense intermediate 为 33792，语言 FFN 配置采用 SiTU；对实现路径再做一次对应检查。 |
| A14 | P1 | MultimodalTokenSimulator.tsx:11、输出页与总览 | 报告 160K 被展开为精确 160000；1M 有时按 1000000，有时用 1024K。 | 说明报告采用约数；发布配置 vocab_size=163840，max_position_embeddings=1048576；精确形状统一使用配置值。 |
| A15 | P1 | PerHeadMuonSimulator.tsx:6、:65、:138 | nsIterations 不参与图形计算；更新条由 sin 生成，loss 含随机值；图形暗示每头独立 loss 和必然同速收敛。 | 用真实小矩阵正交化轨迹，显示奇异值／更新范数；训练收益引用报告，不能由假 loss 证明。 |
| A16 | P1 | PreTrainingSection.tsx:89、:236 | scaling-law 路径与悬浮数值独立，K3 曲线在常规 loss 轴下高于 K2；“演进阶段”让 K2/K3 参数变为无来源数字。 | 曲线由统一数据映射；优先使用原报告图，概念图采用无量纲且清楚标注；删除伪造历史参数阶段。 |
| A17 | P1 | KDAOperatorDeepDive.tsx:499、InfrastructureDeepDive.tsx:200、MLAOperatorDeepDive.tsx:18 | 三个内存面板使用不同任意系数；部分有无依据 OOM 标签；GiB 算式标作 GB。 | 共用缓存计算器，声明 batch、layers、dtype、shape、部署方式；阈值需用户指定硬件预算。 |
| A18 | P1 | ReasoningSandbox.tsx、InfrastructureDeepDive.tsx:50 | 预编排日志以执行 trace 呈现，缺少同等醒目的“脚本演示”；49ms 恢复被用于冷启动；努力等级展示成固定质量梯度。 | 明确演示轨迹；分开工具执行、观测、预算和验证结果；使用论文中正确的测量语境。 |
| A19 | P1 | EvaluationDashboard.tsx:14、:305、CaseStudies.tsx:58 | 雷达与成本图混入无可复算依据的值；本地报告 BrowseComp 的 GLM 值为空，页面补成 40；案例耗时拆分不是原始 trace。 | 缺失值保持缺失；比较必须同口径；报告总耗时与教学工作阶段分开。 |
| A20 | P2 | MacroArchitectureFlow.tsx:98 | 节点 id 为 experts，导航映射 key 却为 moe；双击传入 undefined。 | 单一类型化导航表；浏览器回归所有入口。 |
| A21 | P2 | MathRenderer.tsx:15、:45 与多个 SVG | 手写公式解析会截断复杂下标、转置与分式；多处直接显示 LaTeX 控制符；SVG 长文本越界。 | 使用可靠公式渲染或结构化数学节点，统一字体与布局；公式不能因美化改变语义。 |
| A22 | P2 | App.tsx、各动画组件 | 页面切换无地址状态；组件重复解释；部分动画没有停止控制，播放器暂停也不一定停止 SVG 自循环。 | 共享组件／计算、URL 导航、统一播放控制、离屏暂停、键盘支持和移动布局。 |

补充核查：RMSNorm 的小向量数值计算可保留；入门课 Q/K/V 第一组矩阵乘法结果正确，问题出在后续分镜更换数据。输出页 top-p 截断和重归一化抽样骨架可保留，但“仅五个候选”的概率必须标为五词玩具词表，不能视为完整 K3 词表的概率。

## 4. 教学结构调整

推荐默认中文说明，保留 KDA、MLA、AttnRes、MoE 等标准术语和英文全称；暂不强制建设完整双语系统。每个主题采用相同的阅读顺序：

1. 问题：传统机制在什么条件下面临什么成本或信息瓶颈。
2. 改动：K3 在哪一个操作上改变了公式或数据路径。
3. 交互：修改一个输入或参数，预测结果，再执行一步观察变化。
4. 推导：同一组数值对应到公式、张量形状和简短伪代码。
5. 边界：此机制解决什么，没有解决什么，实验收益来自哪里。

主学习路线为“基础运算 → 一次前向传播 → K3 创新 → 训练参数更新 → 推理状态管理 → 实验与部署”。原论文章节索引仍可作为进阶检索入口。

必须始终区分三条轴：token 时间 t、网络深度 l、训练步数 s。KDA 沿 t 更新激活状态；AttnRes 沿 l 选择信息来源；优化器沿 s 更新参数。固定大小状态不代表无限精确记忆，深度注意力也不代表访问别的 token。

类比需要配合边界：用“连续关联记忆”解释 KDA，不用会覆盖最旧条目的环形队列；用“可加权查阅的块摘要”解释 AttnRes，不说普通残差必然把信息传坏；MoE 专家是可学习 FFN，不是预设的数学／编程小模型。

## 5. 核心交互的具体设计

### 5.1 统一架构总览

默认只显示：文本／视觉输入 → 93 层 backbone → 最终 AttnRes 聚合与归一化 → 词表投影 → 采样 → 下一轮。

展开任意层后，显示模块输入的 AttnRes 读取、RMSNorm、该层 KDA 或 MLA、块内 partial sum 更新、下一次 AttnRes 读取、dense/MoE、partial sum 更新。历史块摘要是输入来源，并不是跨过全部层后额外加一次的“捷径输出”。

同时提供两个清楚命名的分组标尺：4 层 attention cycle，与 12 层 AttnRes group。第一层 dense、第 93 层 MLA、最后一个不完整 AttnRes group 都要有明确标记。提供“跟随一个 token”和“查看同一 token 的各层表示”两种阅读视角。

### 5.2 KDA：从可计算状态到 K3 专属改动

使用 2×2 或 4×4 玩具状态，显示 S_previous、各通道 α、β、q、k、v，并执行以下步骤：

1. S_bar = Diag(α) S_previous。
2. v_pred = S_barᵀ k。
3. δ = v − v_pred。
4. ΔS = β k δᵀ；S_new = S_bar + ΔS。
5. o = S_newᵀ q；head RMSNorm → full-rank sigmoid output gate → W_o。

所有数值、热图、箭头粗细来自这一计算。下一 token 必须继承 S_new；回退必须重建同一历史状态。允许编辑 δ≈0、单个通道强衰减、重复 key、不同 β 的预设，解释 delta-rule 是纠正当前关联的误差。

第二层展开完整投影：Q/K 经 ShortConv、Swish、L2Norm；V 经 ShortConv、Swish；不要把 V 也归一化。

K3 专属创新需独立展示：g=−5·sigmoid(exp(A)z)，α=exp(g)。对照 Kimi Linear 的无下界负 Softplus；显示 16-token tile 的累计 log-decay 下界与数值范围，再连接到“对角 tile 也能使用 Tensor Core 矩阵乘法”的计算图。训练／prefill 切换展示块内并行、块间递推，不画成必须逐 token 串行训练。

### 5.3 Gated MLA：压缩缓存、因果读取和输出门

显示每个历史 token 的 512 维 latent；当前 query 只读取允许的前缀，未来位置显式为零权重。提供“逻辑展开”和“使用 latent 的等价计算”对照，分别解释 key 侧变换、value 侧聚合和实际缓存实现。

输出路径必须出现输入相关 gate，之后再 W_o；不能把依赖当前输入的 gate 当作可预先吸收的固定矩阵。NoPE 使用旁注和相邻 KDA 层说明，不创建位置向量支路。

用统一例子演示：新增一个 token 时，多一条 MLA latent，KDA 状态形状不变。计算量图分开 prefill、单步 decode、整个生成序列累计成本。

### 5.4 AttnRes：固定参数、动态权重

默认 Block 版本，Full 版本仅作解释对照。屏幕显示 embedding、已完成块摘要、当前 partial sum 三类来源，屏蔽未来来源；第一模块无 partial sum 时不提供虚构的当前来源。

固定层的 pseudo-query w_l，让用户切换 token 表示，重新计算 RMSNorm(keys) → scores → softmax → weighted values。用户应能直接观察“参数没变但权重变了”，权重总和始终为 1，values 不因 key normalization 被错误归一化。

再向前一步，演示模块计算结果累加到当前块摘要；到边界后封存摘要并创建下一块。开关比较等权累加、Full AttnRes 和 Block AttnRes，明确比较的是结构与状态数，不能由示意图推出固定训练加速比例。

### 5.5 Stable LatentMoE：同时解释容量、稳定性和均衡

三条并行数据路径：

- x → router → sigmoid scores + frozen/current bias → Top-16 IDs；原始选中分数归一化成 p。
- x → 两个 full-width shared experts → shared result。
- x → W↓ → 3584 → selected FFN experts（hidden 3072，output 3584）→ 加权和 → RMSNorm → W↑ → routed result。

最后两个 result 相加。将 router 的控制连线和张量数据连线分开；实际 896/16 配置与 4-expert 玩具实验分别标注。

SiTU 面板独立控制 gate/up 输入，比较 SwiGLU 和双支 softcap。β1=4、β2=25 给出的 100 上界只约束激活乘积，不能说整个专家输出或训练梯度都被限制在 100。

QB 面板使用可检查的小批次 score 表：旧偏置路由 → 第 k+1 个 cutoff → 各专家 margin 分布 → quantile → 新偏置去均值 → 下一批路由。提供 batch s 与 s+1 两个明确时刻，推理模式冻结偏置。大规模 histogram all-reduce 可进一步展开。

另外区分 QB 与 MoonEP：QB 改善专家分配负载；MoonEP 通过执行计划与专家副本平衡设备工作量，后者不是改变模型语义路由。

### 5.6 视觉：保留完整编码路径，减少无关逆过程

主图采用官方配置／实现对应的形状：14×14×3 patch 输入 → patch embedding／27 层 MoonViT-V2（hidden 1024）→ 2×2 空间分组（4×1024→4096）→ MLP（4096→4096→7168，GELU）→ RMSNorm → 文本／视觉序列。

用 56×56 玩具图展示 16 patches→4 visual tokens，颜色仅代表 patch 身份；重排不等于从特征无损复原像素。替换“512 个滤波器就获得语义”的主叙事与逆重构页，保留可追踪的空间打包互动。

视频另外展示同帧空间 attention、跨帧时间 attention 和 temporal pooling，明确池化在选定时间分组内进行。原生训练的创新用反向梯度流解释：视觉塔从头参与共同 next-token objective，而非依赖对比预训练后再接入。共享宽度也不意味着两个原始 embedding 的点积就是模型 attention 概率。

### 5.7 训练：增加完整闭环

预训练闭环：准备图文序列 → causal 前向 → 下一 token 标签与 loss mask → loss → backward → 梯度／动量 → Per-Head Muon 和其他对应更新 → 参数改变 → 下一 batch。视觉输入位置与监督目标位置需要明确区分；不能把 next-token prediction 解释为还原每一个输入图像 patch。

长上下文课程保持 8K→64K→256K→1M，讲清增加序列长度、数据分布和计算成本，参数仍在训练更新。数据混合配比、总 token 数与各阶段 loss 若无依据，不填成官方精确数字。

Per-Head Muon 使用可计算小矩阵，展示整矩阵与逐头处理 momentum 的差别。nsIterations 必须影响矩阵迭代结果和指标；解释正交化的是更新方向，不是每一步都强制模型权重本身正交，也不代表注意力头拥有独立监督 loss。

后训练采用 SFT → 三领域×三努力等级 RL → MOPD 单一学生的总览。展开 partial rollout 的暂停／恢复及旧策略数据；展开 MOPD 的学生前缀、教师选择、per-token log-ratio reward、stop-gradient 与学生更新。

QAT 时间线从 SFT 开始覆盖 RL，区分低精度 routed expert 与较高精度 shared experts、attention、router、latent projections。展示 rollout 与训练量化口径一致的目的。

### 5.8 推理：prefill、decode、投机与工具循环

增加明确的 prefill/decode 切换：prefill 建立 KDA／ShortConv 状态与 MLA cache，decode 处理新增 token 后采样。文本生成不更新模型参数；缓存与激活会更新。

EAGLE-3 图从第 1、第 4、最后 AttnRes block 特征融合开始，说明 MTP 经微调成为 draft，target 冻结；训练七步展开与教学四 token 草稿例子分别标注。随机采样模式应显示接受概率 min(1,p/q) 及拒绝后的修正分布，greedy 模式另说明其验证规则，不能混为“文本相同就接受”。

拒绝后明确丢弃后缀，展示 MLA 有效前缀与 KDA 接受前缀状态恢复。K3 的 projected-input caching/replay 应成为可操作演示：保存较小投影输入→在芯片上重建接受状态→写回，而不是画成 KDA 任意回退无需代价。

工具调用展示为“模型输出动作→环境执行→返回观测→进入上下文→模型继续”的循环。脚本示例只展示可观察决策步骤和结果，不冒充真实 K3 内部推理或真实工具实测。

## 6. 数据、公式与动画的实现约束

建议新增一个小型共享事实模块，包含来源、版本、规格、层类型和分组；新增相互独立的教学计算函数，供总览、入门课和算子页复用。不建设通用神经网络框架，也不尝试在浏览器加载完整 K3。

每个演示明确标识四种信息：论文事实、发布配置／实现、真实算出的玩具示例、结构示意。未知量确实未知时才写未披露；已公布的配置值不再降为“教学假设”。

统一 row/column vector 约定以及 batch、sequence、head、channel 轴；每个箭头写输出 shape。数值格式化仅作用于显示，不能先四舍五入再参与后续运算。所有图表使用公共坐标映射，tooltip 读取相同数据。

播放器统一包含播放、暂停、前进、后退、重置、速度。暂停同时停止数值演化和与该步骤绑定的粒子／SVG 动画；无依赖的装饰动效应最小化。自动播放只负责推进语义步骤，不负责随机制造结果。

## 7. 阅读与交互设计

- 默认显示一张主要图和一句本步解释，公式与代码按需展开，减少多层卡片和长篇侧栏。
- 技术标签在实际显示尺寸下保持可读；手机使用纵向分镜或可缩放画布，不能把 760px 图整体缩到约 300px 后仍依赖原来的小字。
- 颜色固定表示数据／状态／控制／训练更新等角色，同时提供文字或线型，避免只靠颜色。
- hover 内容也可点击和键盘展开；SVG 交互节点具有语义标签和焦点。
- 页面和分镜可用 URL 定位，刷新、后退可恢复位置。
- CSS reduced-motion 之外，也处理 requestAnimationFrame、timer 和 SVG SMIL；离开页面取消异步回放。
- 评测与案例放在学习路线末尾，保留实验条件、硬件、样本范围、来源和日期。删除无来源的模型能力雷达比较及精确性能分解。

## 8. 实施顺序与交付物

| 阶段 | 工作 | 主要涉及位置 | 验收结果 |
|---|---|---|---|
| 1. 事实与机制校准 | 固定来源版本，集中规格／层分组，修正 A01/A03/A05–A14/A19 的事实和拓扑，修复空白导航。 | App、Dashboard、MacroArchitectureFlow、各详情及入门课、docs | 同一事实跨页一致；主要数据路径无错误支路；全部入口可访问。 |
| 2. 核心可计算交互 | KDA、AttnRes、MoE/QB、SiTU、MLA、Muon 的低维计算与统一播放状态；基础课各分镜共用数据。 | 共享教学函数、对应算子页、beginner | 图形数值可手算复核，输入确实影响结果，回退／重置可复现。 |
| 3. 完整流程教学 | 视觉编码、预训练闭环、partial rollout、MOPD、QAT、prefill/decode、EAGLE-3 与 replay。 | Multimodal、MoonViT、PreTraining、PostTraining、ReasoningSandbox、Infrastructure | 用户可逐步追踪参数／状态／缓存／环境各自的变化。 |
| 4. 展示统一与回归 | 中文叙事、公式渲染、移动布局、可访问性、URL 导航、来源展示、重复组件收敛、按页加载。 | 各页面、样式、README、导航 | 桌面／手机可读、动画能暂停、无断链，项目检查通过。 |

阶段 1 和 2 优先。避免先大范围换视觉风格，再修正数学与交互语义；布局改动应服务于已经确定的计算流程。保留旧模块中准确且有教学价值的内容，确认接入或替换后再清理重复代码。

## 9. 验收标准与当前基线

机制验收：

- KDA expanded recurrence 与 delta residual 形式输出一致；逐通道衰减按正确轴执行；δ=0 时无 delta 写入；下一个 token 继承正确状态。
- AttnRes 来源集合因层位置而变，权重和为 1；key normalization 不改变 value；切换 token 可在固定 w 下改变权重；不能访问未来块。
- MoE 的专家数、维度和权重正确；shared branch 不经过 W↓／W↑；QB 只影响下一步 dispatch，推理偏置冻结；SiTU 激活乘积满足理论界。
- 普通 attention 的未来位置权重为 0；输出概率与 top-p 处理可复算；缓存后的历史 attention read 成本不被省略。
- MLA 逻辑与等价 latent 计算结果一致，output gate 位置正确；内存估算同时显示各项 shape、dtype 与覆盖范围。
- partial rollout 按完成轨迹数触发；未完成轨迹能恢复；MOPD 每次选择对应教师并用学生采样轨迹；训练与推理参数更新边界明确。
- 投机拒绝后的 cache/state 与接受前缀一致，重放结果可对照从前缀重算的结果。

展示验收：

- 同一个示例在入门、总览和详情中的数值连续一致；每个可操作控件至少改变一个有解释意义的量。
- 原始、衰减、预测、修正、更新、读取有明确标签；播放与暂停不只改变按钮文字。
- 1440px、1024px、390px 视口完成代表性学习任务；可通过键盘访问交互，放大后无关键文字裁切。
- 任何精确性能／成本／能力数值都有来源和口径；无来源的不冒充测量曲线。
- 运行项目自带入口 npm run lint 与 npm run build；新增检查应针对上述数学不变量和关键流程，而非仅匹配文案。

本轮基线：

- npm run dev 能启动；17 个主导航默认页均能渲染。
- 已复现总览 Stable LatentMoE 双击导致 main 内容为空。
- 浏览器检测到多模态和案例图的部分 SVG 文字超出画布；1440px KDA 侧栏过窄，图内说明挤压；390px 入门首张图的 10 个文字元素显示高度均不足 10px。
- npm run lint：43 errors、4 warnings，涉及 any、effect 中 setState、无效赋值、字符串转义、hook 依赖等。
- npm run build：通过；主 JS 约 689kB（gzip 约 169kB），有大于 500kB 的 bundle 警告。
- 本轮仅形成审查方案；应用修正和上述新验收用例尚未实施。两项编码技能用于约束只读审查和复用项目脚本，没有引入应用修改。
