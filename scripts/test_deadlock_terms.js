"use strict";

const assert = require("assert");
const path = require("path");
const openai = require(path.join(__dirname, "..", "core", "providers", "openai"));
const deadlockTerms = require(path.join(__dirname, "..", "core", "deadlock_terms"));

function preparedSource(text, targetLanguage) {
  const messages = openai.buildMessages(text, { targetLanguage: targetLanguage || "en", context: "" });
  return messages[1].content.split("\n\n").slice(1).join("\n\n");
}

function systemPrompt(text, targetLanguage) {
  return openai.buildMessages(text, { targetLanguage: targetLanguage || "en", context: "" })[0].content;
}

assert.strictEqual(openai.preprocessDeadlockTerms("火男来绿路", "en"), "Infernus 来 green lane");
assert.match(preparedSource("火男出了高速弹 去绿路拆机甲"), /Infernus.*High-Velocity Rounds/);
assert.strictEqual(openai.preprocessDeadlockTerms("七个人去抢球", "en"), "七个人去抢球");
assert.strictEqual(openai.preprocessDeadlockTerms("米娜来了", "en"), "Mina 来了");
assert.strictEqual(openai.preprocessDeadlockTerms("火男来绿路", "zh-Hans"), "火男来绿路");
assert.strictEqual(openai.preprocessDeadlockTerms("猪在绿路", "en"), "MoKrill 在 green lane");
assert.strictEqual(openai.preprocessDeadlockTerms("帮我抓猪", "en"), "帮我抓 MoKrill");
assert.strictEqual(openai.preprocessDeadlockTerms("对面猪没大", "en"), "对面 MoKrill 没大");
assert.strictEqual(openai.preprocessDeadlockTerms("对面猪和老七都不见了", "en"), "对面 MoKrill 和 Seven 都不见了");
assert.strictEqual(openai.preprocessDeadlockTerms("我以为猪没大才冲进去的", "en"), "我以为 MoKrill 没大才冲进去的");
assert.strictEqual(openai.preprocessDeadlockTerms("你是猪", "en"), "你是猪");
assert.strictEqual(openai.preprocessDeadlockTerms("七没大", "en"), "Seven 没大");
assert.strictEqual(openai.preprocessDeadlockTerms("球在蓝路", "en"), "Viscous 在 blue lane");
assert.strictEqual(openai.preprocessDeadlockTerms("牌没大", "en"), "Wraith 没大");
assert.strictEqual(openai.preprocessDeadlockTerms("猫在紫路", "en"), "Calico 在 purple lane");
assert.strictEqual(openai.preprocessDeadlockTerms("蛇在黄路", "en"), "Vyper 在 yellow lane");
assert.strictEqual(openai.preprocessDeadlockTerms("黑帮女和飞天狙", "en"), "Wraith 和 Vindicta");
assert.strictEqual(openai.preprocessDeadlockTerms("蓝胖和飞天半藏", "en"), "Abrams 和 Grey Talon");
assert.strictEqual(openai.preprocessDeadlockTerms("猪猪和死灵龙", "en"), "MoKrill 和 Ivy");
assert.strictEqual(openai.preprocessDeadlockTerms("老七你冯飞了", "en"), "Seven your mom can go to hell");
assert.strictEqual(openai.preprocessDeadlockTerms("老七你老冯飞了", "en"), "Seven your mom can go to hell");
assert.strictEqual(openai.preprocessDeadlockTerms("你个傻福", "en"), "你个 dumbass");
assert.strictEqual(openai.preprocessDeadlockTerms("老冯飞了", "en"), "老冯飞了");
assert.strictEqual(openai.preprocessDeadlockTerms("冯飞得真高", "en"), "冯飞得真高");
assert.strictEqual(openai.preprocessDeadlockTerms("猪你会不会玩", "en"), "MoKrill do you even know how to play");
assert.strictEqual(openai.preprocessDeadlockTerms("老七你在送你妈呢", "en"), "Seven stop fucking feeding");
assert.strictEqual(openai.preprocessDeadlockTerms("别他妈送了", "en"), "stop fucking feeding");
assert.strictEqual(openai.preprocessDeadlockTerms("火男跟人机一样", "en"), "Infernus plays like a bot");
assert.strictEqual(openai.preprocessDeadlockTerms("你在梦游吗", "en"), "are you asleep");
assert.strictEqual(openai.preprocessDeadlockTerms("你是演员吗", "en"), "are you throwing");
assert.strictEqual(openai.preprocessDeadlockTerms("你没手吗", "en"), "are you playing with your feet");
assert.strictEqual(openai.preprocessDeadlockTerms("你个彩笔", "en"), "你个 fucking noob");
assert.strictEqual(openai.preprocessDeadlockTerms("WCNM Nmsl", "en"), "fuck your mom your mom is dead");
assert.strictEqual(openai.preprocessDeadlockTerms("我的", "en"), "my bad");
assert.strictEqual(openai.preprocessDeadlockTerms("我的！", "en"), "my bad");
assert.strictEqual(openai.preprocessDeadlockTerms("我的锅", "en"), "my bad");
assert.strictEqual(openai.preprocessDeadlockTerms("这波我的", "en"), "my bad");
assert.strictEqual(openai.preprocessDeadlockTerms("这是我的", "en"), "this is mine");
assert.strictEqual(openai.preprocessDeadlockTerms("我的大好了", "en"), "我的大好了");
assert.strictEqual(openai.preprocessDeadlockTerms("我的装备", "en"), "我的装备");
assert.strictEqual(openai.preprocessDeadlockTerms("演员在演戏", "en"), "演员在演戏");
assert.strictEqual(openai.preprocessDeadlockTerms("我在人机验证", "en"), "我在人机验证");
assert.strictEqual(openai.preprocessDeadlockTerms("冯老师飞了", "en"), "冯老师飞了");
assert.strictEqual(openai.preprocessDeadlockTerms("去绿路打架", "en"), "去 green lane 打架");
assert.strictEqual(openai.preprocessDeadlockTerms("先打绿路机甲", "en"), "先打 green walker");
assert.strictEqual(openai.preprocessDeadlockTerms("我说我的意思是这波怪我 不是说这个灵瓮归我", "en"), "when i said mine i meant my bad 不是说这个 urn 归我");
assert.strictEqual(openai.preprocessDeadlockTerms("老七你别再梦游了", "en"), "Seven wake up");
assert.match(systemPrompt("老七你在狗叫什么"), /including direct address/);
assert.strictEqual(openai.preprocessDeadlockTerms("老七没大别在裂隙打架", "en"), "Seven 没大 dont fight at rift");
assert.strictEqual(openai.preprocessDeadlockTerms("老七没大不要在裂隙打架", "en"), "Seven 没大 dont fight at rift");
assert.match(systemPrompt("老七没大别在裂隙打架"), /Preserve toxicity and Chinese negation/);
assert.match(systemPrompt("我的大好了"), /before a noun=my/);
assert.match(systemPrompt("这是我的"), /explicit ownership=mine/);
assert.match(systemPrompt("我的"), /never mine for an apology/);
assert.match(systemPrompt("去绿路打架"), /Never add walker when the source only says 路/);
assert.match(preparedSource("seven no ult dont fight at rift", "zh-Hans"), /裂隙/);
assert.match(systemPrompt("seven no ult dont fight at rift", "zh-Hans"), /protected official terms/);
assert.strictEqual(openai.preprocessDeadlockTerms("infernus and mokrill are missing", "zh-Hans"), "炽焱 and 莫克双雄 are missing");
assert.strictEqual(openai.preprocessDeadlockTerms("wait for warp stone then catch vindicta", "zh-Hans"), "wait for 传送石 then catch 薇妲");
assert.strictEqual(openai.preprocessDeadlockTerms("dont sell high velocity rounds or tesla bullets", "zh-Hans"), "dont sell 高速弹 or 特斯拉弹");
assert.strictEqual(openai.preprocessDeadlockTerms("fight in green lane then take green walker", "zh-Hans"), "fight in 绿路 then take 绿路机甲");
assert.strictEqual(deadlockTerms.postprocess("Seven没大别在rift打", "zh-Hans"), "柒没大别在裂隙打架");
assert.strictEqual(deadlockTerms.postprocess("七没有大招别在裂隙打架", "zh-Hans"), "柒没有大招别在裂隙打架");
assert.strictEqual(deadlockTerms.postprocess("infernus出了high velocity rounds", "zh-Hans"), "炽焱出了高速弹");
assert.strictEqual(deadlockTerms.postprocess("等七秒", "zh-Hans"), "等七秒");
assert.strictEqual(deadlockTerms.postprocess("seven no ult", "en"), "seven no ult");

const stats = deadlockTerms.getStats();
assert.ok(stats.heroTerms >= 47, "hero name table did not load");
assert.strictEqual(stats.contextualSingleHeroTerms, 6, "single hero alias table did not load");
assert.strictEqual(stats.exactChatIntentTerms, 11, "exact chat intent table did not load");
assert.ok(stats.chatIntentTerms >= 35, "Chinese chat intent table did not load");
assert.strictEqual(stats.asciiProfanityTerms, 3, "ASCII profanity table did not load");
assert.ok(stats.itemTerms >= 190, "official item name table did not load");
assert.ok(stats.chineseOutputTerms >= 240, "Chinese output term table did not load");
console.log(JSON.stringify({ ok: true, stats, sample: preparedSource("火男出了高速弹 去绿路拆机甲") }, null, 2));
