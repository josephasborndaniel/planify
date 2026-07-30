import fs from 'fs';
import path from 'path';

const dirs = [
  'c:/planify/EventFlow Mobile App Design/src/admin',
  'c:/planify/EventFlow Mobile App Design/src/admin/components'
];

function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace Tailwind classes
  content = content.replace(/bg-\[#1a1025\]/g, 'bg-[#f0f7ff] dark:bg-[#1a1025]');
  content = content.replace(/bg-\[#231534\]/g, 'bg-[#ddeeff] dark:bg-[#231534]');
  
  // Text colors
  content = content.replace(/text-white/g, 'text-[#0d2d52] dark:text-white');
  content = content.replace(/text-purple-300\/60/g, 'text-[#3a6898] dark:text-purple-300/60');
  content = content.replace(/text-purple-300/g, 'text-[#2a7dd4] dark:text-purple-300'); // Note: This might overlap with /60 if not careful, so order matters. wait, /60 done first.
  
  // Borders
  content = content.replace(/border-purple-500\/20/g, 'border-[#2a7dd4]/20 dark:border-purple-500/20');
  content = content.replace(/border-purple-500\/30/g, 'border-[#2a7dd4]/30 dark:border-purple-500/30');
  content = content.replace(/border-purple-500\/40/g, 'border-[#2a7dd4]/40 dark:border-purple-500/40');
  content = content.replace(/border-purple-500\/50/g, 'border-[#2a7dd4]/50 dark:border-purple-500/50');
  content = content.replace(/border-purple-500\/10/g, 'border-[#2a7dd4]/10 dark:border-purple-500/10');
  content = content.replace(/border-purple-500/g, 'border-[#2a7dd4] dark:border-purple-500');

  // Background inline styles
  content = content.replace(/'#1a1025'/g, "isDark ? '#1a1025' : '#f0f7ff'");
  content = content.replace(/'#231534'/g, "isDark ? '#231534' : '#ddeeff'");
  
  // Border inline styles
  content = content.replace(/'1px solid rgba\(168,85,247,0.1\)'/g, "isDark ? '1px solid rgba(168,85,247,0.1)' : '1px solid rgba(42,125,212,0.1)'");
  content = content.replace(/'1px solid rgba\(168,85,247,0.2\)'/g, "isDark ? '1px solid rgba(168,85,247,0.2)' : '1px solid rgba(42,125,212,0.2)'");
  content = content.replace(/'1px solid rgba\(168,85,247,0.15\)'/g, "isDark ? '1px solid rgba(168,85,247,0.15)' : '1px solid rgba(42,125,212,0.15)'");
  content = content.replace(/'1px solid rgba\(168,85,247,0.3\)'/g, "isDark ? '1px solid rgba(168,85,247,0.3)' : '1px solid rgba(42,125,212,0.3)'");
  content = content.replace(/'0 0 40px rgba\(168,85,247,0.3\)'/g, "isDark ? '0 0 40px rgba(168,85,247,0.3)' : '0 0 40px rgba(42,125,212,0.3)'");
  
  // Also inline text colors
  content = content.replace(/'#fff'/g, "isDark ? '#fff' : '#0d2d52'");

  fs.writeFileSync(filePath, content);
  console.log('Updated ' + filePath);
}

dirs.forEach(dir => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    processFile(path.join(dir, file));
  });
});
