git拉取:
git@gitlab.tenddata.com:tommy/conch-server.git
dev 分支

安装依赖
npm install

把 _conch_res.zip 解压到用户根目录（win7：C:\Users\your_name\_conch_res）

运行构建脚本
webpack

运行electron打包脚本：
windows运行脚本 npm run package
mac运行脚本 npm run package-mac

在当前目录的上一级并列目录中会有 OutApp-mac 或者 OutApp-win 目录，即为可执行程序