import { ProjectItem, ProjectDocument, GraphNode, TestCaseItem, TestDraft, ChatSession } from '../types';
import { INITIAL_DOCUMENTS, INITIAL_GRAPH_NODES, GRAPH_EDGES, INITIAL_TEST_DRAFT } from './mockData';
import { INITIAL_CHAT_SESSIONS } from './mockSessions';

// ==========================================
// 2. 生化免疫一体机 V1.4 (CHEM-140) 专用数据
// ==========================================
const CHEM_DOCUMENTS: ProjectDocument[] = [
  {
    id: 'doc-chem-arch',
    title: '生化免疫一体机系统架构与时序规范',
    path: '01 产品与需求 / 系统架构规范',
    category: '需求',
    version: 'V1.4',
    owner: '张工 (系统架构组)',
    updated: '20分钟前',
    summary: '规定生化免疫双通道协同调度、试剂盘与反应盘双环同心旋转机构、37℃精密恒温循环及比色/化学发光双探测器时序。',
    relationsCount: 38,
    testCoverageCount: 112,
    riskCount: 7,
    modulesCount: 5,
    tags: ['受控文档', 'IEC 62304 Class B', '双通道调度', '时序控制'],
    aiParsedStatus: 'completed',
    sections: [
      {
        heading: '1. 双通道工作流与反应节拍',
        content: '生化检测采用360次/小时恒速比色光度计通道，化学发光采用180测试/小时磁微粒分离发光通道。双通道公用样本进样轨道，由中央仲裁调度器按优先级分配加样针时间窗。'
      },
      {
        heading: '2. 试剂盘与冷藏舱控温安全保护',
        content: '试剂冷藏盘温度必须稳定在2℃~8℃区间。当半导体制冷片检测到温升突破10℃且持续超过15分钟时，上位机必须触发Level 2警报并锁定受影响试剂项目的自动测试。',
        safetyLevel: 'warning'
      }
    ]
  },
  {
    id: 'doc-chem-temp',
    title: '温育盘精密温控(37±0.1℃)与PID调节设计',
    path: '02 软件设计 / 恒温槽详细设计',
    category: '设计',
    version: 'V1.2',
    owner: '赵工 (热工控制)',
    updated: '1天前',
    summary: '阐述多路PT1000高精温度传感器采样、自整定PID加热膜控制算法、开盖散热热补偿曲线及温度超限联锁逻辑。',
    relationsCount: 29,
    testCoverageCount: 68,
    riskCount: 5,
    modulesCount: 3,
    tags: ['PID温控', 'PT1000', '恒温温育', '超限保护'],
    aiParsedStatus: 'completed',
    sections: [
      {
        heading: '1. 温度超限与加热保护联锁',
        content: '当任意加热回路传感器探测温度超过42.0℃时，硬件热敏开关切断24V加热电源；上位机必须在200ms内进入OVERHEAT_HOLD态，停止向反应槽注样。',
        safetyLevel: 'critical'
      }
    ]
  },
  {
    id: 'doc-chem-rfid',
    title: '试剂条码多通道射频识别与防混淆协议',
    path: '03 接口与协议 / 试剂识别协议',
    category: '协议',
    version: 'V2.0',
    owner: '钱工 (通信协议组)',
    updated: '3天前',
    summary: '定义13.56MHz RFID天线轮询时钟、试剂瓶余量与开封效期防伪算法、非法未授权试剂锁定逻辑。',
    relationsCount: 24,
    testCoverageCount: 56,
    riskCount: 4,
    modulesCount: 3,
    tags: ['RFID射频', '防混淆', '试剂效期', '防伪校验'],
    aiParsedStatus: 'completed',
    sections: [
      {
        heading: '1. 试剂装载与自动校验机制',
        content: '试剂瓶放入试剂盘后，RFID天线必须在试剂盘旋转1圈（3.2秒）内完成48个试剂位的UID及批次校验。校验不通过的瓶位自动标记为FORBIDDEN。'
      }
    ]
  },
  {
    id: 'doc-chem-risk',
    title: '光电倍增管与试剂交叉污染风险分析报告',
    path: '04 风险管理 / 风险分析报告',
    category: '风险',
    version: 'V1.3',
    owner: '孙工 (合规质量总监)',
    updated: '5天前',
    summary: '识别出试剂探针携带污染率(Carryover)超标导致假阳性、光电暗室漏光导致本底计数饱和等重大质量风险。',
    relationsCount: 19,
    testCoverageCount: 42,
    riskCount: 11,
    modulesCount: 4,
    tags: ['ISO 14971', '交叉污染', '暗室漏光', '光电倍增管'],
    aiParsedStatus: 'completed',
    sections: [
      {
        heading: '风险条目 CHEM-R08: 样本针携带污染导致异常诊断',
        content: '危害场景：高浓度抗原样本吸取后，清洗池内壁高压冲洗流量不足，导致残留至下一个阴性标本中。\n控制措施：三级清洗瀑布流+外壁强吸干，上位机实施高浓度标本后强制执行超级清洗周期(Super Wash)。',
        safetyLevel: 'critical'
      }
    ]
  },
  {
    id: 'doc-chem-tc',
    title: '交叉污染率(Carryover)与微量加样验证用例集',
    path: '05 测试资产 / 自动化用例集',
    category: '测试',
    version: 'V1.1',
    owner: '周测试 (生化测试组长)',
    updated: '1周前',
    summary: '规范利用高浓度HBsAg样本与纯水交替加样法验证携带污染率≤0.1ppm的专用测试用例和容积精度验证规范。',
    relationsCount: 88,
    testCoverageCount: 88,
    riskCount: 12,
    modulesCount: 4,
    tags: ['金标准', '交叉污染测试', '微量注样', '自动化测试'],
    aiParsedStatus: 'completed',
    sections: [
      {
        heading: '携带污染率测试方案设计',
        content: '以10^7 IU/mL高浓度质控液连续加注3孔(H1, H2, H3)，紧随其后连续加注3孔空白去离子水(L1, L2, L3)。计算Carryover = (L1 - L3)/(H3 - L3) * 100%，结果必须≤0.0001%。'
      }
    ]
  }
];

const CHEM_CHAT_SESSIONS: ChatSession[] = [
  {
    id: 'session-chem-temp',
    title: '恒温孵育盘温度漂移超限与强制停机逻辑',
    category: '安全联锁',
    updatedAt: '今天 11:30',
    messages: [
      {
        id: 'msg-chem-1',
        sender: 'user',
        timestamp: '11:28',
        text: '当反应温育槽温度探测超过42℃时，生化免疫系统有何保护联锁机制？'
      },
      {
        id: 'msg-chem-2',
        sender: 'assistant',
        timestamp: '11:30',
        text: '根据《温育盘精密温控设计说明书 V1.2》与风险管控规范，系统触发如下保护措施：',
        structuredAnswer: {
          summary: '温育槽实时监测温度超过42.0℃时，触发硬件继电器硬断电与上位机OVERHEAT_HOLD停机联锁。',
          steps: [
            '硬件过温探针触发硬断电，切断24V加热管供电；',
            '上位机在200ms内切入OVERHEAT_HOLD停机状态，立即中止新试剂的注入；',
            '正在进行光学比色的反应杯完成当前点测光后自动排入废液槽；',
            '在UI界面弹出不可屏蔽的红色Critical警报并写入审计表。'
          ],
          safetyConstraint: '必须人工检查温控回路并在维护模式重新校准后方可清除警报。',
          citations: [
            {
              id: 'chem-c1',
              title: '温育盘精密温控说明书',
              section: '§1.1 温度超限与加热保护联锁',
              relevance: 98,
              snippet: '当任意加热回路传感器探测温度超过42.0℃时，硬件热敏开关切断加热电源，系统进入OVERHEAT_HOLD。'
            }
          ],
          confidence: 97
        }
      }
    ]
  },
  {
    id: 'session-chem-rfid',
    title: '试剂盒射频防呆与有效品质控拦截机制',
    category: '试剂管理',
    updatedAt: '昨天 15:10',
    messages: [
      {
        id: 'msg-chem-rf-1',
        sender: 'user',
        timestamp: '15:08',
        text: '试剂盒开封效期过期或批号不符时，系统如何拦截检测？'
      },
      {
        id: 'msg-chem-rf-2',
        sender: 'assistant',
        timestamp: '15:10',
        text: '根据《试剂条码多通道射频识别与防混淆协议 V2.0》：',
        structuredAnswer: {
          summary: 'RFID天线读取到试剂盒开封天数大于设定阈值（如28天）时，系统自动对该瓶位打上FORBIDDEN标签。',
          steps: [
            '天线扫描UID并核验加密签名；',
            '若开封时间超限，在试剂盘UI呈现红叉告警；',
            '若测试队列中包含该项目，自动跳过并通知操作员更换试剂。'
          ],
          safetyConstraint: '严禁操作员无密码强行绕过过期试剂拦截。',
          citations: [
            {
              id: 'chem-c2',
              title: '试剂条码射频识别协议',
              section: '§1 试剂装载校验',
              relevance: 94,
              snippet: '校验不通过的瓶位自动标记为FORBIDDEN，禁止加样针进入。'
            }
          ],
          confidence: 95
        }
      }
    ]
  }
];

const CHEM_GRAPH_NODES: GraphNode[] = [
  { id: 'cnode-core', name: '生化免疫双通道主控', category: 'core', level: 0, x: 0, y: 0, z: 0, relations: 38, testCount: 112, riskText: '双通道协同调度', changeInfo: 'V1.4 核心模块', description: '负责生化比色光度计与化学发光磁珠分离通道的时序仲裁与样本管路协调。' },
  { id: 'cnode-reagent', name: '低温冷藏试剂盘', category: 'flow', level: 1, x: -1.4, y: 1.1, z: 0.3, relations: 24, testCount: 56, riskText: '温度超标防结露', changeInfo: '新增半导体制冷', description: '2℃~8℃试剂保鲜温控舱，配RFID全自动无线识别天线组。' },
  { id: 'cnode-incub', name: '37℃恒温反应槽', category: 'flow', level: 1, x: 1.4, y: 1.0, z: -0.3, relations: 29, testCount: 68, riskText: '42℃高温硬断电', changeInfo: '热平衡优化', description: '高精度液体循环恒温槽，保证酶动力学比色与抗原抗体结合的最佳孵育条件。' },
  { id: 'cnode-wash', name: '清洗针与防污染机构', category: 'flow', level: 1, x: -1.5, y: -1.0, z: -0.4, relations: 19, testCount: 42, riskText: '携带污染≤0.1ppm', changeInfo: '三级瀑布流改造', description: '多级内外壁高压冲洗站，杜绝高浓度标本对后续测试的交叉干扰。' },
  { id: 'cnode-optics', name: '光电倍增暗室(PMT)', category: 'flow', level: 1, x: 1.5, y: -0.9, z: 0.4, relations: 22, testCount: 58, riskText: '暗室漏光失真', changeInfo: '微弱光放大', description: '用于检测化学发光光子计数的超高灵敏度光电探测系统。' }
];

const CHEM_TEST_DRAFT: TestDraft = {
  title: 'CHEM-140 试剂盘低温冷藏与高精度注样专项测试方案',
  version: 'AI-Draft V1.2',
  status: '已就绪 (可执行)',
  scope: '恒温孵育PID调节 + 携带污染率防范 + RFID试剂防呆',
  objective: '验证生化免疫一体机在恶劣环境温度下冷藏恒温精度、42℃过温紧急断电保护时延，以及连续高浓度标本冲洗后携带污染率不大于0.1ppm。',
  scopeList: [
    '37.0±0.1℃ 恒温反应盘满载动态控温能力',
    '超温 42.0℃ 硬件脱扣与上位机状态切断验证',
    '连续高抗原浓度样本加样后 Carryover 残留测试',
    '过期与未授权 RFID 试剂瓶放入后自动锁定'
  ],
  testPoints: [
    '【CHEM-TP01】恒温槽模拟断偶：断开主加热探头，验证在100ms内关断加热供电',
    '【CHEM-TP02】交叉污染极限测试：连续注入10^7浓度样本后测量纯水背景值',
    '【CHEM-TP03】试剂冷藏盘开盖热冲击：开盖30分钟后检测试剂品质保护响应'
  ],
  cases: [
    {
      id: 'TC-CHEM-01',
      name: '恒温反应槽超温 42℃ 硬件切断与上位机联锁测试',
      priority: 'P0',
      type: '安全联锁',
      precondition: '生化反应槽正在进行48个比色杯恒温温育，加热回路处于工作状态。',
      steps: [
        '1. 注入模拟信号使温控回路检测温度达到 42.1℃；',
        '2. 监测加热器供电继电器物理跳脱时延；',
        '3. 检查上位机画面报警与加样泵启闭状态。'
      ],
      expectedResult: '供电继电器在150ms内断开，上位机转入 OVERHEAT_HOLD 保护状态，停止注样并记录紧急故障代码 E-420。',
      traceability: '恒温槽详细设计 §1.1, 风险报告 CHEM-R08'
    },
    {
      id: 'TC-CHEM-02',
      name: '试剂加样针微量注样携带污染率 Carryover 极限测试',
      priority: 'P0',
      type: '功能测试',
      precondition: '清洗站供液压力达到额定250kPa，纯水清洗液充足。',
      steps: [
        '1. 连续加注3孔高浓度抗原质控品(H1, H2, H3)；',
        '2. 紧接加注3孔空白纯水(L1, L2, L3)；',
        '3. 计算 Carryover 比率。'
      ],
      expectedResult: '携带污染比率 Carryover 计算值严格 ≤ 0.0001% (0.1ppm)，符合生化免疫标准。',
      traceability: '生化测试用例集 §1.0, ISO 14971'
    }
  ],
  citations: [
    '生化免疫一体机系统架构与时序规范 (V1.4)',
    '温育盘精密温控(37±0.1℃)与PID调节设计 (V1.2)',
    '光电倍增管与试剂交叉污染风险分析报告 (V1.3)'
  ]
};

// ==========================================
// 3. 流式细胞流水线 V2.0 (FLOW-200) 专用数据
// ==========================================
const FLOW_DOCUMENTS: ProjectDocument[] = [
  {
    id: 'doc-flow-track',
    title: '流式细胞自动化流水线轨道通信与调度算法规格',
    path: '01 产品与需求 / 轨道调度算法',
    category: '需求',
    version: 'V2.0',
    owner: '刘工 (自动化流水线主任)',
    updated: '15分钟前',
    summary: '规范双向磁力驱动轨道标本管传送、动态分流器道岔控制、防撞管减速算法及急救急诊管直接进样专用通道。',
    relationsCount: 45,
    testCoverageCount: 138,
    riskCount: 9,
    modulesCount: 6,
    tags: ['流水线', '磁悬浮轨道', '分流调度', 'IEC 62304 Class C'],
    aiParsedStatus: 'completed',
    sections: [
      {
        heading: '1. 轨道标本运输与防撞击安全区',
        content: '每个运输小车配备红外距离传感器与RFID定标码，最高运送速度1.2m/s。前车制动时，后车必须在150mm制动距离内平稳减速停靠，杜绝标本管倾覆或液体溅出。'
      },
      {
        heading: '2. 轨道卡管与机械异物急停联锁',
        content: '当轨道霍尔传感器检测到小车堵塞超过2000ms时，启动相应区间段局部急停，其余独立环路保持低速巡航，避免全线瘫痪。',
        safetyLevel: 'critical'
      }
    ]
  },
  {
    id: 'doc-flow-laser',
    title: '三激光多色荧光探测器增益校准与补偿规约',
    path: '02 软件设计 / 光学探测系统设计',
    category: '设计',
    version: 'V2.1',
    owner: '吴工 (激光光学工程)',
    updated: '2天前',
    summary: '定义488nm蓝光、638nm红光及405nm紫光三激光源时间延迟校正、荧光串色矩阵溢出计算及微球自动质控流程。',
    relationsCount: 33,
    testCoverageCount: 82,
    riskCount: 6,
    modulesCount: 4,
    tags: ['三激光', '多色荧光', '串色补偿', '时间延迟校准'],
    aiParsedStatus: 'completed',
    sections: [
      {
        heading: '1. 激光器功率稳定度与安全联锁',
        content: '激光器工作时，若机壳防辐射防护罩被意外打开，安全互锁微动开关必须在5ms内硬件切断激光管发射端高压，以保护实验人员视力。',
        safetyLevel: 'critical'
      }
    ]
  },
  {
    id: 'doc-flow-sheath',
    title: '微流控鞘流液路压力差动平衡与堵针安全预警',
    path: '03 接口与协议 / 流体动力学控制',
    category: '协议',
    version: 'V1.8',
    owner: '郑工 (流体系统组)',
    updated: '4天前',
    summary: '设定鞘液压力(45±0.5kPa)与样本注入压力差控制逻辑、流动室激光照射区流束聚焦直径调整及堵孔自动反冲洗规范。',
    relationsCount: 28,
    testCoverageCount: 64,
    riskCount: 5,
    modulesCount: 3,
    tags: ['微流控', '鞘流差动', '堵针自愈', '反冲洗'],
    aiParsedStatus: 'completed',
    sections: [
      {
        heading: '1. 压力差异常保护与反冲洗自愈',
        content: '当样本液路与鞘液差压超出正常值15%并持续2秒，判定为喷嘴堵塞。系统立即暂停激光采集，自动执行200kPa高压反向冲洗。'
      }
    ]
  },
  {
    id: 'doc-flow-risk',
    title: '激光器高压与轨道机械臂安全防护报告 (ISO 14971)',
    path: '04 风险管理 / Class C 风险专篇',
    category: '风险',
    version: 'V2.0',
    owner: '何工 (安全认证工程师)',
    updated: '1周前',
    summary: '针对 Class C 级别医疗软件，对激光辐射泄漏、流水线轨道夹挤标本手部安全及强高压电弧防护设立全冗余安全保护措施。',
    relationsCount: 25,
    testCoverageCount: 52,
    riskCount: 15,
    modulesCount: 5,
    tags: ['Class C', '激光安全', '机械防夹', '冗余急停'],
    aiParsedStatus: 'completed',
    sections: [
      {
        heading: '风险条目 FLOW-R01: 激光辐射溢出与视网膜损伤防护',
        content: '危害场景：光罩开启调试时，固件控制失灵继续点亮激光。\n控制措施：采用双独立硬件回路互锁开关，完全绕开CPU软件控制，开盖瞬间强制关闭激光源电源。',
        safetyLevel: 'critical'
      }
    ]
  },
  {
    id: 'doc-flow-tc',
    title: '流水线轨道卡管与激光微流控自动化测试集',
    path: '05 测试资产 / 流水线用例库',
    category: '测试',
    version: 'V2.0',
    owner: '马主管 (系统集成测试)',
    updated: '1周前',
    summary: '包含连续运行72小时无卡管稳定性测试、急救急诊插队时延测试、激光互锁断电时延测试等140+条严苛用例。',
    relationsCount: 140,
    testCoverageCount: 140,
    riskCount: 16,
    modulesCount: 6,
    tags: ['72小时压力测试', '卡管容错', '激光互锁验证', '自动化测试'],
    aiParsedStatus: 'completed',
    sections: [
      {
        heading: '72小时高负荷不间断进样稳定性验证',
        content: '以每小时300管全速连续运行72小时，允许单轨局部拥堵自愈，严禁出现样本管倾翻破损或全线卡死。'
      }
    ]
  }
];

const FLOW_CHAT_SESSIONS: ChatSession[] = [
  {
    id: 'session-flow-laser',
    title: '机箱防护罩开启时激光器硬件快速断电规范',
    category: '光学安全',
    updatedAt: '今天 09:15',
    messages: [
      {
        id: 'msg-flow-1',
        sender: 'user',
        timestamp: '09:12',
        text: '实验人员打开流式细胞仪维护仓门时，激光器如何确保绝对安全断开？'
      },
      {
        id: 'msg-flow-2',
        sender: 'assistant',
        timestamp: '09:15',
        text: '根据《激光安全防护报告 (Class C)》与光学设计规范：',
        structuredAnswer: {
          summary: '采用双路物理微动互锁开关，开盖时在5毫秒内硬切断三路激光器高压电源，完全独立于CPU软件。',
          steps: [
            '仓门开启位移触发机械连锁微动开关；',
            '硬件电源供电继电器在5ms内瞬时掉电；',
            '上位机同步监视该状态，锁定所有进样泵并发出黄色提示“光路维护屏蔽”；',
            '关盖后必须在上位机进行操作员身份卡重新认证方可重启激光。'
          ],
          safetyConstraint: '该保护回路通过硬件联锁实现，严禁任何软件配置项旁路关闭。',
          citations: [
            {
              id: 'flow-c1',
              title: '三激光多色荧光探测器设计',
              section: '§1 激光器功率稳定度与安全联锁',
              relevance: 99,
              snippet: '若机壳防辐射防护罩被意外打开，安全互锁微动开关必须在5ms内硬件切断激光管发射端高压。'
            }
          ],
          confidence: 99
        }
      }
    ]
  },
  {
    id: 'session-flow-track',
    title: '轨道标本管拥堵分流与急诊管避让算法',
    category: '轨道调度',
    updatedAt: '昨天 14:00',
    messages: [
      {
        id: 'msg-flow-tr-1',
        sender: 'user',
        timestamp: '13:58',
        text: '流水线轨道前方出现小车卡阻时，调度算法如何处置？'
      },
      {
        id: 'msg-flow-tr-2',
        sender: 'assistant',
        timestamp: '14:00',
        text: '根据《轨道通信与调度算法规格 V2.0》：',
        structuredAnswer: {
          summary: '检测到卡管超过2000ms时，触发分区段局部刹车，道岔自动将后续标本改道至备用环形缓冲轨。',
          steps: [
            '霍尔传感器探测小车超时未通过检测点；',
            '后方运输小车进入150mm防撞平稳停靠；',
            '前置道岔切换至环形旁路道；',
            '中控大屏闪烁卡阻区域位置并推送清洁向导。'
          ],
          safetyConstraint: '严禁后方小车盲目加速推挤卡阻车辆。',
          citations: [
            {
              id: 'flow-c2',
              title: '轨道调度算法规格',
              section: '§2 轨道卡管与机械异物急停联锁',
              relevance: 96,
              snippet: '霍尔传感器检测到小车堵塞超过2000ms时，启动相应区间段局部急停。'
            }
          ],
          confidence: 96
        }
      }
    ]
  }
];

const FLOW_GRAPH_NODES: GraphNode[] = [
  { id: 'fnode-core', name: '流水线主线调度中枢', category: 'core', level: 0, x: 0, y: 0, z: 0, relations: 45, testCount: 138, riskText: '全线高通量调度', changeInfo: 'V2.0 磁浮升级', description: '智能磁驱双向循环轨道总控，实现标本管毫秒级智能分流、道岔选择与避碰。' },
  { id: 'fnode-laser', name: '488nm/638nm双激光光路', category: 'flow', level: 1, x: -1.45, y: 1.1, z: 0.35, relations: 33, testCount: 82, riskText: '5ms硬件开盖关断', changeInfo: '光学防辐射护罩', description: '蓝/红双激光聚焦照射区与多通道分色镜片阵列。' },
  { id: 'fnode-fluid', name: '高精度微流控鞘液系统', category: 'flow', level: 1, x: 1.4, y: 1.0, z: -0.3, relations: 28, testCount: 64, riskText: '鞘流差压动态平衡', changeInfo: '微流控芯片优化', description: '提供层流鞘液包裹血细胞单列通过激光照射点。' },
  { id: 'fnode-track', name: '磁吸式标本轨道小车', category: 'flow', level: 1, x: -1.5, y: -0.9, z: -0.4, relations: 25, testCount: 52, riskText: '150mm平稳防撞', changeInfo: '速度达1.2m/s', description: '搭载标本采血管快速送达指定分析分析工位的轨道小车。' },
  { id: 'fnode-sort', name: '急诊管自动超车道岔', category: 'flow', level: 1, x: 1.5, y: -1.0, z: 0.4, relations: 20, testCount: 46, riskText: 'STAT专用通道', changeInfo: '直达穿刺工位', description: '识别到绿色急诊标本时，道岔电磁铁极速吸合切入直通进样通道。' }
];

const FLOW_TEST_DRAFT: TestDraft = {
  title: 'FLOW-200 高压激光与轨道微流控联锁验证方案',
  version: 'AI-Draft V2.0',
  status: '已就绪 (可执行)',
  scope: '磁悬浮轨道调度 + 双激光硬件断电 + 鞘流堵孔自愈',
  objective: '全流程验证流水线在连续重载进样场景下的轨道避碰鲁棒性、防护罩开盖5ms激光熄弧可靠性以及72小时无卡管稳定性。',
  scopeList: [
    '机壳防护罩开盖瞬间 5ms 激光供电硬关断测试',
    '轨道小车模拟堵转后 2000ms 局部停运与旁路分流',
    '微流控压差突变时自动 200kPa 反向冲洗功能',
    '72小时不间断进样抗疲劳压力测试'
  ],
  testPoints: [
    '【FLOW-TP01】开盖激光硬切断：使用高频示波器监测开盖微动开关信号与激光器驱动电流，测量断电延迟',
    '【FLOW-TP02】轨道机械卡阻：在道岔前放置障碍物，验证后续小车在150mm前减速停稳',
    '【FLOW-TP03】鞘液压差跌落：模拟拔出鞘液输入管，验证激光采集自动冻结'
  ],
  cases: [
    {
      id: 'TC-FLOW-01',
      name: '机壳防护门开启时激光器5毫秒硬件快速关断验证',
      priority: 'P0',
      type: '安全联锁',
      precondition: '三激光器处于满功率激发态，光学探测系统正在对荧光标本进行信号采集。',
      steps: [
        '1. 快速扳动机壳安全防护门手柄；',
        '2. 触发微动开关触点；',
        '3. 高速光电探头测量激光束完全熄灭所需耗时。'
      ],
      expectedResult: '激光输出在门缝张开小于2mm、耗时在4.2ms（严格≤5ms）内彻底关闭；上位机呈现“安全门开启，激光已物理断电”，满足IEC 60825激光安全要求。',
      traceability: '激光安全报告 FLOW-R01, 光学系统设计 §1.1'
    },
    {
      id: 'TC-FLOW-02',
      name: '轨道小车卡管异物感知与旁路分流避碰测试',
      priority: 'P0',
      type: '异常注入',
      precondition: '流水线轨道正以1.2m/s满负荷运送12个标本管小车。',
      steps: [
        '1. 在主线3号监测点人为拦截小车；',
        '2. 观察后车响应及道岔切换动作；',
        '3. 检查上位机全线拓扑图报警状态。'
      ],
      expectedResult: '后车在距离前车140mm处安全平稳停靠，未发生碰管倾覆；道岔在2000ms判定卡阻后将后续小车切入环形备用轨，系统未发生全线瘫痪。',
      traceability: '轨道调度算法规格 §2.0, IEC 62304 Class C'
    }
  ],
  citations: [
    '流式细胞自动化流水线轨道通信与调度算法规格 (V2.0)',
    '三激光多色荧光探测器增益校准与补偿规约 (V2.1)',
    '激光器高压与轨道机械臂安全防护报告 (ISO 14971)'
  ]
};

// ==========================================
// 1. 血液分析仪 V3.2 (HEMA-320) 初始数据
// ==========================================
export const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'proj-hema',
    name: '血液分析仪 V3.2',
    code: 'HEMA-320',
    version: 'V3.2',
    category: '血液学 / 激光流式',
    standard: 'IEC 62304 Class B / ISO 14971',
    description: '五分类全血细胞分析仪与上位机监控系统，涵盖激光散射光路检测、穿刺吸样机械联锁与双向 LIS 协议对接。',
    updatedAt: '刚刚活跃',
    documents: INITIAL_DOCUMENTS,
    selectedDocId: 'doc-srs',
    sessions: INITIAL_CHAT_SESSIONS,
    currentSessionId: INITIAL_CHAT_SESSIONS[0].id,
    graphNodes: INITIAL_GRAPH_NODES,
    graphEdges: GRAPH_EDGES,
    testDraft: INITIAL_TEST_DRAFT
  },
  {
    id: 'proj-chem',
    name: '生化免疫一体机 V1.4',
    code: 'CHEM-140',
    version: 'V1.4',
    category: '临床生化 / 化学发光免疫',
    standard: 'IEC 62304 Class B / ISO 15189',
    description: '全自动生化免疫双通道检测一体机，重点管控恒温孵育槽温控精度(37±0.1℃)、试剂冷藏盘防凝露与清洗针交叉污染防护。',
    updatedAt: '10分钟前',
    documents: CHEM_DOCUMENTS,
    selectedDocId: 'doc-chem-arch',
    sessions: CHEM_CHAT_SESSIONS,
    currentSessionId: CHEM_CHAT_SESSIONS[0].id,
    graphNodes: CHEM_GRAPH_NODES,
    graphEdges: [[0, 1], [0, 2], [0, 3], [0, 4], [1, 2], [2, 4]],
    testDraft: CHEM_TEST_DRAFT
  },
  {
    id: 'proj-flow',
    name: '流式细胞流水线 V2.0',
    code: 'FLOW-200',
    version: 'V2.0',
    category: '细胞生物 / 轨道流水线系统',
    standard: 'IEC 62304 Class C / ISO 13485',
    description: '高通量多激光流式细胞检测与自动化标本轨道流水线，支持样本智能分拣、微流控鞘液动态平衡与高压激光安全防护。',
    updatedAt: '1小时前',
    documents: FLOW_DOCUMENTS,
    selectedDocId: 'doc-flow-track',
    sessions: FLOW_CHAT_SESSIONS,
    currentSessionId: FLOW_CHAT_SESSIONS[0].id,
    graphNodes: FLOW_GRAPH_NODES,
    graphEdges: [[0, 1], [0, 2], [0, 3], [0, 4], [1, 2], [3, 4]],
    testDraft: FLOW_TEST_DRAFT
  }
];
