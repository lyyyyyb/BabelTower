"use strict";

const fs = require("fs");
const path = require("path");
const { HERO_ZH } = require("./hero_names");

const FALLBACK_HERO_ALIASES = {
  "火男": "Infernus",
  "老七": "Seven",
  "电男": "Seven",
  "赛文": "Seven",
  "猫女": "Calico",
  "鼹鼠": "MoKrill",
  "地鼠": "MoKrill",
  "猪猪": "MoKrill",
  "沙王": "MoKrill",
  "隧底双煞": "MoKrill",
  "冰男": "Kelvin",
  "炮台": "McGinnis",
  "黑帮女": "Wraith",
  "卡牌姐": "Wraith",
  "小黑": "Vindicta",
  "飞天狙": "Vindicta",
  "复仇女巫": "Vindicta",
  "铁拳": "Lash",
  "阎魔刀": "Yamato",
  "机枪妹": "McGinnis",
  "蓝胖": "Abrams",
  "蒙多": "Abrams",
  "血魔": "Abrams",
  "飞天半藏": "Grey Talon",
  "双枪": "Haze",
  "隐枪": "Haze",
  "黑兹": "Haze",
  "奶妈": "Dynamo",
  "迷团": "Dynamo",
  "奇能博士": "Dynamo",
  "帕克": "Pocket",
  "吸血鬼": "Pocket",
  "白毛少妇": "Lady Geist",
  "亚麻头": "Shiv",
  "西弗": "Shiv",
  "死灵龙": "Ivy",
  "小松鼠": "Ivy",
  "凝胶人": "Viscous",
  "浩克": "Viscous",
  "凯尔文": "Kelvin",
  "G7人": "Bebop",
};

const CONTEXTUAL_SINGLE_HERO_ALIASES = {
  "猪": "MoKrill",
  "七": "Seven",
  "球": "Viscous",
  "牌": "Wraith",
  "猫": "Calico",
  "蛇": "Vyper",
};

const EXACT_CHINESE_CHAT_INTENTS = {
  "我的": "my bad",
  "我的锅": "my bad",
  "我的错": "my bad",
  "我的问题": "my bad",
  "我错了": "my bad",
  "怪我": "my bad",
  "这波我的": "my bad",
  "这波怪我": "my bad",
  "这是我的": "this is mine",
  "这个是我的": "this is mine",
  "那个是我的": "thats mine",
};

const CHINESE_CHAT_INTENT_PHRASES = {
  "我说我的意思是这波怪我": "when i said mine i meant my bad",
  "我说我的意思是这波我的": "when i said mine i meant my bad",
  "刚才那波怪我": "my bad for that last fight",
  "刚才那波我的": "my bad for that last fight",
  "这波怪我": "my bad",
  "这波我的": "my bad",
  "你别再梦游了": "wake up",
  "你别梦游了": "wake up",
  "别再梦游了": "wake up",
  "别梦游了": "wake up",
  "你老冯飞了": "your mom can go to hell",
  "你冯飞了": "your mom can go to hell",
  "你在玩你妈呢": "what the fuck are you doing",
  "你玩你妈呢": "what the fuck are you doing",
  "你在干你妈呢": "what the fuck are you doing",
  "搞你妈呢": "what the fuck are you doing",
  "你在送你妈呢": "stop fucking feeding",
  "你在送你老冯呢": "stop fucking feeding",
  "别他妈送了": "stop fucking feeding",
  "别送了": "stop feeding",
  "不要在裂隙打架": "dont fight at rift",
  "不能在裂隙打架": "dont fight at rift",
  "别在裂隙打架": "dont fight at rift",
  "你会不会玩": "do you even know how to play",
  "你在梦游吗": "are you asleep",
  "你在逛街吗": "what are you doing",
  "你是来观光的吗": "what are you doing",
  "你是演员吗": "are you throwing",
  "别演了": "stop throwing",
  "你们是人机吗": "are you guys bots",
  "你是人机吗": "are you a bot",
  "跟人机一样": "plays like a bot",
  "你没手吗": "are you playing with your feet",
  "你用脚玩的": "are you playing with your feet",
  "你脑子被门夹了": "are you fucking braindead",
  "你屏幕开了吗": "is your monitor even on",
  "你键盘坏了吗": "is your keyboard broken",
  "死妈东西": "motherless piece of shit",
  "死妈玩意": "motherless piece of shit",
  "你妈死了": "your mom is dead",
  "操你妈": "fuck your mom",
  "艹你妈": "fuck your mom",
  "草泥马": "fuck your mom",
  "傻福": "dumbass",
  "沙冰": "dumbass",
  "傻宝": "dumbass",
  "傻逼": "dumbass",
  "傻比": "dumbass",
  "煞笔": "dumbass",
  "沙比": "dumbass",
  "菜逼": "fucking noob",
  "菜比": "fucking noob",
  "彩笔": "fucking noob",
};

const ASCII_PROFANITY_PATTERNS = [
  [/\bwcnm\b/gi, "fuck your mom"],
  [/\bcnm\b/gi, "fuck your mom"],
  [/\bnmsl\b/gi, "your mom is dead"],
];

const FALLBACK_ITEM_NAMES = {
  "高速弹": "High-Velocity Rounds",
  "传送石": "Warp Stone",
  "特斯拉弹": "Tesla Bullets",
  "穿甲弹": "Armor Piercing Rounds",
  "英雄光环": "Heroic Aura",
};

const SAFE_ITEM_ALIASES = {
  "跳刀": "Warp Stone",
  "电锤": "Tesla Bullets",
  "金箍棒": "Armor Piercing Rounds",
  "战鼓": "Heroic Aura",
};

const FALLBACK_MAP_TERMS = {
  "绿路机甲": "green walker",
  "蓝路机甲": "blue walker",
  "黄路机甲": "yellow walker",
  "紫路机甲": "purple walker",
  "绿路卫士": "green guardian",
  "蓝路卫士": "blue guardian",
  "黄路卫士": "yellow guardian",
  "紫路卫士": "purple guardian",
  "圣坛头目": "mid boss",
  "复生石": "rejuv",
  "灵瓮": "urn",
  "裂隙": "rift",
  "灵活栏位": "flex slot",
  "绿路": "green lane",
  "蓝路": "blue lane",
  "黄路": "yellow lane",
  "紫路": "purple lane",
};

function parseLocalization(filePath) {
  const tokens = {};
  const text = fs.readFileSync(filePath, "utf8");
  const linePattern = /^\s*"([^"]+)"\s+"((?:\\.|[^"])*)"/gm;
  let match;
  while ((match = linePattern.exec(text))) {
    tokens[match[1]] = match[2].replace(/\\"/g, '"');
  }
  return tokens;
}

function localizationRootFromGameDir(gameDir) {
  if (!gameDir) return "";
  return path.join(gameDir, "game", "citadel", "resource", "localization");
}

function findLocalizationRoot() {
  const candidates = [];
  if (process.env.DEADLOCK_GAME_DIR) {
    candidates.push(localizationRootFromGameDir(process.env.DEADLOCK_GAME_DIR));
  }
  candidates.push(localizationRootFromGameDir("C:\\Program Files (x86)\\Steam\\steamapps\\common\\Deadlock"));
  candidates.push(localizationRootFromGameDir("C:\\Program Files\\Steam\\steamapps\\common\\Deadlock"));
  for (let code = 67; code <= 90; code++) {
    const drive = String.fromCharCode(code) + ":\\";
    candidates.push(localizationRootFromGameDir(path.join(drive, "SteamLibrary", "steamapps", "common", "Deadlock")));
  }
  for (const candidate of candidates) {
    const heroFile = path.join(candidate, "citadel_gc_hero_names", "citadel_gc_hero_names_english.txt");
    const itemFile = path.join(candidate, "citadel_gc_mod_names", "citadel_gc_mod_names_english.txt");
    if (fs.existsSync(heroFile) && fs.existsSync(itemFile)) return candidate;
  }
  return "";
}

function normalizeOfficialName(name) {
  return String(name || "").replace(/\s*&\s*/g, " and ").replace(/\s+/g, " ").trim();
}

function addUniqueCandidate(candidates, source, target) {
  if (!source || !target) return;
  if (!candidates.has(source)) candidates.set(source, new Set());
  candidates.get(source).add(normalizeOfficialName(target));
}

function buildHeroTerms(localizationRoot) {
  const terms = new Map();
  for (const englishName of Object.keys(HERO_ZH)) {
    const chineseName = String(HERO_ZH[englishName] || "").trim();
    if (chineseName && !terms.has(chineseName)) terms.set(chineseName, normalizeOfficialName(englishName));
  }
  for (const alias of Object.keys(FALLBACK_HERO_ALIASES)) {
    terms.set(alias, FALLBACK_HERO_ALIASES[alias]);
  }
  if (!localizationRoot) return terms;

  const base = path.join(localizationRoot, "citadel_gc_hero_names");
  const en = parseLocalization(path.join(base, "citadel_gc_hero_names_english.txt"));
  const zh = parseLocalization(path.join(base, "citadel_gc_hero_names_schinese.txt"));
  const activeNames = new Set(Object.keys(HERO_ZH).map(normalizeOfficialName));
  const aliases = new Map();

  for (const token of Object.keys(en)) {
    if (!/^hero_.+:n$/.test(token) || /_(?:search|sort):n$/.test(token)) continue;
    const englishName = normalizeOfficialName(en[token]);
    if (!activeNames.has(englishName)) continue;
    if (zh[token] && /\p{Script=Han}/u.test(zh[token])) addUniqueCandidate(aliases, zh[token], englishName);
    const search = zh[token.replace(/:n$/, "_search:n")] || "";
    for (const match of search.match(/\p{Script=Han}+/gu) || []) {
      if ([...match].length >= 2) addUniqueCandidate(aliases, match, englishName);
    }
  }

  for (const [alias, owners] of aliases) {
    if (owners.size !== 1) continue;
    const owner = owners.values().next().value;
    if (!terms.has(alias) || terms.get(alias) === owner) terms.set(alias, owner);
  }
  return terms;
}

function buildItemTerms(localizationRoot) {
  const terms = new Map(Object.entries(FALLBACK_ITEM_NAMES));
  for (const alias of Object.keys(SAFE_ITEM_ALIASES)) terms.set(alias, SAFE_ITEM_ALIASES[alias]);
  if (!localizationRoot) return terms;

  const base = path.join(localizationRoot, "citadel_gc_mod_names");
  const en = parseLocalization(path.join(base, "citadel_gc_mod_names_english.txt"));
  const zh = parseLocalization(path.join(base, "citadel_gc_mod_names_schinese.txt"));
  const candidates = new Map();
  for (const token of Object.keys(en)) {
    if (!/^upgrade_/.test(token) || /_search$/.test(token)) continue;
    const chineseName = String(zh[token] || "").trim();
    if (!chineseName || !/\p{Script=Han}/u.test(chineseName)) continue;
    addUniqueCandidate(candidates, chineseName, en[token]);
  }
  for (const [chineseName, names] of candidates) {
    if (names.size === 1) terms.set(chineseName, names.values().next().value);
  }
  return terms;
}

const localizationRoot = findLocalizationRoot();
const heroTerms = buildHeroTerms(localizationRoot);
const itemTerms = buildItemTerms(localizationRoot);
const replacements = new Map(Object.entries(FALLBACK_MAP_TERMS));
for (const [source, target] of itemTerms) replacements.set(source, target);
for (const [source, target] of heroTerms) replacements.set(source, target);
const sortedReplacements = [...replacements.entries()].sort((a, b) => [...b[0]].length - [...a[0]].length);
const sortedIntentPhrases = Object.entries(CHINESE_CHAT_INTENT_PHRASES)
  .sort((a, b) => [...b[0]].length - [...a[0]].length);

function normalizeCleanEnglishTerm(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/['\u2018\u2019`]/g, "")
    .replace(/\s*&\s*/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildChineseOutputTerms() {
  const terms = new Map([
    ["mid boss", "圣坛头目"],
    ["rejuvenator", "复生石"],
    ["rejuv", "复生石"],
    ["rej", "复生石"],
    ["flex slot", "灵活栏位"],
    ["guardian", "卫士"],
    ["walker", "机甲"],
    ["patron", "守护神"],
    ["trooper", "步兵"],
    ["souls", "魂魄"],
    ["soul", "魂魄"],
    ["rift", "裂隙"],
    ["urn", "灵瓮"],
    ["mokrill", "莫克双雄"],
  ]);
  for (const [englishName, chineseName] of Object.entries(HERO_ZH)) {
    const key = normalizeCleanEnglishTerm(englishName);
    if (key) terms.set(key, chineseName);
  }
  for (const [chineseName, englishName] of itemTerms) {
    const key = normalizeCleanEnglishTerm(englishName);
    if (key && !terms.has(key)) terms.set(key, chineseName);
  }
  return [...terms.entries()].sort((a, b) => b[0].length - a[0].length);
}

const chineseOutputTerms = buildChineseOutputTerms();

function buildEnglishInputTerms() {
  const terms = new Map([
    ["green walker", "绿路机甲"],
    ["blue walker", "蓝路机甲"],
    ["yellow walker", "黄路机甲"],
    ["purple walker", "紫路机甲"],
    ["green guardian", "绿路卫士"],
    ["blue guardian", "蓝路卫士"],
    ["yellow guardian", "黄路卫士"],
    ["purple guardian", "紫路卫士"],
    ["green lane", "绿路"],
    ["blue lane", "蓝路"],
    ["yellow lane", "黄路"],
    ["purple lane", "紫路"],
    ["mid boss", "圣坛头目"],
    ["rejuvenator", "复生石"],
    ["rejuv", "复生石"],
    ["flex slot", "灵活栏位"],
    ["guardian", "卫士"],
    ["walker", "机甲"],
    ["patron", "守护神"],
    ["trooper", "步兵"],
    ["souls", "魂魄"],
    ["soul", "魂魄"],
    ["rift", "裂隙"],
    ["urn", "灵瓮"],
    ["my bad", "我的锅"],
  ]);
  for (const [englishName, chineseName] of Object.entries(HERO_ZH)) {
    terms.set(normalizeCleanEnglishTerm(englishName), chineseName);
  }
  terms.set("mokrill", "莫克双雄");
  terms.set("mo krill", "莫克双雄");
  for (const [chineseName, englishName] of itemTerms) {
    const key = normalizeCleanEnglishTerm(englishName);
    if (key && !terms.has(key)) terms.set(key, chineseName);
  }
  return [...terms.entries()].sort((a, b) => b[0].length - a[0].length);
}

const englishInputTerms = buildEnglishInputTerms();

function replaceEnglishTermsForChinese(text) {
  let result = String(text || "");
  for (const [source, target] of englishInputTerms) {
    const words = source.split(/\s+/).filter(Boolean).map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    if (!words.length) continue;
    const phrase = words.join("[\\s_-]+");
    const pattern = new RegExp("(^|[^a-z0-9])" + phrase + "(?=$|[^a-z0-9])", "gi");
    result = result.replace(pattern, (match, prefix) => prefix + target);
  }
  return result.replace(/\s+/g, " ").trim();
}

function isAliasBoundary(char) {
  return !char || /[\s,，.。!！?？;；:：/\\()\[\]{}]/u.test(char);
}

function replaceContextualSingleHeroAliases(text) {
  let result = text;
  const leftContext = /[帮抓打杀看找跟保救压防守推拆秒]/u;
  const rightContext = /[你在去来有没死残大上中下回跑抓杀打推守拆出买带玩跟肥和与也又都被把给就还却但或]/u;
  const leftPhrases = ["对面", "敌方", "我方", "队友", "这个", "那个", "以为", "觉得", "看见", "看到", "发现", "知道", "听说", "盯着", "针对", "对付"];
  for (const [alias, target] of Object.entries(CONTEXTUAL_SINGLE_HERO_ALIASES)) {
    result = result.replace(new RegExp(alias, "gu"), (match, offset, fullText) => {
      const left = fullText.slice(Math.max(0, offset - 1), offset);
      const right = fullText.slice(offset + match.length, offset + match.length + 1);
      const before = fullText.slice(0, offset);
      const safeLeft = isAliasBoundary(left) || leftContext.test(left) || leftPhrases.some((phrase) => before.endsWith(phrase));
      const safeRight = isAliasBoundary(right) || rightContext.test(right);
      return safeLeft && safeRight ? " " + target + " " : match;
    });
  }
  return result;
}

function preprocess(text, targetLanguage) {
  let result = String(text || "");
  const target = String(targetLanguage || "");
  if (/^zh(?:-|$)/i.test(target)) return replaceEnglishTermsForChinese(result);
  if (!/^en(?:-|$)/i.test(target)) return result;
  const exactKey = result.trim().replace(/^[\s,，.。!！?？]+|[\s,，.。!！?？]+$/gu, "");
  if (EXACT_CHINESE_CHAT_INTENTS[exactKey]) return EXACT_CHINESE_CHAT_INTENTS[exactKey];
  for (const [source, target] of sortedIntentPhrases) {
    if (result.includes(source)) result = result.split(source).join(" " + target + " ");
  }
  for (const [pattern, target] of ASCII_PROFANITY_PATTERNS) {
    result = result.replace(pattern, " " + target + " ");
  }
  for (const [source, target] of sortedReplacements) {
    if (result.includes(source)) result = result.split(source).join(" " + target + " ");
  }
  result = replaceContextualSingleHeroAliases(result);
  return result.replace(/\s+/g, " ").trim();
}

function postprocess(text, targetLanguage) {
  let result = String(text || "");
  if (!/^zh(?:-|$)/i.test(String(targetLanguage || ""))) return result;
  for (const [source, target] of chineseOutputTerms) {
    const escaped = source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp("(^|[^a-z0-9])" + escaped + "(?=$|[^a-z0-9])", "gi");
    result = result.replace(pattern, (match, prefix) => prefix + target);
  }
  result = result.replace(/七号(?=没|有|在|去|来|死|残|大|上|中|下|回|跑|抓|杀|打|推|守|拆|出|买|带|玩|跟|肥|$)/gu, "柒");
  result = result.replace(/七(?=没(?:有)?大|有大|在|去|来|死|残|开大)/gu, "柒");
  result = result.replace(/别在裂隙打(?=$|\s)/gu, "别在裂隙打架");
  return result.replace(/\s+/g, " ").trim();
}

function getStats() {
  return {
    localizationRoot,
    heroTerms: heroTerms.size,
    contextualSingleHeroTerms: Object.keys(CONTEXTUAL_SINGLE_HERO_ALIASES).length,
    exactChatIntentTerms: Object.keys(EXACT_CHINESE_CHAT_INTENTS).length,
    chatIntentTerms: Object.keys(CHINESE_CHAT_INTENT_PHRASES).length,
    asciiProfanityTerms: ASCII_PROFANITY_PATTERNS.length,
    itemTerms: itemTerms.size,
    chineseOutputTerms: chineseOutputTerms.length,
  };
}

module.exports = { preprocess, postprocess, getStats, replaceEnglishTermsForChinese };
