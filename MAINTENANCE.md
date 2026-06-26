# 铁馆健身网站 — 维护规范

## 版本号规范

采用语义化版本号：主版本.次版本.修订号

- **主版本**: 不兼容的 API 或架构变更
- **次版本**: 向下兼容的功能新增
- **修订号**: 向下兼容的 Bug 修复

当前版本: v2.0.0

## Commit Message 格式

每次提交使用以下格式：

[类型] 简要描述

类型包括：
- [fix] — Bug 修复
- [feat] — 新功能
- [refactor] — 代码重构
- [style] — 样式调整
- [docs] — 文档更新
- [test] — 测试相关
- [perf] — 性能优化

示例：
[feat] 食物库扩充至271种+搜索功能
[fix] 导航栏Unicode转义修复
[refactor] CSS架构4层拆分

## 分支策略

- master — 生产分支，始终可部署
- dev — 开发分支
- eature/* — 功能分支
- ix/* — 修复分支

## 文件结构规范

css/
  design-tokens.css   # 设计变量（不动）
  reset.css           # 全局重置（不动）
  layout.css          # 布局系统（慎动）
  components.css      # UI组件（新增组件加这里）

js/
  utils.js            # 工具函数
  components/         # 公共组件（新组件放这里）
  pages/              # 页面逻辑（新页面逻辑放这里）

## 编码规范

- HTML: UTF-8 无 BOM
- CSS: 使用设计变量，不写死颜色值
- JS: 使用 IIFE 避免全局污染
- 文件编码: UTF-8 无 BOM（永远不要用 PowerShell 直接写中文文件）

## 部署流程

1. 本地修改并测试
2. git add + git commit（规范 message）
3. git push 到 GitHub
4. Vercel 自动部署
5. 打开 https://fitness-site-psi.vercel.app 验证

## 性能基准

- 首屏加载: < 3s
- 搜索响应: < 100ms
- 单文件上限: CSS < 50KB, JS < 100KB
- 图片: < 200KB
