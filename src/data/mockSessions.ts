import { ChatSession } from '../types';
import { QA_KNOWLEDGE_BASE } from './qaKnowledgeBase';

export const INITIAL_CHAT_SESSIONS: ChatSession[] = [
  {
    id: 'session-disconnect',
    title: '设备通信中断安全降级与复位流程',
    category: '通信容错',
    updatedAt: '今天 10:42',
    messages: [
      {
        id: 'msg-s1-1',
        sender: 'user',
        timestamp: '10:41',
        text: '设备在检测过程中断开连接，系统应如何处理？'
      },
      {
        id: 'msg-s1-2',
        sender: 'assistant',
        timestamp: '10:42',
        text: '已综合受控需求规格 SRS-3.2 与上下位机协议 V2.4 检索到通信中断规约：',
        structuredAnswer: {
          summary: QA_KNOWLEDGE_BASE[0].summary,
          steps: QA_KNOWLEDGE_BASE[0].steps,
          safetyConstraint: QA_KNOWLEDGE_BASE[0].safetyConstraint,
          citations: QA_KNOWLEDGE_BASE[0].citations,
          confidence: QA_KNOWLEDGE_BASE[0].confidence
        }
      }
    ]
  },
  {
    id: 'session-stat',
    title: '急诊标本 (STAT) 插队与时延上限要求',
    category: '业务流程',
    updatedAt: '昨天 16:20',
    messages: [
      {
        id: 'msg-s2-1',
        sender: 'user',
        timestamp: '16:19',
        text: '急诊标本（STAT）插入检测时的时延上限与排队逻辑是什么？'
      },
      {
        id: 'msg-s2-2',
        sender: 'assistant',
        timestamp: '16:20',
        text: '根据产品需求 PRD V2.8 与需求规格 SRS-3.2 提取急诊插队规范：',
        structuredAnswer: {
          summary: QA_KNOWLEDGE_BASE[1].summary,
          steps: QA_KNOWLEDGE_BASE[1].steps,
          safetyConstraint: QA_KNOWLEDGE_BASE[1].safetyConstraint,
          citations: QA_KNOWLEDGE_BASE[1].citations,
          confidence: QA_KNOWLEDGE_BASE[1].confidence
        }
      }
    ]
  },
  {
    id: 'session-r17',
    title: 'ISO 14971 穿刺针防夹伤安全联锁控制',
    category: '安全联锁',
    updatedAt: '昨天 11:15',
    messages: [
      {
        id: 'msg-s3-1',
        sender: 'user',
        timestamp: '11:14',
        text: '穿刺针防夹伤（R-17）在上位机的安全联锁与恢复约束是什么？'
      },
      {
        id: 'msg-s3-2',
        sender: 'assistant',
        timestamp: '11:15',
        text: '已定位 ISO 14971 风险分析报告 R-17 与软件规格 SRS-3.2 约束：',
        structuredAnswer: {
          summary: QA_KNOWLEDGE_BASE[2].summary,
          steps: QA_KNOWLEDGE_BASE[2].steps,
          safetyConstraint: QA_KNOWLEDGE_BASE[2].safetyConstraint,
          citations: QA_KNOWLEDGE_BASE[2].citations,
          confidence: QA_KNOWLEDGE_BASE[2].confidence
        }
      }
    ]
  },
  {
    id: 'session-bug42',
    title: 'BUG-42 闪断重连脏数据溢出防复发设计',
    category: '历史缺陷',
    updatedAt: '3天前',
    messages: [
      {
        id: 'msg-s4-1',
        sender: 'user',
        timestamp: '09:30',
        text: '历史缺陷 BUG-42 是什么？在本次 PR-184 改动中如何防范复发？'
      },
      {
        id: 'msg-s4-2',
        sender: 'assistant',
        timestamp: '09:31',
        text: '根据历史缺陷库 BUG-42 分析报告与协议重置规约提取准则：',
        structuredAnswer: {
          summary: QA_KNOWLEDGE_BASE[3].summary,
          steps: QA_KNOWLEDGE_BASE[3].steps,
          citations: QA_KNOWLEDGE_BASE[3].citations,
          confidence: QA_KNOWLEDGE_BASE[3].confidence
        }
      }
    ]
  },
  {
    id: 'session-pr184',
    title: 'PR-184 超时门限变更测试影响分析',
    category: '变更分析',
    updatedAt: '4天前',
    messages: [
      {
        id: 'msg-s5-1',
        sender: 'user',
        timestamp: '14:05',
        text: 'PR-184 代码变更影响了哪些功能？测试用例该如何设计？'
      },
      {
        id: 'msg-s5-2',
        sender: 'assistant',
        timestamp: '14:06',
        text: '基于 Git PR-184 变更差异与 ADD-Alarm 报警详细设计提炼分析报告：',
        structuredAnswer: {
          summary: QA_KNOWLEDGE_BASE[4].summary,
          steps: QA_KNOWLEDGE_BASE[4].steps,
          safetyConstraint: QA_KNOWLEDGE_BASE[4].safetyConstraint,
          citations: QA_KNOWLEDGE_BASE[4].citations,
          confidence: QA_KNOWLEDGE_BASE[4].confidence
        }
      }
    ]
  }
];
