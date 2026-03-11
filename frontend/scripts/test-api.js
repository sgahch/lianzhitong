/**
 * Frontend API Integration Test Script
 * Tests the frontend API service calls and response handling
 */

import axios from 'axios';

// Test configuration
const API_BASE_URL = 'http://localhost:8001/api';
const AUTH_URL = `${API_BASE_URL}/auth/token/`;

// Test data
const testUser = {
    username: 'admin',
    password: 'admin123'
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
    console.log('\n' + '='.repeat(60));
    log(title, 'blue');
    console.log('='.repeat(60));
}

async function testAPI() {
    let accessToken = null;
    let testResults = { passed: 0, failed: 0 };

    try {
        logSection('1. Authentication Test');

        // Test login
        try {
            const response = await axios.post(AUTH_URL, testUser);
            accessToken = response.data.access;
            log('✓ Login successful', 'green');
            log(`  Token received: ${accessToken.substring(0, 20)}...`);
            testResults.passed++;
        } catch (error) {
            log(`✗ Login failed: ${error.message}`, 'red');
            testResults.failed++;
            return;
        }

        // Create axios instance with auth
        const api = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        logSection('2. Case API Tests');

        // Test get cases list
        try {
            const response = await api.get('/cases/');
            log(`✓ GET /cases/ - Status: ${response.status}`, 'green');
            log(`  Total count: ${response.data.count || 'N/A'}`);
            log(`  Results returned: ${response.data.results?.length || 0}`);
            testResults.passed++;
        } catch (error) {
            log(`✗ GET /cases/ failed: ${error.message}`, 'red');
            testResults.failed++;
        }

        // Test filter cases by status
        try {
            const response = await api.get('/cases/', { params: { status: 'pending' } });
            log(`✓ GET /cases/?status=pending - Status: ${response.status}`, 'green');
            log(`  Filtered results: ${response.data.results?.length || 0}`);
            testResults.passed++;
        } catch (error) {
            log(`✗ Filter cases failed: ${error.message}`, 'red');
            testResults.failed++;
        }

        logSection('3. Trial API Tests');

        // Test get trials list
        try {
            const response = await api.get('/trials/');
            log(`✓ GET /trials/ - Status: ${response.status}`, 'green');
            log(`  Total count: ${response.data.count || 'N/A'}`);
            testResults.passed++;
        } catch (error) {
            log(`✗ GET /trials/ failed: ${error.message}`, 'red');
            testResults.failed++;
        }

        // Test filter trials by status
        try {
            const response = await api.get('/trials/', { params: { status: 'pending' } });
            log(`✓ GET /trials/?status=pending - Status: ${response.status}`, 'green');
            log(`  Pending trials: ${response.data.results?.length || 0}`);
            testResults.passed++;
        } catch (error) {
            log(`✗ Filter trials failed: ${error.message}`, 'red');
            testResults.failed++;
        }

        logSection('4. Conclusion API Tests');

        // Test get conclusions list
        try {
            const response = await api.get('/conclusions/');
            log(`✓ GET /conclusions/ - Status: ${response.status}`, 'green');
            log(`  Total count: ${response.data.count || 'N/A'}`);
            testResults.passed++;
        } catch (error) {
            log(`✗ GET /conclusions/ failed: ${error.message}`, 'red');
            testResults.failed++;
        }

        // Test filter conclusions by archived
        try {
            const response = await api.get('/conclusions/', { params: { archived: 'false' } });
            log(`✓ GET /conclusions/?archived=false - Status: ${response.status}`, 'green');
            log(`  Unarchived conclusions: ${response.data.results?.length || 0}`);
            testResults.passed++;
        } catch (error) {
            log(`✗ Filter conclusions failed: ${error.message}`, 'red');
            testResults.failed++;
        }

        logSection('5. Evidence API Tests');

        // Test get evidence list
        try {
            const response = await api.get('/evidences/');
            log(`✓ GET /evidences/ - Status: ${response.status}`, 'green');
            log(`  Total count: ${response.data.count || 'N/A'}`);
            testResults.passed++;
        } catch (error) {
            log(`✗ GET /evidences/ failed: ${error.message}`, 'red');
            testResults.failed++;
        }

        // Test filter evidence by case
        try {
            const response = await api.get('/evidences/', { params: { case: 1 } });
            log(`✓ GET /evidences/?case=1 - Status: ${response.status}`, 'green');
            log(`  Evidence for case 1: ${response.data.results?.length || 0}`);
            testResults.passed++;
        } catch (error) {
            log(`✗ Filter evidence failed: ${error.message}`, 'red');
            testResults.failed++;
        }

        logSection('6. Unauthenticated Request Test');

        // Test that unauthenticated requests are rejected
        try {
            await axios.get(`${API_BASE_URL}/cases/`);
            log('✗ Unauthenticated request should have failed', 'red');
            testResults.failed++;
        } catch (error) {
            if (error.response?.status === 401) {
                log('✓ Unauthenticated request correctly rejected (401)', 'green');
                testResults.passed++;
            } else {
                log(`✗ Unexpected error: ${error.message}`, 'red');
                testResults.failed++;
            }
        }

        logSection('Test Summary');
        log(`Total Passed: ${testResults.passed}`, 'green');
        log(`Total Failed: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'green');
        log(`Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

    } catch (error) {
        log(`\n✗ Unexpected error: ${error.message}`, 'red');
        log(`Stack: ${error.stack}`);
    }
}

// Run tests
testAPI();
