import { ProjectDocument, GraphNode, TestCaseItem, TestDraft } from '../types';

export const INITIAL_DOCUMENTS: ProjectDocument[] = [
  {
    id: 'doc-srs',
    title: '软件需求规格说明书',
    path: '01 产品与需求 / 软件需求规格说明书',
    category: '需求',
    version: 'V3.2',
    owner: '王工 (架构师)',
    updated: '10分钟前',
    summary: '定义血液分析仪主机与上位机软件的整体功能边界、异常状态机、样本进样安全互锁与性能指标，是AI生成全流程测试集的核心依据。',
    relationsCount: 42,
    testCoverageCount: 128,
    riskCount: 8,
    modulesCount: 6,
    tags: ['受控文档', 'IEC 62304 Class B', 'FDA QSR', '已解析'],
    aiParsedStatus: 'completed',
    sections: [
      {
        heading: '1. 产品范围与系统安全边界',
        content: '上位机与下位机采用双通道双工通信，当样本检测进样针进行吸样或穿刺作业时，硬件安全光栅与软件状态机形成双重联锁。若检测到仓门开启或气压异常，系统必须在50ms内切断驱动泵供电并上报Critical告警。'
      },
      {
        heading: '2. 通信异常与断连降级流程 (§7.4)',
        content: '在连续3个心跳周期（合计3000ms）未收到下位机ACK应答时，判定为通信链路中断。上位机必须立即冻结当前批次排队队列，保留已采集的散射光原始光电数据，并锁定界面，防止操作员发起新的样本针穿刺。',
        safetyLevel: 'critical'
      },
      {
        heading: '3. 异常恢复与操作员确认安全逻辑',
        content: '通信链路恢复后，上位机严禁自动触发未完成的吸样或混匀机械动作。必须弹出非阻塞复位向导，引导操作人员清空进样槽并确认急停状态复位后，方可重新进入Ready待机态。',
        safetyLevel: 'warning'
      },
      {
        heading: '4. 性能与数据完整性要求',
        content: '全血细胞五分类CBC+DIFF检测单标本分析周期不得超过48秒；异常检测日志须以加密形式落盘至本地SQLite受控审计表，支持SHA-256防篡改签名。'
      }
    ]
  },
  {
    id: 'doc-prd',
    title: '产品需求说明书 (PRD)',
    path: '01 产品与需求 / 产品需求说明书',
    category: '需求',
    version: 'V2.8',
    owner: '产品经理组',
    updated: '昨天 17:30',
    summary: '阐明临床检验科工作流、条码自动识别扫描、LIS/HIS双向接口标准以及急诊标本（STAT）优先插队业务逻辑。',
    relationsCount: 35,
    testCoverageCount: 94,
    riskCount: 4,
    modulesCount: 5,
    tags: ['业务流程', 'LIS对接', '急诊插队'],
    aiParsedStatus: 'completed',
    sections: [
      {
        heading: '1. 检验科业务主场景',
        content: '支持条码自动扫描、全自动穿刺进样、溶血剂加注、激光散射流式细胞分析与阻抗法计数。'
      },
      {
        heading: '2. STAT 急诊标本插入机制',
        content: '无论当前进样架处于何种排队位点，急诊按键按下后，系统在当前单样吸样结束后立即切入急诊位点，插队时延不得大于35秒。'
      }
    ]
  },
  {
    id: 'doc-add',
    title: '报警模块详细设计 (ADD-Alarm)',
    path: '02 软件设计 / 报警模块详细设计',
    category: '设计',
    version: 'V1.6',
    owner: '周工 (系统设计)',
    updated: '2天前',
    summary: '详细阐述三级报警状态机（Prompt提示 / Warning警告 / Critical危险）、蜂鸣器编码策略、报警静音定时器以及故障码F-001~F-256映射表。',
    relationsCount: 26,
    testCoverageCount: 72,
    riskCount: 6,
    modulesCount: 4,
    tags: ['状态机', '报警抑制', '恢复算法'],
    aiParsedStatus: 'completed',
    sections: [
      {
        heading: '1. 报警级别与抢占机制',
        content: '系统报警分为Level 1（黄色提示）、Level 2（橙色警示）、Level 3（红色危险）。高优先级告警立即覆盖低优先级视听提示，且Level 3告警必须由操作员在屏幕上长按确认方可消除。'
      },
      {
        heading: '2. 组合告警风暴抑制算法',
        content: '当发生主路总线断连时，可能附带产生10+个传感器超时报警。告警引擎在此刻开启150ms收敛滤波，仅将根因（Bus Connection Loss）置顶上报，抑制次级连锁误报警。'
      }
    ]
  },
  {
    id: 'doc-proto',
    title: '上下位机通信协议规范',
    path: '03 接口与协议 / 上下位机通信协议',
    category: '协议',
    version: 'V2.4',
    owner: '李工 (嵌入式协议组)',
    updated: '3天前',
    summary: '定义CAN总线与以太网传输帧格式、CRC-16校验、心跳保持包、指令重传计数器（MAX_RETRY=3）及断连判定门限。',
    relationsCount: 31,
    testCoverageCount: 88,
    riskCount: 5,
    modulesCount: 3,
    tags: ['CAN-FD', 'Socket', '帧校验', '断网重连'],
    aiParsedStatus: 'completed',
    sections: [
      {
        heading: '1. 报文帧结构与CRC16校验',
        content: '每包数据由帧头0xAA55、2字节序列号、1字节指令字、数据载荷及CRC-16/CCITT校验码构成。',
        codeSnippet: 'struct FrameHeader {\n  uint16_t sync;      // 0xAA55\n  uint16_t seq_id;\n  uint8_t  cmd_type;\n  uint16_t payload_len;\n  uint8_t  data[MAX_LEN];\n  uint16_t crc16;\n};'
      },
      {
        heading: '2. 心跳与网络超时处理 (§6.3)',
        content: '下位机每1000ms发送一次HEARTBEAT_PULSE帧。若上位机超过3000ms未收到心跳，主动触发LINK_TIMEOUT事件，启动离线自保。',
        safetyLevel: 'critical'
      }
    ]
  },
  {
    id: 'doc-risk',
    title: '软件风险分析与控制报告 (ISO 14971)',
    path: '04 风险管理 / 软件风险分析报告',
    category: '风险',
    version: 'V3.0',
    owner: '陈工 (合规质量总监)',
    updated: '4天前',
    summary: '识别出22项重大危害与软件故障模式，包含R-17（穿刺针意外动作致伤）、R-09（样本混淆）及对应的软件风险缓解测试项。',
    relationsCount: 22,
    testCoverageCount: 45,
    riskCount: 14,
    modulesCount: 5,
    tags: ['ISO 14971', '风险控制', 'FMEA', 'R-17'],
    aiParsedStatus: 'completed',
    sections: [
      {
        heading: '风险条目 R-17: 进样机械臂意外动作危害',
        content: '危害场景：操作员正在开盖取出标本或维护注射泵时，上位机重连导致电机非预期复位旋转。\n控制措施：硬件光耦联锁+固件级电机使能硬切断，并在上位机强制引入操作员手动复位握手协议。验证测试：进行TC-R17-01至TC-R17-06断电穿刺极限注入。',
        safetyLevel: 'critical'
      }
    ]
  },
  {
    id: 'doc-tc',
    title: '样本检测全流程自动化回归用例集',
    path: '05 测试资产 / 测试用例 / 样本检测回归用例',
    category: '测试',
    version: 'V2.1',
    owner: '林测试 (测试主管)',
    updated: '5天前',
    summary: '包含126条高优先级正向用例与异常边界用例，是AI自动对齐用例格式规范（前置条件、步骤、预期结果、缺陷打标）的基准金样本。',
    relationsCount: 126,
    testCoverageCount: 126,
    riskCount: 18,
    modulesCount: 6,
    tags: ['金标准', '回归测试', '126用例', '自动化'],
    aiParsedStatus: 'completed',
    sections: [
      {
        heading: '回归用例金样本结构说明',
        content: '所有用例严格遵守四段论：编号(TC-ID)、测试前提(Pre-condition)、执行序列(Step-by-step)与定量预期结果(Expected Value ± Tolerance)。'
      }
    ]
  },
  {
    id: 'doc-bugs',
    title: 'V3.1 历史缺陷与根因分析表',
    path: '05 测试资产 / 缺陷记录 / V3.1缺陷汇总',
    category: '测试',
    version: 'V3.1',
    owner: '测试工程组',
    updated: '6天前',
    summary: '记录过去3个大版本中遗留或修复的42起核心BUG，供AI在做影响范围分析时挖掘历史薄弱环节与高危复发点。',
    relationsCount: 18,
    testCoverageCount: 42,
    riskCount: 9,
    modulesCount: 4,
    tags: ['缺陷挖掘', '历史BUG', '复发防护'],
    aiParsedStatus: 'completed',
    sections: [
      {
        heading: '高频缺陷 BUG-42: 重连后缓冲区残留脏数据',
        content: '根因分析：下位机重启时未清空以太网Socket输入环形队列，导致旧数据被误认为新一轮标本的计数值。已在PR-184中修复，需重点回归。'
      }
    ]
  }
];

export const INITIAL_GRAPH_NODES: GraphNode[] = [
  { id: 'node-core', name: '样本检测主流程', category: 'core', level: 0, x: 0, y: 0, z: 0, relations: 42, testCount: 126, riskText: '2项高风险已覆盖', changeInfo: 'PR-184 核心关联', description: '从试管架进样、条形码扫码、穿刺吸样、试剂反应到激光光学散射检测的核心业务流。' },
  { id: 'node-inject', name: '进样机械控制', category: 'flow', level: 1, x: -1.45, y: 1.05, z: 0.35, relations: 18, testCount: 48, riskText: 'R-17 穿刺防夹伤', changeInfo: '受硬件驱动升级影响', description: '负责三轴步进电机、吸样针升降、清洗池及急救STAT进样位的精密机械运动驱动。' },
  { id: 'node-measure', name: '流式散射测量', category: 'flow', level: 1, x: 1.4, y: 1.1, z: -0.2, relations: 24, testCount: 65, riskText: '光路校准漂移风险', changeInfo: '无变更', description: '半导体激光器、流动室鞘流系统、前向散射与侧向荧光多路光电转换信号链。' },
  { id: 'node-data', name: '检测结果与LIS', category: 'flow', level: 1, x: -1.55, y: -0.95, z: -0.4, relations: 19, testCount: 38, riskText: '病人数据脱敏安全', changeInfo: 'HL7协议兼容', description: '直方图与散点图算法拟合、异常旗标Flagging标记、双向LIS接口传输。' },
  { id: 'node-alarm', name: '异常报警状态机', category: 'flow', level: 1, x: 1.5, y: -0.85, z: 0.45, relations: 26, testCount: 72, riskText: '报警抑制失效', changeInfo: 'PR-184 直接变更点', description: '负责检测通讯超时、电机堵转、气压不足、试剂耗尽等三级告警仲裁及消警。' },
  { id: 'node-assets', name: '受控测试资产库', category: 'test', level: 1, x: 0.1, y: -1.65, z: -0.7, relations: 126, testCount: 1276, riskText: '基线已冻结', changeInfo: '需增量生成12条', description: '包含1276条全生命周期测试用例、自动化脚本、缺陷闭环记录及验证追溯矩阵。' },
  { id: 'node-req', name: '需求 SRS-3.2 §7.4', category: 'core', level: 2, x: -2.35, y: 1.65, z: -0.45, relations: 14, testCount: 22, riskText: '高可靠性标准', changeInfo: '基线文档', description: '通信中断3秒内进入异常中止，禁止未确认自动恢复。' },
  { id: 'node-barcode', name: '条码扫描识别', category: 'flow', level: 2, x: -0.75, y: 1.95, z: 1.0, relations: 9, testCount: 16, riskText: '重码防混淆', changeInfo: '无变更', description: '二维码/Code128自动识别与标本编号挂钩。' },
  { id: 'node-proto', name: '通信协议 V2.4', category: 'protocol', level: 2, x: 2.3, y: 1.6, z: 0.65, relations: 31, testCount: 88, riskText: '丢包乱序容错', changeInfo: 'PR-184 变更依据', description: 'CAN-FD与TCP/IP双通道通信帧、超时重传与心跳同步。' },
  { id: 'node-fsm', name: '电机运动状态机', category: 'flow', level: 2, x: 2.15, y: 0.3, z: -1.15, relations: 15, testCount: 34, riskText: '机械死锁', changeInfo: '驱动重构中', description: 'Init -> Ready -> Sampling -> Washing -> EmergencyStop 状态流转。' },
  { id: 'node-patient', name: '患者脱敏数据流', category: 'core', level: 2, x: -2.4, y: -1.45, z: 0.75, relations: 12, testCount: 28, riskText: '合规性隐私', changeInfo: '已过审', description: 'GDPR与医疗器械个人敏感信息保护隔离。' },
  { id: 'node-r17', name: '风险控制 R-17', category: 'risk', level: 2, x: 2.5, y: -1.45, z: -0.55, relations: 22, testCount: 45, riskText: '极高安全等级 (ISO 14971)', changeInfo: 'PR-184 强关联', description: '防止重连瞬间步进电机意外自旋刺伤实验员的硬件与软件双重防线。' },
  { id: 'node-tc08', name: '用例 TC-COMM-08', category: 'test', level: 2, x: 0.95, y: -2.25, z: 0.8, relations: 8, testCount: 1, riskText: '待重新验证', changeInfo: '受PR-184影响需回归', description: '验证拔掉以太网线后，UI在3秒内呈现高亮告警并终止进样动作。' },
  { id: 'node-bug42', name: '缺陷 BUG-42 (已修复)', category: 'defect', level: 2, x: -0.95, y: -2.2, z: -1.0, relations: 11, testCount: 4, riskText: '脏数据残留', changeInfo: 'PR-184 修复目标', description: '断连后缓冲区残留脏数据导致下一标本数据错位。' }
];

export const GRAPH_EDGES: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5],
  [1, 6], [1, 7], [2, 8], [2, 9], [3, 10],
  [4, 11], [5, 12], [5, 13], [4, 8], [3, 12],
  [1, 11], [4, 13], [8, 12]
];

export const INITIAL_TEST_DRAFT: TestDraft = {
  title: 'PR-184 异常报警与重连容错专项测试方案',
  version: 'AI-Draft V1.3',
  status: '已就绪 (可执行)',
  scope: '通信协议升级 + 报警状态机 + R-17安全联锁',
  objective: '全面验证在上下位机网络抖动、偶发断网、瞬时拔线及急停按下场景下，系统具备3秒内自保锁止、拒绝危险自动复位，且重连后不产生脏数据的鲁棒性。',
  scopeList: [
    '通信中断3000ms时限检测与系统状态下沉验证',
    'Level 3 紧急告警抢占显示与操作员手动消警机制',
    '重连握手成功后防误动保护（严禁未确认恢复）',
    '残余缓存数据清空与标本识别防错（BUG-42 防复发）'
  ],
  testPoints: [
    '【TP-01】进样吸样过程中物理拔线：验证3s内转入“异常中止”并断开电机驱动使能',
    '【TP-02】并发报警风暴：同时注入“气压过低”与“通信中断”，验证根因告警置顶且次级被抑制',
    '【TP-03】热插拔网线恢复：重新插线后，验证必须操作员在弹窗手动点击“确认复位”后方可重新回原点',
    '【TP-04】残余数据一致性：下位机重启后发出的首包样本数据，与上位机数据库批次严格一致，无错位'
  ],
  cases: [
    {
      id: 'TC-PR184-01',
      name: '进样吸样作业中网络突发中断安全联锁测试',
      priority: 'P0',
      type: '安全联锁',
      precondition: '上位机与分析仪处于Ready待机，已放入标本架，启动5个样本连续批量检测，机械臂正在第2个标本位下压穿刺。',
      steps: [
        '1. 在穿刺针下行至液面探测触发瞬间，使用可编程网闸切断以太网端口（模拟物理断线）；',
        '2. 观察上位机界面响应时间及下位机步进电机动作；',
        '3. 检查上位机是否记录Error Log并弹窗报警。'
      ],
      expectedResult: '断网后3000ms内，上位机状态变为“异常中止”；下位机硬件联锁切断电机驱动，穿刺针立即制动；界面弹出不可忽略的红色Critical断连告警，审计日志写入TIMESTAMP与断连故障码F-088。',
      traceability: 'SRS-3.2 §7.4, 协议 V2.4 §6.3, 风险 R-17'
    },
    {
      id: 'TC-PR184-02',
      name: '断网恢复后防止机械机构自动误动测试',
      priority: 'P0',
      type: '异常注入',
      precondition: '系统由于TC-PR184-01进入“异常中止”，穿刺针停留在中间高度，操作员正开启安全防护罩检查。',
      steps: [
        '1. 恢复以太网物理连接；',
        '2. 观察上位机网络指示灯及下位机机械动作；',
        '3. 在不进行任何UI确认操作的情况下静置60秒；',
        '4. 随后在UI点击“确认清除并复位原点”。'
      ],
      expectedResult: '网络恢复后，系统仅完成TCP三次握手及状态参数同步，严禁任何电机自动启动复位旋转；UI弹出“发现未完成标本，请确认安全后手动复位”；在操作人员点击确认前，机械臂保持绝对静止（满足R-17防护要求）。',
      traceability: '风险控制 R-17, ADD-Alarm §2.1'
    },
    {
      id: 'TC-PR184-03',
      name: '重连后Socket缓冲区脏数据冲洗验证 (BUG-42回归)',
      priority: 'P1',
      type: '通信容错',
      precondition: '下位机正向上位机传输第3标本的前向散射光计数流时发生闪断（断网持续800ms后自动恢复）。',
      steps: [
        '1. 注入800ms网络丢包抖动；',
        '2. 待协议自愈重连后，继续完成该批次剩余标本测试；',
        '3. 导出当批次SQLite结果数据库与下位机SD卡原始采样文件进行哈希值比对。'
      ],
      expectedResult: '系统丢弃未传输完整的坏帧，不将截断数据拼接到新包头部；重测机制触发单样复测提示；导出的最终血液分类计数结果与原始仪器采样严格一致，无样本错位。',
      traceability: 'BUG-42, 通信协议 V2.4 §4.2'
    },
    {
      id: 'TC-PR184-04',
      name: '多重异常并发时告警收敛与高优先级保持',
      priority: 'P1',
      type: '功能测试',
      precondition: '标本正在混匀，仪器试剂余量低于5%（Level 1报警状态中）。',
      steps: [
        '1. 同时断开CAN总线通信线并触发紧急制动按钮（Level 3）；',
        '2. 观察警报管理器的通知栏列表与声音提示。'
      ],
      expectedResult: '蜂鸣器由短间隙轻微提示音立即跃升为高频长鸣急停音；界面主Banner被“急停制动已激活/通信中断”红色警告占满，低优先级“试剂不足”被降至二级折叠栏，未发生告警覆盖丢失。',
      traceability: 'ADD-Alarm §1.2, SRS-3.2 §8.1'
    }
  ],
  citations: [
    '软件需求规格说明书 (SRS-3.2 §7.4 通信异常处理)',
    '上下位机通信协议 (V2.4 §6.3 心跳超时规范)',
    '软件风险分析报告 (ISO 14971 R-17 机械运动致伤防护)',
    '历史缺陷汇总 (BUG-42 缓冲区数据错位防复发)'
  ]
};
