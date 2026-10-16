# ERROR 404 写回 Lark 多维表格

1. 多维表格新建自动化，触发器选「接收 Webhook」，点击监听/发送请求。
2. 在终端发一次测试请求（地址换成你的）：

curl -i -X POST '你的Webhook地址' -H 'Content-Type: application/json' -d '{"employeeId":"K007309","runId":"test-001","score":48,"durationSeconds":30,"completedAt":"2026-10-16 15:30:00"}'

3. Lark 识别参数后，添加「新增记录」动作并映射字段：
   employeeId→工号(文本)，score→关闭窗口数(数字)，durationSeconds→时长(数字)，completedAt→通关时间(文本)，runId→runId(文本)。
4. 保存并启用，把 Webhook 地址填入 config.js，再上传到 GitHub（index.html、game.js、config.js 都要上传）。

提示：页面显示"登记成功"只代表请求已发出，以表格是否新增记录为准；自动化有几秒到几十秒延迟。
