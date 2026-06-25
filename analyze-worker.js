const fs = require('fs');

// Read the actual worker.js that might have been changed by wrangler
const workerPath = '.open-next/worker.js';
if (fs.existsSync(workerPath)) {
    const content = fs.readFileSync(workerPath, 'utf8');
    console.log('=== Current worker.js analysis ===');
    console.log('Length:', content.length, 'bytes');
    console.log('\nFirst line:', JSON.stringify(content.split('\n')[0]));
    console.log('Last 50 chars:', JSON.stringify(content.substring(Math.max(0, content.length - 50))));
    
    // Check for error handling that's returning the error
    if (content.includes('Server failed to respond.')) {
        console.log('\n❌ FOUND: Error handling that returns "Server failed to respond."');
        console.log('   This is causing the 500 error');
        
        console.log('\n✗ FIX NEEDED: Remove this error handling code from worker.js');
    } else {
        console.log('\n✅ No error handling with "Server failed to respond." found');
        
        // If the worker looks clean, it should work
        if (content.includes('async fetch') && content.includes('export default {')) {
            console.log('✅ Worker has proper structure:');
            console.log('   - export default statement present');
            console.log('   - async fetch method present');
            console.log('\nThe worker should work correctly on Cloudflare!');
        }
    }
} else {
    console.log('worker.js not found');
}