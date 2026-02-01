# 🎮 Joyful Finance (Finance Game)

一个简单、有趣且强大的个人财务追踪应用，旨在像玩游戏一样管理你的财富。

## ✨ 功能特性

本项目采用游戏化的理念来管理个人财务，核心功能包括：

- **💰 收支管理**：记录每日收入与支出，支持多级分类（生存、社交、娱乐、发展）。
- **📊 预算控制**：设定每月固定预算与弹性预算，实时监控消费进度。
- **🏠 资产负债表**：追踪个人资产（如房产、存款）与负债（如房贷、车贷），自动计算净资产。
- **📅 每日任务**：将每日记账视为“每日任务”，完成任务即可获得“战利品”（财务健康）。
- **📈 可视化报表**：通过直观的图表展示财务状况。

## 🛠️ 技术栈

本项目使用现代化的全栈技术构建，确保高性能与易维护性：

- **框架**: [Next.js 16](https://nextjs.org/) (App Router)
- **语言**: [TypeScript](https://www.typescriptlang.org/)
- **数据库**: [SQLite](https://www.sqlite.org/) (轻量级、无需配置)
- **ORM**: [Prisma](https://www.prisma.io/) (类型安全的数据库操作)
- **样式**: [Tailwind CSS](https://tailwindcss.com/)
- **UI 组件**: Lucide React (图标), Framer Motion (动画)
- **容器化**: Docker & Docker Compose

## 🚀 部署指南

本项目推荐使用 Docker 进行部署，标准部署目录为 `/opt/finance-track/`。

### 1. 首次部署

1.  **准备环境**：确保服务器安装了 Docker 和 Docker Compose。
2.  **上传代码**：将项目文件上传至服务器 `/opt/finance-track/`。
3.  **运行脚本**：
    ```bash
    chmod +x setup.sh
    ./setup.sh
    ```
    该脚本会自动创建数据目录、设置权限并启动容器。

### 2. Nginx 配置 (HTTPS)

本项目运行在 `3011` 端口，建议使用 Nginx 反向代理并配置 SSL。

- 配置文件参考：`nginx.conf`
- 域名：`finance-game.blackmstone.site`
- 证书：推荐使用 `certbot` 自动获取 Let's Encrypt 证书。

## 🛡️ 日常维护

### 更新代码

当你修改了本地代码并重新上传到服务器后，执行以下命令即可平滑更新：

```bash
cd /opt/finance-track
docker-compose up -d --build
```
*注：此操作会自动重建镜像并重启容器，数据库数据**不会**丢失。*

### 数据备份

数据存储在服务器的 `/opt/finance-track/data/dev.db` 文件中。

**手动备份**（推荐定期执行）：
```bash
# 在本地电脑执行
scp root@your-server-ip:/opt/finance-track/data/dev.db ./backup_$(date +%Y%m%d).db
```

### 数据库重置

如果你想清空所有数据重新开始：

1.  **本地重置**：在本地开发环境运行 `npx prisma migrate reset` 生成一个空的 `dev.db`。
2.  **上传覆盖**：将空的 `dev.db` 上传覆盖服务器上的 `/opt/finance-track/data/dev.db`。
3.  **重启服务**：
    ```bash
    docker-compose down
    docker-compose up -d
    ```

## 💻 本地开发

```bash
# 安装依赖
npm install

# 初始化数据库
npx prisma migrate dev

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 开始开发。
