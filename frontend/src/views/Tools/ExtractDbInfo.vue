<template>
    <CustomTabs>
        <el-tabs v-model="activeTab" type="card" class="demo-tabs">
            <el-tab-pane name="dashborad">
                <template #label>
                    <span class="custom-tabs-label">
                        <el-icon>
                            <DataAnalysis />
                        </el-icon>
                        <span>连接池</span>
                    </span>
                </template>
                <el-row :gutter="12" v-if="connections && connections.length > 0">
                    <el-col :span="12" v-for="(connection, index) in connections" :key="index">
                        <el-card class="connection-card" :class="{ 'connected': connection.connected }"
                            v-loading="connection.loading">
                            <template #header>
                                <div class="my-header">
                                    <el-space>
                                        <el-avatar :icon="getDbIcon(connection)" />
                                        <span>{{ connection.host }}</span>
                                        <el-tag v-if="connection.notes">{{ connection.notes }}</el-tag>
                                        <el-tag :type="connection.connected ? 'success' : 'danger'">
                                            {{ connection.connected ? '已连接' : '未连接' }}
                                        </el-tag>
                                    </el-space>
                                    <el-button-group>
                                        <el-tooltip :content="connection.connected ? '断开连接' : '连接'">
                                            <el-button :icon="connection.connected ? disconnectedIcon : Connection" link
                                                @click="openConnection(connection)"></el-button>
                                        </el-tooltip>
                                        <el-tooltip content="修改设置">
                                            <el-button :icon="Setting" link
                                                @click="showEditConnectionDialog(connection)"></el-button>
                                        </el-tooltip>
                                        <el-tooltip content="删除">
                                            <el-button :icon="Delete" link
                                                @click="deleteConnection(index, connection.nanoid)"></el-button>
                                        </el-tooltip>
                                    </el-button-group>
                                </div>
                            </template>
                            <div class="my-header">
                                <el-space :size="10">
                                    <el-button :icon="Coin" link>数据库:{{ connection.databaseCount }}</el-button>
                                    <el-button :icon="Postcard" link>
                                        <span v-if="connection.type != 'mongodb'">表</span><span v-else>集合</span>
                                        :{{ connection.tableCount }}
                                    </el-button>
                                </el-space>
                                <el-button :icon="View" text bg @click="collectInfo(connection)"
                                    :disabled="!connection.connected">
                                    采集信息
                                </el-button>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </el-tab-pane>
            <template v-for="(connection, index) in connections">
                <el-tab-pane :key="index" :label="connection.type + '://' + connection.host + ':' + connection.port"
                    :name="connection.host + ':' + connection.port" v-if="connection.connected">
                    <el-table :data="connection.tablePanes" :cell-style="{ textAlign: 'center' }"
                    :header-cell-style="{ 'text-align': 'center' }" style="height: calc(100vh - 175px);" >
                        <el-table-column label="#" type="index" width="60" />
                        <el-table-column label="Table Name">
                            <template #default="scope">
                                <span>{{ scope.row.title }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="Matched Type">
                            <template #default="scope">
                                <span>{{ scope.row.matchedType }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="Number of Rows">
                            <template #default="scope">
                                <span>{{ scope.row.rowsCount }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="Operate" style="width: 200px;">
                            <template #default="scope">
                                <el-button size="small" :icon="Reading" @click="showTable(scope.row.content)">查看</el-button>
                                <el-button size="small" :icon="Delete" @click="removeTable(connection, scope.row.name)">删除</el-button>
                            </template>
                        </el-table-column>
                        <template #empty>
                            <el-empty />                        </template>
                    </el-table>
                    <div class="my-header" style="margin-top: 5px;">
                        <span>{{ progressTips }}</span>
                        <div></div>
                    </div>
                </el-tab-pane>
            </template>
        </el-tabs>
        <template #ctrl>
            <el-space :size="5">
                <el-button type="primary" :icon="Plus" @click="showAddConnectionDialog">添加连接</el-button>
                <el-button :icon="Setting" text bg @click="settingDialog = true"></el-button>
            </el-space>
        </template>
    </CustomTabs>

    <el-dialog v-model="dialogVisible" :title="isEditing ? '修改连接' : '添加新连接'" width="30%">
        <el-form :model="currentConnection" label-width="auto">
            <el-form-item label="数据库类型">
                <el-select v-model="currentConnection.type" @change="chooseDefaultPort">
                    <el-option v-for="item in databaseOptions" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item label="主机">
                <el-input v-model="currentConnection.host"></el-input>
            </el-form-item>
            <el-form-item label="端口">
                <el-input-number v-model="currentConnection.port" controls-position="right">
                    <template #decrease-icon>
                        <el-icon>
                            <Minus />
                        </el-icon>
                    </template>
                    <template #increase-icon>
                        <el-icon>
                            <Plus />
                        </el-icon>
                    </template>
                </el-input-number>
            </el-form-item>
            <el-form-item label="用户名">
                <el-input v-model="currentConnection.username"></el-input>
            </el-form-item>
            <el-form-item label="密码">
                <el-input v-model="currentConnection.password" type="password" show-password></el-input>
            </el-form-item>
            <el-form-item label="备注">
                <el-input v-model="currentConnection.notes"></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="isEditing ? updateConnection() : addConnection()">
                    确认
                </el-button>
            </span>
        </template>
    </el-dialog>
    <el-dialog v-model="settingDialog" title="设置" width="50%">
        <el-alert :closable="false" style="margin-bottom: 10px;">{{ tips }}</el-alert>
        <el-form :model="currentConnection">
            <el-form-item label="列名关键字">
                <el-input v-model="global.database.columnsNameKeywords" type="textarea" :rows="3"></el-input>
                <span style="font-size: smaller">当数据库列名包含上述关键字时，会采集信息时会进行打印。以,分隔</span>
                <el-button type="primary" @click="SaveConfig" size="small" style="margin-inline: 10px;">保存</el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
    <el-drawer v-model="detailDialogVisible" title="数据内容详情" size="80%">
        <div v-html="detailDialogContent"></div>
    </el-drawer>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { Connection, Setting, Plus, Delete, Coin, View, Postcard, Reading } from '@element-plus/icons-vue'
import { AddConnection, ConnectDatabase, DisconnectDatabase, FetchDatabaseinfoFromMongodb, FetchDatabaseinfoFromMysql, FetchDatabaseInfoFromOracle, FetchDatabaseInfoFromPostgres, FetchDatabaseinfoFromSqlServer, FetchTableInfoFromMysql, FetchTableInfoFromOracle, FetchTableInfoFromPostgres, FetchTableInfoFromSqlServer, GetAllDatabaseConnections, RemoveConnection, UpdateConnection } from 'wailsjs/go/services/Database'
import { ElMessage } from 'element-plus'
import mysqlIcon from '@/assets/icon/mysql.svg'
import mssqlIcon from '@/assets/icon/sqlserver.svg'
import oracleIcon from '@/assets/icon/oracle.svg'
import psqlIcon from '@/assets/icon/postgresql.svg'
import mongodbIcon from '@/assets/icon/mongodb.svg'
import disconnectedIcon from '@/assets/icon/disconnect.svg'
import CustomTabs from '@/components/CustomTabs.vue'
import { nanoid as nano } from 'nanoid'
import { regexpAKSK, regexpIdCard, regexpPhone } from '@/stores/validate'
import global from '@/global'
import { SaveConfig } from '@/config'
import { databaseOptions } from '@/stores/options'
import { DatabaseConnection } from '@/stores/interface'
import { structs } from 'wailsjs/go/models'

const activeTab = ref('dashborad')

const connections = ref<DatabaseConnection[]>([])

const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const detailDialogContent = ref('')
const isEditing = ref(false)
const editingIndex = ref(-1)
const progressTips = ref('')
const currentConnection = reactive<DatabaseConnection>({
    nanoid: '',
    type: 'mysql',
    host: '',
    port: 0,
    username: '',
    password: '',
    notes: '',
    connected: false,
    loading: false,
    tablePanes: [],
})

// 初始化为空对象, 低版本mac不初始化会提示 ReferenceError: Cannot access uninitialized variable
var dbinfo: { [key: string]: string[] } = {};

const settingDialog = ref(false)

const tips = `Tips: 在连接除Mongodb之外的数据库时，程序会自动忽略系统数据库，所以有时面板显示数据库数量为0`

function chooseDefaultPort() {
    switch (currentConnection.type) {
        case 'mysql':
            currentConnection.port = 3306
            break
        case 'mssql':
            currentConnection.port = 1433
            break
        case 'oracle':
            currentConnection.port = 1521
            break
        case 'postgres':
            currentConnection.port = 5432
            break
        default:
            currentConnection.port = 27017
    }
}

onMounted(async () => {
    chooseDefaultPort()
    await nextTick()
    let result = await GetAllDatabaseConnections()
    if (result && result.length > 0) {
        result.forEach(item => {
            connections.value.push({
                nanoid: item.Nanoid,
                type: item.Scheme,
                host: item.Host,
                port: item.Port,
                username: item.Username,
                password: item.Password,
                notes: item.Notes,
                connected: false,
                loading: false,
                databaseCount: 0,
                tableCount: 0,
                tablePanes: [],
            })
        })
    }
})

function resetCurrentConnection() {
    Object.assign(currentConnection, {
        name: '',
        type: 'mysql',
        host: '',
        port: 3306,
        username: '',
        password: '',
        connected: false,
        tablePanes: [],
        activeTableTab: '',
    })
}

function showAddConnectionDialog() {
    isEditing.value = false
    resetCurrentConnection()
    dialogVisible.value = true
}

function showEditConnectionDialog(connection: DatabaseConnection) {
    isEditing.value = true
    Object.assign(currentConnection, connection)
    editingIndex.value = connections.value.findIndex(c => `${c.host}:${c.port}` === `${connection.host}:${connection.port}`)
    dialogVisible.value = true
}


async function addConnection() {
    if (currentConnection.host == '') {
        ElMessage.warning("主机地址不能为空!")
        return
    }
    let id = nano()
    let result = await AddConnection({
        Nanoid: id,
        Scheme: currentConnection.type,
        Host: currentConnection.host,
        Port: currentConnection.port,
        Username: currentConnection.username,
        Password: currentConnection.password,
        Notes: currentConnection.notes,
    })
    if (!result) {
        ElMessage.error("添加失败");
        return
    }
    ElMessage.success("添加成功")
    connections.value.push({
        nanoid: id,
        type: currentConnection.type,
        host: currentConnection.host,
        port: currentConnection.port,
        username: currentConnection.username,
        password: currentConnection.password,
        notes: currentConnection.notes,
        connected: false,
        loading: false,
        databaseCount: 0,
        tableCount: 0,
        tablePanes: [],
    })
    dialogVisible.value = false
    resetCurrentConnection()
}

async function updateConnection() {
    if (editingIndex.value > -1) {
        connections.value[editingIndex.value] = { ...currentConnection }
        let result = await UpdateConnection({
            Nanoid: currentConnection.nanoid,
            Scheme: currentConnection.type,
            Host: currentConnection.host,
            Port: currentConnection.port,
            Username: currentConnection.username,
            Password: currentConnection.password,
            Notes: currentConnection.notes
        })
        if (result) {
            ElMessage.success("修改成功")
        }
        dialogVisible.value = false
        resetCurrentConnection()
    }
}

async function deleteConnection(index: number, nanoid: string) {
    connections.value.map(item => {
        if (item.nanoid === nanoid && item.connected) DisconnectDatabase(item.type)
    })
    connections.value.splice(index, 1)
    let result = await RemoveConnection(nanoid)
    result ? ElMessage.success('删除成功') : ElMessage.error('删除失败')
}

function getDbIcon(connection: DatabaseConnection) {
    switch (connection.type) {
        case 'mysql':
            return mysqlIcon
        case 'mssql':
            return mssqlIcon
        case 'oracle':
            return oracleIcon
        case 'postgres':
            return psqlIcon
        default:
            return mongodbIcon
    }
}

async function openConnection(connection: DatabaseConnection) {
    if (connection.connected) {
        let result = await DisconnectDatabase(connection.type)
        if (result) {
            ElMessage.success("已断开连接")
            connection.connected = false
            connection.tableCount = 0
            connection.tablePanes = []
            connection.databaseCount = 0
        } else {
            ElMessage.error("断开连接失败")
        }
        return
    }
    // 打开新连接前，关闭其他链接
    connections.value.forEach(item => {
        if (item.connected) {
            item.connected = false
            item.databaseCount = 0
            item.tableCount = 0
            DisconnectDatabase(item.type)
        }
    })
    let option: structs.DatabaseConnection = {
        Nanoid: connection.nanoid,
        Scheme: connection.type,
        Host: connection.host,
        Port: connection.port,
        Username: connection.username,
        Password: connection.password,
        Notes: connection.notes,
    }
    connection.loading = true
    let flag = await ConnectDatabase(option)
    if (!flag) return
    connection.connected = true
    ElMessage.success('连接成功')
    switch (connection.type) {
        case 'mysql':
            dbinfo = await FetchDatabaseinfoFromMysql()
            break
        case 'mssql':
            dbinfo = await FetchDatabaseinfoFromSqlServer()
            break
        case 'oracle':
            dbinfo = await FetchDatabaseInfoFromOracle()
            break
        case 'postgres':
            dbinfo = await FetchDatabaseInfoFromPostgres()
            break
        default:
            dbinfo = await FetchDatabaseinfoFromMongodb()
    }
    connection.databaseCount = Object.keys(dbinfo).length;
    connection.tableCount = 0;
    Object.entries(dbinfo).forEach(([_, value]) => {
        connection.tableCount! += value.length;
    });
    connection.loading = false
}

// 提取列名匹配函数
function matchColumn(columns: string[]): { matched: boolean; keyword?: string } {
    let keywordColumns = global.database.columnsNameKeywords.split(",")
    if (keywordColumns.length == 0) keywordColumns = ['phone', 'telephone', 'idcard', 'card', 'password', 'username', 'mobile', 'sfz', 'secret']
    let matched = columns.some(column =>
        keywordColumns.some(keyword => {
            if (column.toLowerCase().includes(keyword)) {
                return true;
            }
            return false;
        })
    );
    let keyword = matched ? keywordColumns.find(keyword => columns.some(column => column.toLowerCase().includes(keyword))) : undefined;
    return { matched, keyword };
};


const regexOptions = [
    {
        label: 'ID Card',
        regex: regexpIdCard
    },
    {
        label: 'AKSK',
        regex: regexpAKSK
    },
];

// 提取行数据匹配函数，手机号正则需要单独提取，避免误报情况， 此处匹配成功也需要返回匹配的正则是哪种
function matchRows(rows: any[][]): { matched: boolean, matchedLabel?: string } {
    for (let row of rows) {
        for (let cell of row) {
            if (!cell) continue; // Skip empty or null cells
            try {
                const decodedValue = atob(cell); // Attempt Base64 decoding
                if (regexpPhone.test(decodedValue) && (decodedValue.length === 11)) {
                    return { matched: true, matchedLabel: "Phone Number" };
                }
                for (let option of regexOptions) {
                     if (option.regex.test(decodedValue)) {
                        return { matched: true, matchedLabel: option.label };
                    }
                }
            } catch (error) {
                if (regexpPhone.test(cell) && (cell.length === 11)) {
                    return { matched: true, matchedLabel: "Phone Number" };
                }
                for (let option of regexOptions) {
                     if (option.regex.test(cell)) {
                        return { matched: true, matchedLabel: option.label };
                    }
                }
            }
        }
    }
    return { matched: false }; // No match found
}


async function collectInfo(connection: DatabaseConnection) {
    if (!connection.connected) {
        ElMessage.warning("请先连接数据库");
        return;
    }
    if (connection.databaseCount == 0 || connection.databaseCount == undefined) {
        ElMessage.warning("未发现系统数据库外的数据库，已跳过数据采集");
        return;
    }
    // 切换到该连接的选项卡
    activeTab.value = `${connection.host}:${connection.port}`;
    connection.tablePanes = [];
    let fetchTable: (arg1: string, arg2: string) => Promise<structs.RowData>
    switch (connection.type) {
        case 'mysql':
            fetchTable = FetchTableInfoFromMysql
            break
        case 'mssql':
            fetchTable = FetchTableInfoFromSqlServer
            break
        case 'oracle':
            fetchTable = FetchTableInfoFromOracle
            break
        case 'postgres':
            fetchTable = FetchTableInfoFromPostgres
            break
        default:
            ElMessage.warning("不支持该数据库类型进行信息收集")
            return
    }
    // 遍历数据库表
    let totalTables = Object.values(dbinfo).reduce((acc, tables) => acc + tables.length, 0);
    let processedTables = 0;
    for (const [dbname, tables] of Object.entries(dbinfo)) {
        for (const table of tables) {
            processedTables++;
            progressTips.value = `当前采集进度: (${processedTables}/${totalTables})`;
            let render = await fetchTable(dbname, table);
            if (render.Rows && render.Rows.length > 0) {
                const columnResult = matchColumn(render.Columns);
                const rowsResult = matchRows(render.Rows);
                if (columnResult.matched || rowsResult.matched) {
                    // 匹配到列名或行数据后，渲染表格
                    const tableDataHtml = renderToHtmlTable(render);
                    const tabName = `${dbname}.${table}`;
                    connection.tablePanes.push({
                        name: tabName,
                        content: tableDataHtml,
                        rowsCount: render.RowsCount,
                        matchedType: columnResult.keyword ? columnResult.keyword : rowsResult.matchedLabel,
                    });
                }
            }
        }
    }
}


function renderToHtmlTable(data: structs.RowData) {
    let html = '<div class="table-responsive"><table class="db-table">';

    // 添加列名
    html += '<thead><tr>';
    data.Columns.forEach(col => {
        html += `<th>${col}</th>`;
    });
    html += '</tr></thead>';

    // 添加行数据
    html += '<tbody>';
    data.Rows.forEach(row => {
        html += '<tr>';
        row.forEach(cell => {
            if (typeof cell === 'string') {
                try {
                    const decodedValue = decodeBase64ToUtf8(cell) // Base64 解码
                    html += `<td><div class="cell-content">${decodedValue}</div></td>`;
                } catch (error) {
                    html += `<td><div class="cell-content">${cell}</div></td>`;
                }
            } else {
                html += `<td><div class="cell-content">${cell !== null ? cell : ''}</div></td>`;
            }
        });
        html += '</tr>';
    });

    html += '</tbody></table></div>';
    return html;
}

function decodeBase64ToUtf8(base64String: string): string {
    const binaryString = atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    const decoder = new TextDecoder('utf-8', { fatal: true }); // 确保编码错误时抛出异常
    return decoder.decode(bytes);
}

function removeTable(connection: DatabaseConnection, targetName: string) {
    connection.tablePanes = connection.tablePanes.filter(tab => tab.name !== targetName);
}

function showTable(content: string) {
    detailDialogVisible.value = true
    detailDialogContent.value = content
}
</script>

<style scoped>
.connection-card {
    margin-bottom: 10px;
    transition: all 0.3s ease;
}

.connection-card.connected {
    border-color: var(--el-color-success);
}

.table-tabs :deep(.el-tabs__item) {
    width: 150px;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

:deep(.table-responsive) {
    overflow-x: auto;
}

:deep(.db-table) {
    width: 100%;
    border-collapse: collapse;
}

:deep(.db-table th),
:deep(.db-table td) {
    padding: 12px;
    border: 1px solid;
}

:deep(.db-table th) {
    font-weight: bold;
}


:deep(.cell-content) {
    max-height: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>