# Babel Tower — Deadlock 游戏内聊天翻译 Mod

把《Deadlock》聊天里的外语消息实时翻译成你的语言,译文直接显示在原消息下方;
也支持"发送前把要说的话翻译成目标语言"(仅译文 / 原文|译文 双语模式)。当前内置
Deadlock 英雄、别名、装备、路线和战术术语,面向中国玩家和英语母语玩家的文字沟通。

- 架构:全景(游戏内 Panorama 界面)+ 本地翻译桥(Node.js 本地服务)+ 翻译服务商
- 支持 **OpenAI 兼容接口**(OpenAI/中转站/DeepSeek/OneAPI/Ollama 等),也可选 Bing、Microsoft、DeepL、Google
- 原理:聊天行扫描 → 去重/缓存 → 隐藏 HTML 面板桥接本地服务 → 译文追加显示
- 许可证:**GNU GPL v3**,见 [LICENSE](LICENSE)

> 状态:核心(本地桥)与游戏内界面均已实测可用;游戏内部分依赖 Valve 反编译结构与
> 已验证的 API 模式,详见 [docs/development.md](docs/development.md)。

---

## 目录结构

```
BabelTower/
├── mod/panorama/          游戏内 UI 源码(需编译成 VPK 安装)
│   ├── layout/chat.xml      聊天布局覆盖(含设置面板)
│   ├── scripts/lingua_chat.js  主逻辑:扫描/去重/缓存/桥接/设置(内部代号 LCT)
│   └── styles/lingua_chat.css  译文与设置面板样式
├── core/                  本地翻译桥(Node.js,零依赖)
│   ├── bridge_server.js      桥服务器 + 隐藏面板页面
│   ├── config.js             本地配置管理(apiKey 打码)
│   ├── dictionary.js         自适应学习词典(短词直译,见下方教程)
│   └── providers/            OpenAI 兼容/Bing/Microsoft/DeepL/Google
├── config/config.example.json  桥配置示例(复制为 config.json 使用)
├── config/dictionary.json   词典数据(user 手动 + learned 自动学习)
├── scripts/build.ps1       编译 + 打包 VPK 脚本
├── scripts/autostart.ps1   开机自启安装/卸载
├── StartDeadlock.bat       手动启动:桥 + 游戏
├── docs/                   架构与开发文档
└── references/             研究参考材料(原版布局反编译等)
```

> 说明:项目对外品牌名为 **Babel Tower**;内部功能标识符沿用 LCT/lingua_chat 代号
> (游戏内已测稳定,避免改名引入回归),二者指同一项目。

## 安装

1. 获取 `dist/pak01_dir.vpk`(自行构建,见下;或使用 GitHub Release 附件)
2. 安装到 Deadlock(**二选一**):
   - **推荐**:用 Deadlock Mod Manager 导入(自动分配空闲 pak 槽位)
   - 或手动:复制到 `game/citadel/addons/` 目录(改名为空闲的 `pakNN_dir.vpk`,避免覆盖其它 mod)
3. 安装 Node.js 18+([nodejs.org](https://nodejs.org)),或使用项目自带的 `portable-node/`
4. 一键自启(推荐,之后 Steam 直接启动游戏即可,游戏退出桥自动关闭):

```powershell
# 先进入项目目录(换成你的实际路径)
cd D:\BabelTower
powershell -ExecutionPolicy Bypass -File scripts\autostart.ps1 -Action Install
```

> 若提示找不到脚本,说明当前目录不对:先 `cd` 到项目目录,或用完整路径
> `powershell -ExecutionPolicy Bypass -File "<你的路径>\scripts\autostart.ps1" -Action Install`

5. (可选)不用自启时,双击 `StartDeadlock.bat` 手动启动

## 使用

| 操作 | 说明 |
| --- | --- |
| 聊天输入 `/tr` 回车 | 打开设置面板(鼠标锁定也能用) |
| 输入框右侧 **译** 按钮 | 打开设置面板(鼠标可用时) |
| 设置面板 | 选项均为**点击选择**,改完点**保存**生效;ESC 关闭 |

设置项:

- **启用翻译**:总开关
- **服务商**:`openai(兼容接口)`、`bing(免 Key)`、`microsoft`、`deepl`、`google`
- **OpenAI 兼容配置**:填写 `API Key`、`Base URL` 和 `模型`;中转站通常把 Base URL 填到 `/v1`
- **API Key**:只保存在本地 `config/config.json`,不会放进 VPK、日志或 Git
- **目标语言**:下拉选择(简中/繁中/英/日/韩/法/德/西 + 自定义)
- **显示模式**:双语(原文+译文)⇄ 仅译文
- **发送前翻译**:关(发原文)⇄ 仅译文 ⇄ 双语(原文 | 译文)
- **发送目标语言**:下拉选择
- **超时(ms)** / **强制翻译**

行为说明:

- 只翻译别人的消息(自己的消息默认跳过)
- 已是目标语言的消息(启发式判断)不重复翻译
- 纯数字/符号、指令(`/` 开头)不翻译
- 翻译失败自动重试一次,仍失败显示红字错误
- 发送前翻译失败会自动发送原文,不会吞掉消息或卡住聊天框
- 聊天滚动/回收后,译文会从缓存自动重建

### Deadlock 专用行为

- 中文英雄别名会转成官方英文名,例如“火男”=`Infernus`、“猪”=`MoKrill`
- “绿路”是 `green lane`,只有“绿路机甲”才是 `green walker`
- `我的` 会按上下文区分 `my bad`、`my` 和 `mine`
- 纯英文、数字、网址和纯符号不会重复调用翻译;中英混合消息会继续翻译
- 英文发送默认小写、无标点的自然游戏聊天风格,例如 `lets` 而不是正式的 `let's`

### 省费用策略

- 常见短句和 Deadlock 术语优先走本地词典;首尾带问号或感叹号也能命中,不调用接口
- 相同文本、语言和模型的结果在内存中缓存 30 分钟,短时间内重复出现不会重复计费
- 只有词典和缓存都未命中的内容才会调用当前在线服务商
- 服务商若提供 mini/turbo/chat 等低价非推理模型,优先用于聊天翻译;复杂语境质量不够时再换更强模型

## 翻译词典(自适应学习)

词典用于**稳定短句/游戏术语的翻译**:命中词典的词条直接查表返回(毫秒级),
不走翻译服务商,避免 Bing 对短词(如 `gg`、`mid`)翻译结果抖动的问题。

### 自动学习(无需手动操作)

- 词典**空表起步**,随着游戏进行自动累积你常用的短句
- 学习规则:纯 ASCII 短文本(≤30 字符、≤5 个词)+ 译文 ≠ 原文
- 同一译文**出现 3 次 → 立即固化落盘**,之后该词条查表秒回
- 防误译保护:译文与原文相同、或译文只有 1 个字符而原文是 2+ 字母词(如 `gank`→`去`)
  等可疑结果不会被学习

### 手动编辑(config/dictionary.json)

文件结构(`config/dictionary.json`,桥运行目录下):

```json
{
  "user": {
    "zh": {
      "glhf": "祝好运，玩得开心"
    }
  },
  "learned": {}
}
```

- **`user` 区**:你手动写的词条(程序不覆盖,优先于 learned 生效)
  - 固定词条、或 Bing 某词翻得不好时,直接写这里覆盖
- **`learned` 区**:程序自动学习写入,**不要手动编辑**(下次固化会被覆盖)
- **语言前缀**:`zh`(简中/繁中)、`en`、`ja`、`ko`、`fr`、`de`、`es` 等,
  按你在设置里选的**目标语言**匹配(zh-Hans/zh-CN/zh-TW 都命中 `zh`)
- 修改后**重启桥**(或等下次自动加载)生效

### 关闭词典

在 `config/config.json` 里加:

```json
{
  "dictionary": { "enabled": false }
}
```

关闭后所有词条都走翻译服务商(不查表、不学习)。

## 翻译服务商

### OpenAI 兼容接口(推荐)

- 可接 OpenAI 官方或任何兼容 Chat Completions 的中转站
- `baseUrl` 填服务商给出的 API 根地址,常见形式为 `https://example.com/v1`
- `model` 填服务商提供的模型名;API Key 只写在本机配置

### Bing Translator(免 Key,公共免费接口)

- 使用 Bing 网页翻译同款协议(翻译页提取 IG/IID/token,POST `ttranslatev3`),国内直连可用
- 无需注册;公共接口有隐形限流,出现 429 会自动重试
- 该接口可能随微软调整而变化,届时本仓库会跟进修复

### 可选:Microsoft Translator(Azure Key)

1. 注册 [Azure](https://azure.microsoft.com/free),创建 Translator 资源
2. 设置面板:服务商切到 `microsoft`,填入 Key(区域按需)
3. 点**测试**验证

## 已知范围与下一步

- 当前最需要真人对局验证的是中转站的稳定性、额度和高延迟时的体验;可在 `fallbackProviders` 配置备用服务商
- 当前插件只处理 Deadlock Panorama 的普通聊天、HUD 顶栏聊天和大厅聊天
- Steam 私聊、Discord、网页内容、语音聊天不经过游戏 VPK,需要单独的桌面/语音翻译工具
- 日语、韩语、俄语等非中英语言没有按 Deadlock 语境逐项优化,目前仍依赖服务商通用翻译

## 从源码构建 VPK

需要 [Reduced CSDK 12](https://deadlockmodding.pages.dev/modding-tools/csdk-12) 与
[VPKEdit CLI](https://github.com/craftablescience/VPKEdit/releases)(放入 `tools/`):

```powershell
powershell -ExecutionPolicy Bypass -File scripts\build.ps1 -Csdk12Root "D:\Reduced_CSDK_12"
```

产物 `dist/pak01_dir.vpk` 经 Mod Manager 导入。

## 本地测试(不开游戏)

```powershell
node core\bridge_server.js
# 另开终端:
curl.exe http://127.0.0.1:8791/api/v1/health
curl.exe -X POST http://127.0.0.1:8791/api/v1/translate -H "Content-Type: application/json" -d "{\"text\":\"hello\",\"targetLanguage\":\"zh-Hans\"}"
```

## 故障排查

| 现象 | 处理 |
| --- | --- |
| 译文显示"本地桥未运行" | 确认桥在运行(自启/StartDeadlock.bat/手动 node);或看 `logs\bridge.log` |
| Bing 接口报错 | 公共接口偶发不稳,自动重试;长期不行切 Microsoft |
| 401/403(用 Microsoft 时) | Key 错误;403 检查是否需填区域 |
| 完全不翻译 | 检查"启用翻译"、目标语言;确认桥日志有请求进来 |
| 聊天发不出去 | 见 docs/development.md 的回退方案 |

## 许可证与致谢

- 本项目代码:**GNU GPL v3**,见 [LICENSE](LICENSE) 与 [LICENSE_NOTICE.md](LICENSE_NOTICE.md)
- 原版聊天布局结构(chat.xml 中的 Valve 素材片段):保留原样以保证功能,版权归 Valve
- 技术路线参考:RogueCore Chat Translator(UE4SS 思路)、
  Hantu-Raya/Deadlock-mods-collection(Apache-2.0,提供了原版 chat.xml 反编译与
  Panorama 轮询模式参考)、plainheart/bing-translate-api(公共接口协议参考)

### 贡献者:Thirt927

本项目合并了 [Thirt927](https://github.com/Thirt927) 的 `optimizations` 分支核心功能,包括:

- **多翻译接口支持**:DeepL / Google / OpenAI 兼容接口(可在设置面板切换,支持回退链)
- **内置词典**:`config/dictionary.builtin.json`(2801 条,JSON 文件无法内联注释,贡献记录于此)
- **大厅聊天翻译**:HUD 顶栏与大厅聊天记录支持(`hudchat.xml`)
- **聊天日志**:按比赛 ID 落盘到 `logs/chat/`

上述贡献按 GPL-3.0 §5 要求,在合并文件头部标注 `// Contributor: Thirt927`,保留原始版权声明。

## AI 辅助开发声明

本项目在开发过程中使用了 AI 编程助手(OpenClaw)辅助完成以下工作:
- 代码编写与调试,以及聊天行回收、串行队列等缺陷的定位与修复
- 模拟测试框架(lingua_chat_simtest.js)的编写,用于在无真人队友的环境下回归验证翻译功能
- 构建/发布脚本的编写与维护

所有代码均由作者审查并测试后发布;作者对项目的功能、质量与合规性负全责。
