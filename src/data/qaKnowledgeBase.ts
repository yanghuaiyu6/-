import { ChatCitation } from '../types';

export interface QaScenario {
  id: string;
  category: '通信异常' | '安全联锁' | '时序性能' | '历史缺陷' | '常规业务';
  question: string;
  summary: string;
  steps: string[];
  safetyConstraint?: string;
  citations: ChatCitation[];
  confidence: number;
}

export const QA_KNOWLEDGE_BASE: QaScenario[] = [
  {
    id: 'qa-disconnect',
    category: '通信异常',
    question: '设备在检测过程中断开连接，系统应如何处理？',
    summary: '系统进入“异常中止 (Abnormal Abort)”受控安全态，封存有效数据并锁死进样机构',
    steps: [
      '1. 链路丢失判定：在连续 3 个心跳周期（合计 3000ms）未收到 ACK 信号时，立即确认物理通信中断。',
      '2. 指令自保切断：上位机即刻终止后续所有电机运动和穿刺加样指令的下发，冻结检测排队队列。',
      '3. 原始数据封存：将当前测试样本标记为“Abnormal Aborted”，安全落盘已采集的散射光有效光电数据。',
      '4. 界面声光报警：全屏弹出不可被屏蔽的 Level 3 红色严重告警，蜂鸣器长鸣，写入加密审计日志(F-088)。',
      '5. 安全恢复机制：重新握手后仅回读传感器状态，必须经操作人员人工在界面点击“确认复位”后，方可解除急停进入 Ready 态。'
    ],
    safetyConstraint: '安全联锁规范 (ISO 14971 R-17)：通信重新恢复后，严禁电机自动寻零或自动复位，必须由操作员在界面人工确认并清空样品槽，防止机械夹伤。',
    citations: [
      {
        id: 'c-srs-74',
        title: '软件需求规格说明书',
        section: 'SRS-3.2 §7.4 通信异常处理',
        relevance: 99,
        snippet: '通信中断判定：连续3s超时转入AbnormalAbort，封存有效数据并阻止新指令。'
      },
      {
        id: 'c-proto-63',
        title: '上下位机通信协议',
        section: 'Protocol V2.4 §6.3 心跳与断网自保',
        relevance: 96,
        snippet: 'HEARTBEAT_PULSE 每秒单次，3次无ACK触发LINK_TIMEOUT。'
      },
      {
        id: 'c-risk-17',
        title: '软件风险分析报告',
        section: 'ISO 14971 风险控制 R-17',
        relevance: 95,
        snippet: '进样机构意外自旋致伤，恢复时必须经操作人员UI手动复位握手。'
      }
    ],
    confidence: 99
  },
  {
    id: 'qa-stat',
    category: '常规业务',
    question: '急诊标本（STAT）插入检测时的时延上限与排队逻辑是什么？',
    summary: '无论当前排队处于何种状态，STAT 急诊样本在当前单样吸样结束后立即插队，时延不得超过 35 秒',
    steps: [
      '1. 插队时机：急诊按键按下或扫码识别为 STAT 样本后，系统允许当前正在进行的单孔吸样（约10-15s）执行完毕。',
      '2. 队列重排：当前孔吸样结束后立即暂停普通样本批次排队，机械臂优先移动至急诊专用进样槽（STAT Position）。',
      '3. 时延指标：从急诊触发至急诊标本开始穿刺吸样，整体调度时延上限严格为 ≤ 35 秒。',
      '4. 优先上报：急诊标本分析数据完成后，跳过常规批次缓冲区，直接通过 LIS 双向通道实时上传临床科室。'
    ],
    safetyConstraint: '运行防护：若急诊插入时检测到急诊仓门未关好或试剂余量不足，系统应在 3 秒内给予黄色弹窗提醒，但不得中断常规流水线。',
    citations: [
      {
        id: 'c-prd-stat',
        title: '产品需求说明书 (PRD)',
        section: 'PRD V2.8 §2 STAT急诊插队机制',
        relevance: 98,
        snippet: '急诊按键触发后在当前单样吸样后立即切入，插队时延不得大于35秒。'
      },
      {
        id: 'c-srs-stat',
        title: '软件需求规格说明书',
        section: 'SRS-3.2 §4.2 急诊优先级队列',
        relevance: 94,
        snippet: '急诊队列优先级高于普通检测批次，支持抢占式调度。'
      }
    ],
    confidence: 97
  },
  {
    id: 'qa-r17-safety',
    category: '安全联锁',
    question: '穿刺针防夹伤（R-17）在上位机的安全联锁与恢复约束是什么？',
    summary: '双通道硬件光栅+软件状态机联锁，仓门开启或气压异常 50ms 内切断动力，复位须经过确认向导',
    steps: [
      '1. 动态监控：进样穿刺针垂直 Z 轴与水平 X 轴运动时，实时检测防护罩光电传感器与安全门磁锁状态。',
      '2. 急停时延：若触发仓门开启或光栅遮挡，下位机驱动板 50ms 内切断电机 H 桥供电，上位机同步拉起最高级安全中断。',
      '3. 位置锁定：机械机构机械刹车锁定在当前高度，严禁自由落体或回弹。',
      '4. 界面解除流程：上位机进入安全向导界面，必须提示操作人员检查针头位置并点击“确认无障碍物后复位”，才能重新得电自检。'
    ],
    safetyConstraint: '强制合规要求 (IEC 62304 / ISO 14971 Class B)：严禁任何无交互的静默自愈复位，软件测试中须包含物理开门阻断与极端断电复位测试。',
    citations: [
      {
        id: 'c-risk-r17',
        title: '软件风险分析报告',
        section: 'ISO 14971 R-17 机械运动致伤防护',
        relevance: 99,
        snippet: '必须采用双通道安全回路，50ms内切断驱动，恢复必须操作员物理/UI确认。'
      },
      {
        id: 'c-srs-safety',
        title: '软件需求规格说明书',
        section: 'SRS-3.2 §1.2 进样安全联锁',
        relevance: 96,
        snippet: '安全门开启联动电机驱动断电，上位机锁定界面并记录审计事件。'
      }
    ],
    confidence: 98
  },
  {
    id: 'qa-bug42',
    category: '历史缺陷',
    question: '历史缺陷 BUG-42 是什么？在本次 PR-184 改动中如何防范复发？',
    summary: 'BUG-42 是由于重连瞬间未清空输入环形缓冲区导致的残余数据包错位，PR-184 需执行极端闪断残余包验证',
    steps: [
      '1. 缺陷根因：在 V2.2 协议版本中，通信链路断开瞬间底层 FIFO 环形缓冲区仍残留半包散射光数据，重新连接后直接拼接新包，导致第1份样本数据污染。',
      '2. 修复规约：通信握手阶段必须执行 FLUSH_BUFFER 指令，双向清空发送与接收缓存区，并重置序列号（Seq=0）。',
      '3. PR-184 回归重点：本次 PR-184 修改了心跳重连超时时间，必须针对 100ms~500ms 快速闪断、半包断开注入场景进行深度验证。'
    ],
    citations: [
      {
        id: 'c-bug42',
        title: '历史缺陷库与防复发规约',
        section: 'BUG-42 闪断脏数据溢出报告',
        relevance: 99,
        snippet: '断网重连未刷新接收队列导致首包数据错位，需强制在SYN前清空FIFO。'
      },
      {
        id: 'c-proto-flush',
        title: '上下位机通信协议',
        section: 'Protocol V2.4 §5.1 帧同步与队列重置',
        relevance: 95,
        snippet: '建立连接时执行 FIFO_FLUSH 指令，校验和重新对齐。'
      }
    ],
    confidence: 96
  },
  {
    id: 'qa-pr184',
    category: '通信异常',
    question: 'PR-184 代码变更影响了哪些功能？测试用例该如何设计？',
    summary: 'PR-184 修改了心跳重连与超时门限（2s 改为 3s），涉及状态机迁移、通信协议与 12 条关键回归用例',
    steps: [
      '1. 变更点：将下位机通信超时由 2000ms 调整为 3000ms（防止局域网短暂突发拥塞误报断网）。',
      '2. 直接影响：影响异常报警状态机（ADD-Alarm §2 告警风暴抑制）以及上下位机协议心跳计数。',
      '3. 间接影响：涉及进样安全联锁 R-17（重连确认防夹伤）以及历史缺陷 BUG-42 防复发。',
      '4. 测试建议：设计 4 组针对性用例：2900ms 临界不报警测试、3100ms 必告警测试、断开重连数据清空测试、重连未确认禁止自旋测试。'
    ],
    safetyConstraint: '重点核验：超时延长后，在 2000ms~3000ms 窗口期内若机械臂正在运行，发生物理碰撞时是否有其他硬件保护立即生效。',
    citations: [
      {
        id: 'c-pr184-git',
        title: 'Git 变更单 PR-184',
        section: 'PR-184 Commit diff: timeout=3000ms',
        relevance: 99,
        snippet: '更新 LINK_TIMEOUT 阈值为 3000ms，适配新增的无线网桥组件。'
      },
      {
        id: 'c-add-alarm',
        title: '报警模块详细设计',
        section: 'ADD-Alarm §1.2 状态机判定',
        relevance: 95,
        snippet: '告警延迟滤波时间与底层物理链路超时需保持协同一致。'
      }
    ],
    confidence: 99
  }
];

export function findMatchingAnswer(query: string): QaScenario | null {
  const normalized = query.toLowerCase();
  
  if (normalized.includes('断开') || normalized.includes('断网') || normalized.includes('连接中断') || normalized.includes('通信异常')) {
    return QA_KNOWLEDGE_BASE.find((s) => s.id === 'qa-disconnect') || null;
  }
  if (normalized.includes('急诊') || normalized.includes('stat') || normalized.includes('插队')) {
    return QA_KNOWLEDGE_BASE.find((s) => s.id === 'qa-stat') || null;
  }
  if (normalized.includes('夹伤') || normalized.includes('r-17') || normalized.includes('r17') || normalized.includes('安全联锁') || normalized.includes('光栅')) {
    return QA_KNOWLEDGE_BASE.find((s) => s.id === 'qa-r17-safety') || null;
  }
  if (normalized.includes('bug-42') || normalized.includes('bug42') || normalized.includes('缺陷') || normalized.includes('脏数据')) {
    return QA_KNOWLEDGE_BASE.find((s) => s.id === 'qa-bug42') || null;
  }
  if (normalized.includes('pr-184') || normalized.includes('pr184') || normalized.includes('代码变更')) {
    return QA_KNOWLEDGE_BASE.find((s) => s.id === 'qa-pr184') || null;
  }

  return null;
}
