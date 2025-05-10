#!/usr/bin/env node
/**
 * This script provides a secure way to run Supabase CLI commands with the 
 * correct database password from environment variables, without exposing 
 * the password in scripts or command history.
 * 
 * Usage: node scripts/supabase-env.js [supabase command and args]
 * Example: node scripts/supabase-env.js db pull
 */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from .env.local and .env
const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envPath = path.resolve(process.cwd(), '.env');

try {
  // Load from .env.local first (takes precedence)
  if (fs.existsSync(envLocalPath)) {
    console.log(`Loading environment from ${envLocalPath}`);
    const envLocalConfig = dotenv.parse(fs.readFileSync(envLocalPath));
    Object.entries(envLocalConfig).forEach(([key, value]) => {
      process.env[key] = value;
    });
  }

  // Load from .env second
  if (fs.existsSync(envPath)) {
    console.log(`Loading environment from ${envPath}`);
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    Object.entries(envConfig).forEach(([key, value]) => {
      // Don't override .env.local values
      if (!process.env[key]) {
        process.env[key] = value;
      }
    });
  }
} catch (err) {
  console.error(`Error loading environment variables: ${err}`);
  process.exit(1);
}

// Set Supabase DB password from POSTGRES_PASSWORD
if (process.env.POSTGRES_PASSWORD) {
  process.env.SUPABASE_DB_PASSWORD = process.env.POSTGRES_PASSWORD;
} else {
  console.error('POSTGRES_PASSWORD is not set in .env.local or .env');
  process.exit(1);
}

// Get all the arguments to pass to the supabase command
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('No supabase command specified');
  console.error('Usage: node scripts/supabase-env.js [supabase command and args]');
  console.error('Example: node scripts/supabase-env.js db pull');
  process.exit(1);
}

console.log(`Running: supabase ${args.join(' ')}`);

// Execute the supabase command
const subprocess = spawn('npx', ['supabase', ...args], { 
  stdio: 'inherit',
  env: process.env
});

// Handle process completion
subprocess.on('close', (code) => {
  process.exit(code);
});