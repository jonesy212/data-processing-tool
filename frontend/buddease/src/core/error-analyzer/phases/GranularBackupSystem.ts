// GranularBackupSystem.ts

import fs from 'fs';
import path from 'path';
import { Project, Node } from '@/core/models/projects/Project';

const BACKUP_ROOT = path.resolve('.phase-backups');

/**
 * Utility to create directories recursively
 */
const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

/**
 * Generate timestamp string
 */
const timestamp = () => new Date().toISOString().replace(/[:.]/g, '-');

/**
 * Full Project Backup
 */
export const backupProject = () => {
  const target = path.resolve('.');
  const dest = path.join(BACKUP_ROOT, 'full-project', timestamp());
  ensureDir(dest);
  fs.cpSync(target, dest, { recursive: true });
  console.log(`Full project backup saved to: ${dest}`);
};

/**
 * Folder-Level Backup
 */
export const backupFolder = (folderPath: string) => {
  const folderName = folderPath.replace(/[\/\\]/g, '_');
  const dest = path.join(BACKUP_ROOT, 'folders', folderName, timestamp());
  ensureDir(dest);
  fs.cpSync(folderPath, dest, { recursive: true });
  console.log(`Folder backup saved to: ${dest}`);
};

/**
 * File-Level Backup
 */
export const backupFile = (filePath: string) => {
  const fileName = path.basename(filePath);
  const destDir = path.join(BACKUP_ROOT, 'files', fileName);
  ensureDir(destDir);
  const destFile = path.join(destDir, `${timestamp()}.ts`);
  fs.copyFileSync(filePath, destFile);
  console.log(`File backup saved to: ${destFile}`);
};

/**
 * Code Block-Level Backup (interface, class, function)
 */
export const backupCodeBlock = (filePath: string, blockName: string) => {
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(filePath);
  let node: Node | undefined;

  node = sourceFile.getInterface(blockName) || 
         sourceFile.getClass(blockName) || 
         sourceFile.getFunction(blockName);

  if (!node) {
    console.warn(`Block "${blockName}" not found in ${filePath}`);
    return;
  }

  const codeText = node.getText();
  const fileName = path.basename(filePath);
  const destDir = path.join(BACKUP_ROOT, 'blocks', fileName);
  ensureDir(destDir);
  const destFile = path.join(destDir, `${blockName}-${timestamp()}.ts`);
  fs.writeFileSync(destFile, codeText);
  console.log(`Block "${blockName}" backup saved to: ${destFile}`);
};

/**
 * Rollback functions
 */
const getLatestBackup = (dir: string) => {
  if (!fs.existsSync(dir)) return null;
  const backups = fs.readdirSync(dir).sort();
  return backups.length ? path.join(dir, backups[backups.length - 1]) : null;
};

/** Rollback full project */
export const rollbackProject = () => {
  const latest = getLatestBackup(path.join(BACKUP_ROOT, 'full-project'));
  if (!latest) return console.warn('No full project backup found');
  fs.rmSync(path.resolve('.'), { recursive: true, force: true });
  fs.cpSync(latest, path.resolve('.'), { recursive: true });
  console.log(`Full project restored from: ${latest}`);
};

/** Rollback folder */
export const rollbackFolder = (folderPath: string) => {
  const folderName = folderPath.replace(/[\/\\]/g, '_');
  const latest = getLatestBackup(path.join(BACKUP_ROOT, 'folders', folderName));
  if (!latest) return console.warn('No folder backup found');
  fs.rmSync(folderPath, { recursive: true, force: true });
  fs.cpSync(latest, folderPath, { recursive: true });
  console.log(`Folder "${folderPath}" restored from: ${latest}`);
};

/** Rollback file */
export const rollbackFile = (filePath: string) => {
  const fileName = path.basename(filePath);
  const latest = getLatestBackup(path.join(BACKUP_ROOT, 'files', fileName));
  if (!latest) return console.warn('No file backup found');
  fs.copyFileSync(latest, filePath);
  console.log(`File "${filePath}" restored from: ${latest}`);
};

/** Rollback code block */
export const restoreCodeBlock = (filePath: string, blockName: string) => {
  const fileName = path.basename(filePath);
  const latest = getLatestBackup(path.join(BACKUP_ROOT, 'blocks', fileName));
  if (!latest) return console.warn(`No block backup found for "${blockName}"`);

  const codeText = fs.readFileSync(latest, 'utf-8');
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(filePath);
  let node = sourceFile.getInterface(blockName) || 
             sourceFile.getClass(blockName) || 
             sourceFile.getFunction(blockName);

  if (node) {
    node.replaceWithText(codeText);
  } else {
    sourceFile.addStatements(codeText);
  }

  sourceFile.saveSync();
  console.log(`Block "${blockName}" restored in ${filePath} from: ${latest}`);
};
