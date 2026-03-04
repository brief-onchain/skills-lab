# 夜间运营排期（2026-03-04 凌晨）

> 推文 1 和推文 10 已发，剩余推文 2-9 待发（跳过已发的）。
> 建议间隔 1-1.5 小时，覆盖整个夜间时段。

---

## 排期表

| 时间 | 发什么 | 备注 |
|------|--------|------|
| 23:30 | 推文 2 — Top Movers Radar | 纯文字 |
| 01:00 | 推文 3 — Funding Watch | 配图：assets/tw-funding-watch.png |
| 02:00 | 推文 4 — Kline Brief | 纯文字 |
| 03:00 | 推文 5 — BSC RPC Fanout Check | 纯文字 |
| 04:30 | 推文 6 — BAP578 系列 | 配图：assets/tw-bap578-devkit.png |
| 05:30 | 推文 7 — Symbol Status | 纯文字 |
| 06:00 | 感动版 — Still Building | 配图：assets/tw-still-building.png，深夜杀手锏 |
| 06:30 | 推文 8 — Open Interest Scan | 配图：assets/tw-open-interest.png |
| 07:30 | 推文 9 — AI Quick Chat | 纯文字，早起的人看到 |

---

## 待发推文内容（直接复制）

---

### 23:30 — 推文 2 Top Movers Radar

每天几千个交易对，谁在涨？涨多少？有没有量？

自己翻太慢了。

Top Movers Radar 帮你按涨幅排名，还能过滤掉那些日成交量不到 5000 万的"假涨"。筛出来的都是真有资金在动的。

这个 Skill 我自己每天都在用。现在也给你。

npx @skillshub/top-movers-radar

---

### 01:00 — 推文 3 Funding Watch 【配图：assets/tw-funding-watch.png】

做合约的人都知道，资金费率是情绪的温度计。

费率飙高，说明多头太拥挤；费率转负，空头在压价。这个信号比任何 KOL 喊单都诚实。

Funding Watch 直接读币安合约的实时资金费率、标记价格、下次结算时间，一步到位。

别等爆仓了才想起来看费率。

npx @skillshub/funding-watch

---

### 02:00 — 推文 4 Kline Brief

K 线看多了眼花，看少了没感觉。

Kline Brief 不是给你画图的，它是帮你"读图"的——把最近几十根 K 线浓缩成一段话：短期趋势多少、波动幅度怎样。

特别适合那些没时间盯盘，但需要快速判断该不该操作的时刻。

让你的 AI Agent 帮你读 K 线，比你自己盯盘靠谱。

npx @skillshub/kline-brief

---

### 03:00 — 推文 5 BSC RPC Fanout Check

在 BSC 上做开发最怕什么？RPC 挂了你不知道。

交易发出去了，节点没响应，链上状态不一致，资金卡在半路。

BSC RPC Fanout Check 同时验证多个 RPC 端点的一致性，哪个节点掉了、哪个在延迟，一目了然。

做链上项目的人都该有这个。基础设施不牢，什么都白搭。

npx @skillshub/bsc-rpc-fanout-check

---

### 04:30 — 推文 6 BAP578 系列 【配图：assets/tw-bap578-devkit.png】

BSC 上有一个标准叫 BAP578，做的是 token-bound agent accounts——让 NFT 绑定智能合约账户。

听起来很酷，但实际上手开发的时候，合约怎么写、权限怎么设、怎么测试、怎么部署，全得自己摸索。

所以我做了一整套 BAP578 开发辅助 Skills：

Adapter Blueprint — 输入合约名和接口，直接生成带 vault 资金控制的 adapter 合约蓝图
Vault Checklist — tokenId 权限验证 + vault 控制器安全清单，部署前过一遍心里踏实
Deploy Plan — BSC 主网部署顺序 + 命令模板，不用自己拼脚本
Test Template — Hardhat 测试骨架，覆盖权限和余额一致性
Contract Idea Sprint — 你说一个想法，它帮你拆成一天能落地的合约实现计划

一个人从零开始写 BAP578 合约可能要一周。装上这五个 Skill，一天就能出原型。

这就是 Skills 的意义——不是替你写代码，是帮你省掉那些重复的、消耗精力的环节，让你专注在真正有创造力的部分。

---

### 05:30 — 推文 7 Symbol Status

你准备交易一个币，但你知道它现在的交易状态吗？

有的币看着有价格，其实已经暂停交易了。有的币有最小下单量限制，挂单挂不上去。还有的币报价资产换了，你还在用旧的 pair。

Symbol Status 一条命令查清楚：交易状态、基础资产、报价资产、所有核心过滤器。

别在不能交易的币上浪费时间。

npx @skillshub/symbol-status

---

### 06:00 — 感动版 Still Building 【配图：assets/tw-still-building.png】

凌晨六点，还在写代码。

不是因为有人催我，是因为停不下来。

做 SkillsHub 的过程跟做任何一个 side project 一样——没人看的时候最难。你不知道有没有人需要这个东西，不知道自己花的时间有没有意义，不知道发了推有没有人看。

但我想起了自己第一次用别人写的开源工具时的感觉——省了我两天的活，写那个工具的人可能根本不知道我的存在。

我想做那样的人。

写一个 Skill，也许某个凌晨三点在查资金费率的人会用到。
写一个合约蓝图生成器，也许某个第一次写 BAP578 的开发者会少走两天弯路。

他们可能永远不会知道是谁写的。没关系。

Still building.

---

### 06:30 — 推文 8 Open Interest Scan 【配图：assets/tw-open-interest.png】

持仓量是市场里最容易被忽略的指标。

价格在涨，持仓量也在涨——说明有新资金在进场，趋势可能还没结束。
价格在涨，持仓量在跌——说明是存量博弈，随时可能反转。

Open Interest Scan 直接追踪合约持仓量快照，帮你判断当前的涨跌到底有没有"真金白银"在支撑。

少听 KOL 喊单，多看链上数据。

npx @skillshub/open-interest-scan

---

### 07:30 — 推文 9 AI Quick Chat

这是最简单的一个 Skill，但可能也是最重要的。

AI Quick Chat 做一件事：发一句 prompt 给 AI，看它是不是通了。

听起来没什么用？但每次你搭环境、配 API Key、换模型的时候，第一步永远是——"这东西通了没？"

一条命令，AI 回你一句话，就知道整个链路是通的。

别小看基础设施。大楼再高，地基要稳。

npx @skillshub/ai-quick-chat

---

## 额外动作（发推间隙做）

- 回复自己帖子下面的每一条评论
- 去 @BNBCHAIN @heyibinance @caborofficial 最新推文下面留有价值的评论
- 找聊 AI Agent / Skills 叙事的帖子，评论区露脸

## 明早 8:00 起来后

- 查看夜间所有推文的互动数据
- 逐条回复评论
- 发一条早安型的小更新或互动帖
