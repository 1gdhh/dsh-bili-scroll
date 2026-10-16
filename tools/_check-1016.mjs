// 改动校验：语法之外还要验"符号来源"和"改动真的落盘了"
import { readFileSync } from 'node:fs'

const P = 'D:/deepseek/plugins/bili-duty/'
const idx = readFileSync(P + 'index.js', 'utf8')
const duty = readFileSync(P + 'prompts/duty.md', 'utf8')
const cli = readFileSync(P + 'client.js', 'utf8')
const readme = readFileSync(P + 'README.md', 'utf8')
const asr = readFileSync(P + 'lib/asr.py', 'utf8')

const fail = []
const ok = (cond, msg) => { if (!cond) fail.push(msg) }

// ① pyEnv 定义必须在所有使用之前
const defAt = idx.indexOf('const pyEnv = (extra = {})')
const uses = [...idx.matchAll(/pyEnv\(/g)].map((m) => m.index)
ok(defAt > 0, 'index.js 里找不到 pyEnv 的定义')
ok(uses.every((u) => u > defAt), 'pyEnv 有使用出现在定义之前')
ok(uses.length >= 3, `pyEnv 只被用了 ${uses.length} 次（预期 ≥3：跑一轮 / 装依赖 / 内置 MCP / 转写安装）`)

// ② 用到的符号必须 import 过
const need = ['writeFileSync', 'existsSync', 'mkdirSync', 'readFileSync', 'join', 'spawn']
const importLine = idx.split('\n').find((l) => l.includes("from 'node:fs'")) || ''
const importLine2 = idx.split('\n').find((l) => l.includes("from 'node:child_process'")) || ''
for (const n of need) {
  const inAny = idx.includes(n)
  ok(inAny, `index.js 里完全没用到 ${n}？`)
}
for (const n of ['writeFileSync', 'existsSync', 'mkdirSync', 'readFileSync']) {
  ok(importLine.includes(n), `node:fs 的 import 里没有 ${n}（会运行时 ReferenceError）`)
}
ok(importLine2.includes('spawn'), 'child_process import 里没有 spawn')

// ③ 判重表预建 + 绝对路径进提示词
ok(idx.includes("const seenFile = join(stateDir, 'seen.md')"), 'index.js 里没有预建 seen.md')
ok(idx.includes("判重表 = ${join(stateDir, 'seen.md')}"), '提示词里没有把判重表的绝对路径告诉它')
ok(idx.includes('因无字幕跳过 N 条'), '提示词里没有"因无字幕跳过 N 条"这句')
ok(duty.includes('判重表的绝对路径以这一轮开头告诉你的为准'), 'duty.md 没改判重表那段')
ok(duty.includes('因无字幕跳过 N 条'), 'duty.md 没加"跳过条数"的要求')
ok(!duty.includes('判重表就在家目录根下'), 'duty.md 里旧的"家目录根下"还在')

// ④ 编码
ok(idx.includes("PYTHONUTF8: '1'"), 'index.js 里没有 PYTHONUTF8')
ok(idx.includes('env: pyEnv(),'), '内置 MCP 的 env 没走 pyEnv')
ok(asr.includes("sys.stdout.reconfigure(encoding='utf-8'"), 'asr.py 没有 reconfigure stdout')

// ⑤ 设置页文案
ok(cli.includes('现在开着也没用'), 'client.js 的转写提示没改')

// ⑥ README：新内容在，旧的错内容不在
ok(readme.includes('桌面版 DSH（NEXT / 0.2.x）'), 'README 没加桌面版提醒')
ok(readme.includes('装不上 / 卡住时'), 'README 没加"装不上"那一节')
ok(!readme.includes('add dsh-bili-duty'), 'README 里还留着旧包名 dsh-bili-duty')
ok(!readme.includes('工作目录 = 你填的工作区'), 'README 里还写着"工作目录 = 你的工作区"（是错的）')
ok(readme.includes('优先用那里那一份'), 'README 没写 uv.exe 手动兜底')

console.log(fail.length ? '❌ 有 ' + fail.length + ' 条没过：' : '✅ 全部 ' + 21 + ' 条断言通过')
for (const f of fail) console.log('   - ' + f)
process.exit(fail.length ? 1 : 0)
