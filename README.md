# SkillsHub: Use Skills Fast (No npm Required)

这个仓库当前以本地使用为主，**不依赖统一 npm 发布**。

## 1. 本地启动

前置：
- Node.js `>= 18`
- npm

运行：

```bash
npm run dev
```

打开：`http://localhost:4173`

## 2. 当前推荐使用方式

- 本地可运行技能：直接在网页 Playground 里选择技能并点击 `Run Skill`
- 外部生态技能：按各自上游命令安装/接入（示例：`npx skills add four-meme-community/four-meme-ai`）
- 文档型技能：查看对应 `SKILL.md` 按步骤执行

## 3. 技能文档位置

- `skills/lib-*/skills/<skill-id>/SKILL.md`

技能元信息来源：
- `skills/lib-*/library.json`
- `data/skills.json`

## 4. 为什么不再默认写 npx @skillshub/*

因为目前技能来源混合（自有 + 第三方），且并非所有技能都已发布为 npm 可执行包。
为避免误导，页面和文档已改为“按来源使用”。

## 5. 后续可选（不是当前必需）

如果以后要统一入口，可以再增加一个安装器包（例如 `npx @skillshub/installer`），
但这不是当前运行本仓库的必要条件。
