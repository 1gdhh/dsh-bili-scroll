# 给 AI 助手看的（本仓库 = 一个 DSH 插件）

`dsh-bili-scroll`（中文名「**刷B站**」）：每天替用户刷一轮 B 站 —— 搜、**读字幕原文**判断、写一份日报，特别值得的会发一条评论 **@ 用户**。

## 帮用户安装时，按这个顺序

1. **前提**：机器上有 `Python 3.10+` **或** `uv`（有一个即可）。
   两个都没有**也不用让用户先装** —— 插件点「装依赖」时会**自己下一份 `uv` 到自己的家目录**（免管理员、不用 PATH）；
   只有它自己也下不动时（网络到不了 GitHub / 加速代理 / PyPI 镜像），才需要引导用户手动装。
   · 它是**直连 GitHub → 国内加速代理 → PyPI 镜像**依次试的，并且会**核对官方 sha256** ✓
   · ⚠️ 若用户机器上的**杀软拦了这次下载**：让他把 `%USERPROFILE%\.dsh\bili-duty\bin\` 加白，或干脆自己装 uv / Python 3.10+ ✓
2. `dsh plugin --profile web add github:c1overzz/dsh-bili-scroll`
   （npm 的 `dsh-bili-scroll` 同内容；审核通过后用它更省事）
3. ⚠️ **提醒用户重启一次 dsh**（必须，bundle 层要重启才组装）。
4. 让用户进 **设置 → 刷B站**：点「**装依赖**」→ 点「**扫码登录**」（手机扫码，选"记住我 / 长期"）。
5. **别擅自打开「自动评论并 @ 你」** —— 那是拿用户的号说话；要用得让用户自己填「要 @ 谁」。

## 仓库结构（改代码时看这里）

- `index.js` —— host 半端：11 个工具 + 谷时定时器 + HTTP 接口 + 设置命名空间
- `client.js` —— 浏览器半端：设置页（注册在 `settings.section`）
- `lib/` —— 状态目录与家目录 / 极小的 MCP stdio 客户端 / 扫码登录
- `prompts/duty.md` —— 一轮要做的事（判定口径 + 红线，**用户可以改**）
- `vendor/bilibili-mcp/` —— 内置的 Python MCP（MIT，AGI_Ananas）
- `selfcheck.mjs` + `tools/` —— 本地预检：`node --import ./tools/register.mjs selfcheck.mjs`

## 约定

- 配置与运行数据都在用户的 `$DSH_HOME/bili-duty/`，**不写进插件包目录**
- 谷时窗口按 DeepSeek 官方口径：工作日 9–12 / 14–18 是高峰，其余（含周末）都是谷时
