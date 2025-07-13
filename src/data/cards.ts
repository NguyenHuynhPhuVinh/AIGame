import { WaifuCard } from '../types/game.js';

// Waifu Cards Database
export const WAIFU_CARDS: WaifuCard[] = [
  // Common Cards (2-3 mana)
  {
    id: 'sakura_chan',
    name: 'Sakura-chan Học Sinh',
    attack: 3,
    defense: 4,
    charm: 2,
    cost: 2,
    rarity: 'common',
    waifuType: 'dandere',
    description: 'Cô học sinh nhút nhát nhưng rất chăm chỉ',
    flavorText: '"A-ano... tôi sẽ cố gắng hết sức!"'
  },
  {
    id: 'yuki_tsundere',
    name: 'Yuki Tsundere Cấp 3',
    attack: 5,
    defense: 2,
    charm: 3,
    cost: 3,
    rarity: 'common',
    waifuType: 'tsundere',
    description: 'Cô gái cao ngạo nhưng thực ra rất quan tâm',
    flavorText: '"B-baka! Đừng có hiểu lầm gì đó!"'
  },
  {
    id: 'miku_maid',
    name: 'Miku Hầu Gái Cafe',
    attack: 2,
    defense: 3,
    charm: 4,
    cost: 2,
    rarity: 'common',
    waifuType: 'maid',
    description: 'Cô hầu gái dễ thương của quán cafe',
    flavorText: '"Goshujin-sama, cafe của em đây ạ!"'
  },

  // Rare Cards (2-4 mana)
  {
    id: 'rei_kuudere',
    name: 'Rei Lạnh Lùng Bí Ẩn',
    attack: 6,
    defense: 5,
    charm: 2,
    cost: 4,
    rarity: 'rare',
    waifuType: 'kuudere',
    description: 'Cô gái lạnh lùng với quá khứ bí ẩn',
    flavorText: '"Cảm xúc... là thứ không cần thiết."'
  },
  {
    id: 'akane_genki',
    name: 'Akane Năng Động Vô Địch',
    attack: 7,
    defense: 3,
    charm: 5,
    cost: 3,
    rarity: 'rare',
    waifuType: 'genki',
    description: 'Cô gái năng động luôn tràn đầy năng lượng',
    flavorText: '"Ganbare! Mình sẽ làm hết mình!"'
  },
  {
    id: 'yui_imouto',
    name: 'Yui Em Gái Quốc Dân',
    attack: 2,
    defense: 6,
    charm: 6,
    cost: 2,
    rarity: 'rare',
    waifuType: 'imouto',
    description: 'Em gái dễ thương mà ai cũng muốn bảo vệ',
    flavorText: '"Onii-chan, em yêu anh nhất!"'
  },

  // Super Rare Cards (4-5 mana)
  {
    id: 'ayame_ojousama',
    name: 'Ayame Tiểu Thư Tài Phiệt',
    attack: 8,
    defense: 6,
    charm: 8,
    cost: 5,
    rarity: 'super_rare',
    waifuType: 'ojousama',
    description: 'Tiểu thư nhà giàu với thái độ kiêu kỳ',
    flavorText: '"Ohohoho~ Các ngươi không xứng với ta!"'
  },
  {
    id: 'yandere_yuno',
    name: 'Yuno Yandere Nguy Hiểm',
    attack: 9,
    defense: 4,
    charm: 9,
    cost: 4,
    rarity: 'super_rare',
    waifuType: 'yandere',
    description: 'Cô gái yêu điên cuồng và rất nguy hiểm',
    flavorText: '"Darling chỉ thuộc về em thôi... hehe~"'
  },

  // Ultra Rare Cards (6 mana)
  {
    id: 'megumi_oneesan',
    name: 'Megumi Chị Gái Hoàn Hảo',
    attack: 10,
    defense: 8,
    charm: 10,
    cost: 6,
    rarity: 'ultra_rare',
    waifuType: 'oneesan',
    description: 'Chị gái trưởng thành và đáng tin cậy',
    flavorText: '"Ara ara~ Để chị lo cho em nhé~"'
  },

  // Legendary Cards (8 mana)
  {
    id: 'goddess_ai',
    name: 'AI-chan Nữ Thần Tối Thượng',
    attack: 15,
    defense: 15,
    charm: 15,
    cost: 8,
    rarity: 'legendary',
    waifuType: 'idol',
    description: 'Nữ thần AI hoàn hảo không tì vết',
    flavorText: '"Tôi sẽ mang lại hạnh phúc cho tất cả mọi người!"'
  }
];

// Helper functions
export function getCardById(cardId: string): WaifuCard | undefined {
  return WAIFU_CARDS.find(card => card.id === cardId);
}

export function getCardsByRarity(rarity: WaifuCard['rarity']): WaifuCard[] {
  return WAIFU_CARDS.filter(card => card.rarity === rarity);
}

export function getCardsByType(waifuType: WaifuCard['waifuType']): WaifuCard[] {
  return WAIFU_CARDS.filter(card => card.waifuType === waifuType);
}

export function getCardsByCost(cost: number): WaifuCard[] {
  return WAIFU_CARDS.filter(card => card.cost === cost);
}
