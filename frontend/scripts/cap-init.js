
#!/usr/bin/env node
import { execSync } from 'node:child_process';
try {
  execSync('npx cap init "Music BeReal" "com.example.musicbereal" --web-dir=dist', { stdio: 'inherit' });
  execSync('npx cap add ios', { stdio: 'inherit' });
  execSync('npx cap add android', { stdio: 'inherit' });
  console.log('Capacitor init done.');
} catch (e) {
  console.log('Capacitor already initialized or failed, continuing...');
}
