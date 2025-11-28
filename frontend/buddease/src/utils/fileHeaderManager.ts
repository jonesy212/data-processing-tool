// utils/fileHeaderManager.ts
import fs from 'fs';
import path from 'path';

export class FileHeaderManager {
  static ensureFilenameComment(filePath: string): boolean {
      try {
          const absolutePath = path.resolve(filePath);
          const actualFilename = path.basename(absolutePath);
          const content = fs.readFileSync(absolutePath, 'utf8');
          const lines = content.split('\n');
          
          // Check if shebang exists
          const hasShebang = lines[0].startsWith('#!');
          const startIndex = hasShebang ? 1 : 0;
          
          // Expected comment - always use the actual filename with correct case
          const expectedComment = `// ${actualFilename}`;
          
          // ✅ IMPROVED: Check if filename comment exists in the CORRECT position
          let needsUpdate = false;
          let hasCorrectComment = false;
          
          // Check the correct position first
          if (hasShebang && lines.length > 1) {
              // For files with shebang, comment should be on line 1
              if (lines[1].trim() === expectedComment) {
                  hasCorrectComment = true;
              }
          } else if (!hasShebang && lines.length > 0) {
              // For files without shebang, comment should be on line 0
              if (lines[0].trim() === expectedComment) {
                  hasCorrectComment = true;
              }
          }
          
          // If we already have the correct comment in the right position, we're done
          if (hasCorrectComment) {
              return false;
          }
          
          // Look for any filename comments in wrong positions that need cleanup
          const filteredLines = lines.filter((line, index) => {
              if (index < startIndex) return true; // Keep shebang
              
              const trimmedLine = line.trim();
              // Check if this line is a filename comment
              if (trimmedLine.startsWith('// ') && 
                  trimmedLine.toLowerCase().endsWith(actualFilename.toLowerCase())) {
                  
                  // If it's in the wrong position but has correct case, we still need to move it
                  if (trimmedLine === expectedComment) {
                      needsUpdate = true; // Need to move to correct position
                      return false; // Remove from current position
                  } else {
                      // Wrong case AND wrong position
                      needsUpdate = true;
                      return false;
                  }
              }
              return true;
          });
          
          // If no changes needed and no comment exists, we need to add one
          if (!needsUpdate && !hasCorrectComment) {
              needsUpdate = true;
          }
          
          if (!needsUpdate) {
              return false;
          }
          
          // Insert the comment at the correct position
          if (hasShebang) {
              filteredLines.splice(1, 0, expectedComment);
          } else {
              filteredLines.unshift(expectedComment);
          }
          
          // Write back to file
          fs.writeFileSync(absolutePath, filteredLines.join('\n'));
          return true;
          
      } catch (error) {
          console.error(`Error updating file header for ${filePath}:`, error);
          return false;
      }
  }

  // ✅ Add a cache to prevent repeated processing of the same files
  private static processedFiles = new Set<string>();

  static batchUpdateHeaders(directory: string, extensions: string[] = ['.ts', '.tsx', '.js', '.jsx']): void {
      const files = this.getFilesByExtension(directory, extensions);
      
      // Filter out already processed files in this session
      const filesToProcess = files.filter(file => !this.processedFiles.has(file));
      
      console.log(`📝 Updating file headers for ${filesToProcess.length} files (${files.length - filesToProcess.length} already processed)...`);
      
      let updatedCount = 0;
      filesToProcess.forEach(file => {
          if (this.ensureFilenameComment(file)) {
              console.log(`✅ Updated: ${file}`);
              updatedCount++;
          }
          this.processedFiles.add(file); // Mark as processed
      });
      
      console.log(`🎉 Updated ${updatedCount} out of ${filesToProcess.length} files`);
  }

    // Optional: Method to clear cache if needed
    static clearCache(): void {
        this.processedFiles.clear();
    }

  // Add a method to fix existing case issues
  static fixFilenameCaseComments(directory: string, extensions: string[] = ['.ts', '.tsx', '.js', '.jsx']): void {
    const files = this.getFilesByExtension(directory, extensions);
    
    console.log(`🔧 Fixing filename comment case for ${files.length} files...`);
    
    let fixedCount = 0;
    files.forEach(file => {
      if (this.ensureFilenameComment(file)) {
        console.log(`✅ Fixed case: ${file}`);
        fixedCount++;
      }
    });
    
    console.log(`🎉 Fixed ${fixedCount} out of ${files.length} files`);
  }


  private static getFilesByExtension(dir: string, extensions: string[]): string[] {
    const files: string[] = [];
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          files.push(...this.getFilesByExtension(fullPath, extensions));
        } else if (extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Could not read directory: ${dir}`, error);
    }
    
    return files;
  }
}