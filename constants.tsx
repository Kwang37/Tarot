
import { TarotCardData, SpreadType } from './types';

export const CARD_ASPECT_RATIO = 1.618;
export const CARD_BACK_URL = 'https://picsum.photos/id/1015/300/500?grayscale&blur=2';

export const TRANSLATIONS = {
  zh: {
    title: "虚幻塔罗",
    subtitle: "连接未知，用你的双手触碰虚空，开启命运的指示。",
    enter: "开启虚空之门",
    intent: "明确你的意图",
    questionLabel: "你的问题",
    questionPlaceholder: "宇宙今天需要告诉我什么？",
    chooseSpread: "选择牌阵",
    commence: "开始抽牌",
    gestureTitle: "启示三步曲",
    gestureOpen: "张开手掌: 触碰虚空 (悬停)",
    gesturePinch: "指尖捏合: 抓住命运 (抓取)",
    gestureFist: "紧握拳头: 见证真言 (确认)",
    gotIt: "领悟",
    consulting: "正在请示神谕...",
    return: "返回起点",
    spiritualInsight: "灵性洞察",
    upright: "正位",
    reversed: "逆位",
    mouseMode: "鼠标模式",
    handMode: "手势模式",
  },
  en: {
    title: "ETHEREAL TAROT",
    subtitle: "Connect with the unseen. Use your hands to reach into the digital ether and pull forth your destiny.",
    enter: "Enter the Void",
    intent: "State Your Intent",
    questionLabel: "Your Question",
    questionPlaceholder: "What does the universe need to tell me today?",
    chooseSpread: "Choose Spread",
    commence: "Commence Draw",
    gestureTitle: "The Three Steps",
    gestureOpen: "Open Palm: Reach (Hover)",
    gesturePinch: "Pinch: Seize (Grab)",
    gestureFist: "Fist: Reveal (Confirm)",
    gotIt: "I Understand",
    consulting: "Consulting the Oracle...",
    return: "Return to Origin",
    spiritualInsight: "The Spiritual Insight",
    upright: "Upright",
    reversed: "Reversed",
    mouseMode: "Mouse Mode",
    handMode: "Gesture Mode",
  }
};

export const SPREADS: SpreadType[] = [
  { 
    id: 'daily', 
    name: '每日运势', 
    nameEn: 'Daily Insight', 
    count: 1, 
    slots: ['当前能量'], 
    slotsEn: ['Current Energy'] 
  },
  { 
    id: 'ppf', 
    name: '过去/现在/未来', 
    nameEn: 'Past, Present, Future', 
    count: 3, 
    slots: ['过去', '现在', '未来'], 
    slotsEn: ['Past, Present, Future'] 
  },
  { 
    id: 'choice', 
    name: '选择之径', 
    nameEn: 'Decision Path', 
    count: 3, 
    slots: ['现状', '路径 A', '路径 B'], 
    slotsEn: ['Status Quo', 'Path A', 'Path B'] 
  }
];

export const TAROT_DECK: TarotCardData[] = [
  { 
    id: '0', 
    name: '愚者', 
    nameEn: 'The Fool', 
    value: '0', 
    meaningUp: '新的开始，天真，自发性。', 
    meaningUpEn: 'New beginnings, innocence, spontaneity.', 
    meaningRev: '鲁莽，冒险，考虑不周。', 
    meaningRevEn: 'Recklessness, risk-taking, inconsideration.', 
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/90/RWS_Tarot_00_Fool.jpg' 
  },
  { 
    id: '1', 
    name: '魔术师', 
    nameEn: 'The Magician', 
    value: 'I', 
    meaningUp: '显化，足智多谋，力量。', 
    meaningUpEn: 'Manifestation, resourcefulness, power.', 
    meaningRev: '操纵，计划不周，未开发的才能。', 
    meaningRevEn: 'Manipulation, poor planning, untapped talents.', 
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/de/RWS_Tarot_01_Magician.jpg' 
  },
  { 
    id: '2', 
    name: '女祭司', 
    nameEn: 'The High Priestess', 
    value: 'II', 
    meaningUp: '直觉，神圣知识，潜意识。', 
    meaningUpEn: 'Intuition, sacred knowledge, subconscious.', 
    meaningRev: '秘密，与直觉断开，撤退。', 
    meaningRevEn: 'Secrets, disconnected from intuition, withdrawal.', 
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/88/RWS_Tarot_02_High_Priestess.jpg' 
  },
  { 
    id: '3', 
    name: '皇后', 
    nameEn: 'The Empress', 
    value: 'III', 
    meaningUp: '阴性特质，美，自然，丰饶。', 
    meaningUpEn: 'Femininity, beauty, nature, abundance.', 
    meaningRev: '创造力阻塞，依赖他人。', 
    meaningRevEn: 'Creative block, dependence on others.', 
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/af/RWS_Tarot_03_Empress.jpg' 
  },
  { 
    id: '4', 
    name: '皇帝', 
    nameEn: 'The Emperor', 
    value: 'IV', 
    meaningUp: '权威，结构，坚实基础。', 
    meaningUpEn: 'Authority, structure, a solid foundation.', 
    meaningRev: '统治，过度控制，缺乏纪律。', 
    meaningRevEn: 'Dominance, excessive control, lack of discipline.', 
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/RWS_Tarot_04_Emperor.jpg' 
  },
  { 
    id: '5', 
    name: '教皇', 
    nameEn: 'The Hierophant', 
    value: 'V', 
    meaningUp: '精神智慧，宗教信仰，遵从。', 
    meaningUpEn: 'Spiritual wisdom, religious beliefs, conformity.', 
    meaningRev: '个人信仰，自由，挑战现状。', 
    meaningRevEn: 'Personal beliefs, freedom, challenging the status quo.', 
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/RWS_Tarot_05_Hierophant.jpg' 
  },
  { 
    id: '10', 
    name: '命运之轮', 
    nameEn: 'Wheel of Fortune', 
    value: 'X', 
    meaningUp: '好运，因果，生命周期，命运。', 
    meaningUpEn: 'Good luck, karma, life cycles, destiny.', 
    meaningRev: '坏运，抗拒改变，打破循环。', 
    meaningRevEn: 'Bad luck, resistance to change, breaking cycles.', 
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg' 
  },
  { 
    id: '13', 
    name: '死神', 
    nameEn: 'Death', 
    value: 'XIII', 
    meaningUp: '结束，变化，转型，过渡。', 
    meaningUpEn: 'Endings, change, transformation, transition.', 
    meaningRev: '抗拒改变，个人转型。', 
    meaningRevEn: 'Resistance to change, personal transformation.', 
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/RWS_Tarot_13_Death.jpg' 
  },
  { 
    id: '19', 
    name: '太阳', 
    nameEn: 'The Sun', 
    value: 'XIX', 
    meaningUp: '积极，乐趣，温暖，成功。', 
    meaningUpEn: 'Positivity, fun, warmth, success, vitality.', 
    meaningRev: '内在小孩，感到沮丧，过度乐观。', 
    meaningRevEn: 'Inner child, feeling down, overly optimistic.', 
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/17/RWS_Tarot_19_Sun.jpg' 
  },
  { 
    id: '21', 
    name: '世界', 
    nameEn: 'The World', 
    value: 'XXI', 
    meaningUp: '完成，整合，成就，旅行。', 
    meaningUpEn: 'Completion, integration, accomplishment, travel.', 
    meaningRev: '寻求结束，捷径，延误。', 
    meaningRevEn: 'Seeking closure, short-cuts, delays.', 
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/RWS_Tarot_21_World.jpg' 
  }
];
