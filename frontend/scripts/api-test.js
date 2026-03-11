/**
 * 廉智通 API 测试脚本
 * 测试所有核心功能的 API 端点
 *
 * 运行方式: node scripts/api-test.js
 *
 * 前置条件:
 * 1. 后端服务已启动: python manage.py runserver 0.0.0.0:8001
 * 2. 已创建超级用户: python manage.py createsuperuser
 */

const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:8001/api';
const ADMIN_USERNAME = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASS || 'admin123';

let accessToken = null;
let testResults = [];
let testCaseId = null;
let testTrialId = null;
let testConclusionId = null;
let testEvidenceId = null;
let testReportId = null;

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, status, message = '') {
  const symbol = status === 'PASS' ? '✓' : '✗';
  const color = status === 'PASS' ? 'green' : 'red';
  log(`  ${symbol} ${name}${message ? ': ' + message : ''}`, color);
  testResults.push({ name, status, message });
}

function logSection(title) {
  log('\n' + '='.repeat(60), 'cyan');
  log(`  ${title}`);
  log('='.repeat(60) + '\n', 'cyan');
}

async function login() {
  logSection('1. 用户认证测试');

  try {
    const response = await axios.post(`${BASE_URL}/token/`, {
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD
    });

    accessToken = response.data.access;
    logTest('用户登录', 'PASS', `获取到 token`);
    return true;
  } catch (error) {
    logTest('用户登录', 'FAIL', error.response?.data?.detail || error.message);
    return false;
  }
}

function getHeaders() {
  return {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };
}

async function testReports() {
  logSection('2. 信访举报模块测试');

  // 测试获取举报列表
  try {
    const response = await axios.get(`${BASE_URL}/reports/`, { headers: getHeaders() });
    logTest('获取举报列表', 'PASS', `共 ${response.data.count || 0} 条`);
  } catch (error) {
    logTest('获取举报列表', 'FAIL', error.response?.data?.detail || error.message);
  }

  // 测试创建举报
  try {
    const response = await axios.post(`${BASE_URL}/reports/`, {
      report_type: 'letter',
      title: '测试举报-' + Date.now(),
      content: '这是测试举报内容',
      reporter: '测试人',
      reporter_phone: '13800138000',
      is_anonymous: false,
      accused_name: '被举报人',
      accused_unit: '测试单位',
      accused_position: '测试职务'
    }, { headers: getHeaders() });

    testReportId = response.data.id;
    logTest('创建举报', 'PASS', `ID: ${testReportId}`);
  } catch (error) {
    logTest('创建举报', 'FAIL', JSON.stringify(error.response?.data) || error.message);
  }

  // 测试更新举报
  if (testReportId) {
    try {
      await axios.patch(`${BASE_URL}/reports/${testReportId}/`, {
        title: '更新后的举报标题'
      }, { headers: getHeaders() });
      logTest('更新举报', 'PASS');
    } catch (error) {
      logTest('更新举报', 'FAIL', error.response?.data?.detail || error.message);
    }
  }

  // 测试受理举报
  if (testReportId) {
    try {
      await axios.post(`${BASE_URL}/reports/${testReportId}/accept/`, {}, { headers: getHeaders() });
      logTest('受理举报', 'PASS');
    } catch (error) {
      logTest('受理举报', 'FAIL', error.response?.data?.detail || error.message);
    }
  }
}

async function testCases() {
  logSection('3. 案件管理模块测试');

  // 测试获取案件列表
  try {
    const response = await axios.get(`${BASE_URL}/cases/`, { headers: getHeaders() });
    logTest('获取案件列表', 'PASS', `共 ${response.data.count || 0} 条`);
  } catch (error) {
    logTest('获取案件列表', 'FAIL', error.response?.data?.detail || error.message);
  }

  // 测试创建案件
  try {
    const response = await axios.post(`${BASE_URL}/cases/`, {
      case_name: '测试案件-' + Date.now(),
      case_type: 'discipline',
      suspect_name: '被调查人测试',
      suspect_unit: '测试单位',
      suspect_position: '测试职务',
      case_level: 'ordinary',
      report_source: '自行发现',
      summary: '这是测试案件摘要'
    }, { headers: getHeaders() });

    testCaseId = response.data.id;
    logTest('创建案件', 'PASS', `ID: ${testCaseId}`);
  } catch (error) {
    logTest('创建案件', 'FAIL', JSON.stringify(error.response?.data) || error.message);
  }

  // 测试获取单个案件
  if (testCaseId) {
    try {
      const response = await axios.get(`${BASE_URL}/cases/${testCaseId}/`, { headers: getHeaders() });
      logTest('获取单个案件', 'PASS', `案件编号: ${response.data.case_no}`);
    } catch (error) {
      logTest('获取单个案件', 'FAIL', error.response?.data?.detail || error.message);
    }
  }

  // 测试更新案件
  if (testCaseId) {
    try {
      await axios.patch(`${BASE_URL}/cases/${testCaseId}/`, {
        case_name: '更新后的案件名称'
      }, { headers: getHeaders() });
      logTest('更新案件', 'PASS');
    } catch (error) {
      logTest('更新案件', 'FAIL', error.response?.data?.detail || error.message);
    }
  }
}

async function testEvidences() {
  logSection('4. 证据材料模块测试');

  if (!testCaseId) {
    log('  跳过证据测试（需要先创建案件）', 'yellow');
    return;
  }

  // 测试获取证据列表
  try {
    const response = await axios.get(`${BASE_URL}/evidences/`, {
      params: { case: testCaseId },
      headers: getHeaders()
    });
    logTest('获取证据列表', 'PASS', `共 ${response.data.count || 0} 条`);
  } catch (error) {
    logTest('获取证据列表', 'FAIL', error.response?.data?.detail || error.message);
  }

  // 测试创建证据
  try {
    const response = await axios.post(`${BASE_URL}/evidences/`, {
      case: testCaseId,
      evidence_type: 'document',
      name: '测试证据-' + Date.now(),
      description: '这是测试证据描述'
    }, { headers: getHeaders() });

    testEvidenceId = response.data.id;
    logTest('创建证据', 'PASS', `ID: ${testEvidenceId}`);
  } catch (error) {
    logTest('创建证据', 'FAIL', JSON.stringify(error.response?.data) || error.message);
  }
}

async function testTrials() {
  logSection('5. 案件审理模块测试');

  if (!testCaseId) {
    log('  跳过审理测试（需要先创建案件）', 'yellow');
    return;
  }

  // 测试获取审理列表
  try {
    const response = await axios.get(`${BASE_URL}/trials/`, { headers: getHeaders() });
    logTest('获取审理列表', 'PASS', `共 ${response.data.count || 0} 条`);
  } catch (error) {
    logTest('获取审理列表', 'FAIL', error.response?.data?.detail || error.message);
  }

  // 测试创建审理
  try {
    const response = await axios.post(`${BASE_URL}/trials/`, {
      case: testCaseId,
      department: '测试移送部门',
      accept_date: new Date().toISOString().slice(0, 10),
      deadline: 30,
      judge: '测试审理员',
      assistants: '测试协办人',
      trial_opinion: '这是测试审理意见'
    }, { headers: getHeaders() });

    testTrialId = response.data.id;
    logTest('创建审理', 'PASS', `ID: ${testTrialId}, 受理编号: ${response.data.accept_no}`);
  } catch (error) {
    logTest('创建审理', 'FAIL', JSON.stringify(error.response?.data) || error.message);
  }

  // 测试更新审理
  if (testTrialId) {
    try {
      await axios.patch(`${BASE_URL}/trials/${testTrialId}/`, {
        trial_opinion: '更新后的审理意见'
      }, { headers: getHeaders() });
      logTest('更新审理', 'PASS');
    } catch (error) {
      logTest('更新审理', 'FAIL', error.response?.data?.detail || error.message);
    }
  }

  // 测试开始审理
  if (testTrialId) {
    try {
      await axios.patch(`${BASE_URL}/trials/${testTrialId}/`, {
        status: 'processing'
      }, { headers: getHeaders() });
      logTest('开始审理', 'PASS');
    } catch (error) {
      logTest('开始审理', 'FAIL', error.response?.data?.detail || error.message);
    }
  }

  // 测试审结
  if (testTrialId) {
    try {
      await axios.patch(`${BASE_URL}/trials/${testTrialId}/`, {
        status: 'completed'
      }, { headers: getHeaders() });
      logTest('审理审结', 'PASS');
    } catch (error) {
      logTest('审理审结', 'FAIL', error.response?.data?.detail || error.message);
    }
  }
}

async function testConclusions() {
  logSection('6. 结案报告模块测试');

  if (!testCaseId) {
    log('  跳过结案测试（需要先创建案件）', 'yellow');
    return;
  }

  // 测试获取结案列表
  try {
    const response = await axios.get(`${BASE_URL}/conclusions/`, { headers: getHeaders() });
    logTest('获取结案列表', 'PASS', `共 ${response.data.count || 0} 条`);
  } catch (error) {
    logTest('获取结案列表', 'FAIL', error.response?.data?.detail || error.message);
  }

  // 测试创建结案
  try {
    const response = await axios.post(`${BASE_URL}/conclusions/`, {
      case: testCaseId,
      conclusion_date: new Date().toISOString().slice(0, 10),
      conclusion_type: 'party_discipline',
      decision: '这是处分决定内容',
      execution_status: 'pending',
      summary: '这是案件办理总结'
    }, { headers: getHeaders() });

    testConclusionId = response.data.id;
    logTest('创建结案', 'PASS', `ID: ${testConclusionId}, 结案编号: ${response.data.conclusion_no}`);
  } catch (error) {
    logTest('创建结案', 'FAIL', JSON.stringify(error.response?.data) || error.message);
  }

  // 测试更新结案
  if (testConclusionId) {
    try {
      await axios.patch(`${BASE_URL}/conclusions/${testConclusionId}/`, {
        execution_status: 'completed',
        execute_date: new Date().toISOString().slice(0, 10)
      }, { headers: getHeaders() });
      logTest('更新结案', 'PASS');
    } catch (error) {
      logTest('更新结案', 'FAIL', error.response?.data?.detail || error.message);
    }
  }

  // 测试归档
  if (testConclusionId) {
    try {
      await axios.patch(`${BASE_URL}/conclusions/${testConclusionId}/`, {
        archived: true
      }, { headers: getHeaders() });
      logTest('归档结案', 'PASS');
    } catch (error) {
      logTest('归档结案', 'FAIL', error.response?.data?.detail || error.message);
    }
  }
}

async function testCaseProgress() {
  logSection('7. 案件进度模块测试');

  if (!testCaseId) {
    log('  跳过进度测试（需要先创建案件）', 'yellow');
    return;
  }

  // 测试获取进度列表
  try {
    const response = await axios.get(`${BASE_URL}/case-progress/`, {
      params: { case: testCaseId },
      headers: getHeaders()
    });
    logTest('获取进度列表', 'PASS', `共 ${response.data.count || 0} 条`);
  } catch (error) {
    logTest('获取进度列表', 'FAIL', error.response?.data?.detail || error.message);
  }

  // 测试创建进度
  try {
    const response = await axios.post(`${BASE_URL}/case-progress/`, {
      case: testCaseId,
      progress_type: 'investigation',
      progress_date: new Date().toISOString().slice(0, 10),
      progress_content: '这是测试进度内容'
    }, { headers: getHeaders() });
    logTest('创建进度', 'PASS', `ID: ${response.data.id}`);
  } catch (error) {
    logTest('创建进度', 'FAIL', JSON.stringify(error.response?.data) || error.message);
  }
}

async function cleanup() {
  logSection('8. 清理测试数据');

  const deletePromises = [];

  if (testConclusionId) {
    deletePromises.push(
      axios.delete(`${BASE_URL}/conclusions/${testConclusionId}/`, { headers: getHeaders() })
        .catch(() => {})
    );
  }
  if (testTrialId) {
    deletePromises.push(
      axios.delete(`${BASE_URL}/trials/${testTrialId}/`, { headers: getHeaders() })
        .catch(() => {})
    );
  }
  if (testEvidenceId) {
    deletePromises.push(
      axios.delete(`${BASE_URL}/evidences/${testEvidenceId}/`, { headers: getHeaders() })
        .catch(() => {})
    );
  }
  if (testCaseId) {
    deletePromises.push(
      axios.delete(`${BASE_URL}/cases/${testCaseId}/`, { headers: getHeaders() })
        .catch(() => {})
    );
  }
  if (testReportId) {
    deletePromises.push(
      axios.delete(`${BASE_URL}/reports/${testReportId}/`, { headers: getHeaders() })
        .catch(() => {})
    );
  }

  if (deletePromises.length > 0) {
    await Promise.all(deletePromises);
    log('  测试数据已清理', 'blue');
  }
}

function printSummary() {
  logSection('测试结果汇总');

  const passed = testResults.filter(r => r.status === 'PASS').length;
  const failed = testResults.filter(r => r.status === 'FAIL').length;
  const total = testResults.length;

  log(`总测试数: ${total}`, 'cyan');
  log(`通过: ${passed}`, 'green');
  log(`失败: ${failed}`, failed > 0 ? 'red' : 'green');
  log(`通过率: ${((passed / total) * 100).toFixed(1)}%`, passed === total ? 'green' : 'yellow');

  if (failed > 0) {
    log('\n失败详情:', 'red');
    testResults.filter(r => r.status === 'FAIL').forEach(r => {
      log(`  - ${r.name}: ${r.message}`, 'red');
    });
  }

  log('\n' + '='.repeat(60), 'cyan');
  if (failed === 0) {
    log('  所有测试通过！', 'green');
  } else {
    log(`  有 ${failed} 个测试失败，请检查问题`, 'yellow');
  }
  log('='.repeat(60) + '\n', 'cyan');

  return failed === 0;
}

async function runTests() {
  log('\n' + '#'.repeat(60), 'blue');
  log('#  廉智通 API 测试套件', 'blue');
  log('#  测试时间: ' + new Date().toLocaleString('zh-CN'), 'blue');
  log('#'.repeat(60) + '\n', 'blue');

  // 登录
  const loggedIn = await login();
  if (!loggedIn) {
    log('\n认证失败，请检查用户名和密码', 'red');
    log('默认凭据: admin / admin123', 'yellow');
    process.exit(1);
  }

  // 运行测试
  await testReports();
  await testCases();
  await testEvidences();
  await testTrials();
  await testConclusions();
  await testCaseProgress();

  // 清理
  await cleanup();

  // 输出结果
  const success = printSummary();

  process.exit(success ? 0 : 1);
}

// 运行测试
runTests().catch(error => {
  log(`\n测试执行错误: ${error.message}`, 'red');
  process.exit(1);
});
