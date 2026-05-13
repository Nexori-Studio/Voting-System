# Nexori 在线投票平台

由 **Nexori Studio** 开发的安全可靠的在线投票平台。

## 🌟 功能特性

- **用户认证**：安全的注册登录系统
- **隐私保护**：
  - 投票进行中：非发起人不可查看票数
  - 发起人特权：实时查看投票详情
  - 投票结束后：所有人可见完整结果
- **防重复投票**：严格的一人一票机制
- **现代化 UI**：美观的界面，良好的用户体验

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + Vite + Tailwind CSS |
| 后端 | Express.js + TypeScript |
| 数据库 | SQLite (better-sqlite3) |
| 认证 | JWT + Cookie |

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```
这将同时启动前端（http://localhost:5173）和后端（http://localhost:3001）

### 其他命令
```bash
npm run client:dev  # 仅启动前端
npm run server:dev  # 仅启动后端
npm run build       # 构建项目
npm run lint        # 代码检查
```

## 📝 使用说明

1. 注册或登录账号
2. 点击「创建投票」添加新的投票
3. 设置投票标题、描述、选项和结束时间
4. 分享投票链接给其他人
5. 投票结束后所有人都能看到结果

## 🏢 关于 Nexori Studio

[Nexori Studio](https://github.com/nexori) - 打造高质量的数字产品和服务

## 📄 许可证

MIT License
