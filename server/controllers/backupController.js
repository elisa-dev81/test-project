const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Create backup of database and files
exports.createBackup = async (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(process.cwd(), 'backups');
    const backupFileName = `backup-${timestamp}.zip`;
    const backupPath = path.join(backupDir, backupFileName);
    
    // Ensure backup directory exists
    await fs.mkdir(backupDir, { recursive: true });
    
    // Create archive
    const output = require('fs').createWriteStream(backupPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });
    
    output.on('close', () => {
      console.log(archive.pointer() + ' total bytes');
      console.log('Backup has been finalized and the output file descriptor has closed.');
    });
    
    archive.on('error', (err) => {
      throw err;
    });
    
    archive.pipe(output);
    
    // Add database dump if using SQLite
    const dbPath = process.env.DB_STORAGE || './database.sqlite';
    if (await fileExists(dbPath)) {
      archive.file(dbPath, { name: 'database.sqlite' });
    }
    
    // Add uploads directory if exists
    const uploadsPath = path.join(process.cwd(), 'uploads');
    if (await directoryExists(uploadsPath)) {
      archive.directory(uploadsPath, 'uploads');
    }
    
    // Add config files
    const configFiles = ['.env.example', 'package.json'];
    for (const file of configFiles) {
      const filePath = path.join(process.cwd(), file);
      if (await fileExists(filePath)) {
        archive.file(filePath, { name: file });
      }
    }
    
    await archive.finalize();
    
    // Wait for the archive to be written
    await new Promise((resolve, reject) => {
      output.on('close', resolve);
      output.on('error', reject);
    });
    
    // Get backup info
    const stats = await fs.stat(backupPath);
    
    res.json({
      success: true,
      message: 'پشتیبان با موفقیت ایجاد شد',
      data: {
        filename: backupFileName,
        size: stats.size,
        created_at: new Date().toISOString(),
        path: backupPath
      }
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در ایجاد پشتیبان',
      error: error.message
    });
  }
};

// Download backup file
exports.downloadBackup = async (req, res) => {
  try {
    const { filename } = req.params;
    const backupPath = path.join(process.cwd(), 'backups', filename);
    
    // Check if file exists
    if (!(await fileExists(backupPath))) {
      return res.status(404).json({
        success: false,
        message: 'فایل پشتیبان یافت نشد'
      });
    }
    
    // Set headers for download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Stream the file
    const fileStream = require('fs').createReadStream(backupPath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading backup:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دانلود پشتیبان',
      error: error.message
    });
  }
};

// List all backup files
exports.listBackups = async (req, res) => {
  try {
    const backupDir = path.join(process.cwd(), 'backups');
    
    // Check if backup directory exists
    if (!(await directoryExists(backupDir))) {
      return res.json({
        success: true,
        data: [],
        message: 'هیچ پشتیبانی یافت نشد'
      });
    }
    
    const files = await fs.readdir(backupDir);
    const backupFiles = files.filter(file => file.endsWith('.zip'));
    
    const backups = await Promise.all(
      backupFiles.map(async (file) => {
        const filePath = path.join(backupDir, file);
        const stats = await fs.stat(filePath);
        
        return {
          filename: file,
          size: stats.size,
          created_at: stats.birthtime,
          modified_at: stats.mtime
        };
      })
    );
    
    // Sort by creation date (newest first)
    backups.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    res.json({
      success: true,
      data: backups,
      count: backups.length
    });
  } catch (error) {
    console.error('Error listing backups:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت لیست پشتیبان‌ها',
      error: error.message
    });
  }
};

// Delete backup file
exports.deleteBackup = async (req, res) => {
  try {
    const { filename } = req.params;
    const backupPath = path.join(process.cwd(), 'backups', filename);
    
    // Check if file exists
    if (!(await fileExists(backupPath))) {
      return res.status(404).json({
        success: false,
        message: 'فایل پشتیبان یافت نشد'
      });
    }
    
    await fs.unlink(backupPath);
    
    res.json({
      success: true,
      message: 'پشتیبان با موفقیت حذف شد'
    });
  } catch (error) {
    console.error('Error deleting backup:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در حذف پشتیبان',
      error: error.message
    });
  }
};

// Delete old backups (older than specified days)
exports.cleanOldBackups = async (req, res) => {
  try {
    const { days = 30 } = req.body;
    const backupDir = path.join(process.cwd(), 'backups');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    
    if (!(await directoryExists(backupDir))) {
      return res.json({
        success: true,
        message: 'هیچ پشتیبانی برای حذف یافت نشد',
        deleted_count: 0
      });
    }
    
    const files = await fs.readdir(backupDir);
    const backupFiles = files.filter(file => file.endsWith('.zip'));
    
    let deletedCount = 0;
    
    for (const file of backupFiles) {
      const filePath = path.join(backupDir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.birthtime < cutoffDate) {
        await fs.unlink(filePath);
        deletedCount++;
        console.log(`Deleted old backup: ${file}`);
      }
    }
    
    res.json({
      success: true,
      message: `${deletedCount} پشتیبان قدیمی حذف شد`,
      deleted_count: deletedCount
    });
  } catch (error) {
    console.error('Error cleaning old backups:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در حذف پشتیبان‌های قدیمی',
      error: error.message
    });
  }
};

// Restore from backup (placeholder - would need more complex logic)
exports.restoreBackup = async (req, res) => {
  try {
    const { filename } = req.body;
    
    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'نام فایل پشتیبان الزامی است'
      });
    }
    
    const backupPath = path.join(process.cwd(), 'backups', filename);
    
    // Check if file exists
    if (!(await fileExists(backupPath))) {
      return res.status(404).json({
        success: false,
        message: 'فایل پشتیبان یافت نشد'
      });
    }
    
    // This is a placeholder - in a real scenario, you would:
    // 1. Extract the backup file
    // 2. Stop the application temporarily
    // 3. Replace database and files
    // 4. Restart the application
    
    res.json({
      success: true,
      message: 'بازیابی از پشتیبان با موفقیت انجام شد (نسخه نمایشی)',
      warning: 'این عملیات در نسخه نمایشی شبیه‌سازی شده است'
    });
  } catch (error) {
    console.error('Error restoring backup:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در بازیابی از پشتیبان',
      error: error.message
    });
  }
};

// Get backup status and info
exports.getBackupStatus = async (req, res) => {
  try {
    const backupDir = path.join(process.cwd(), 'backups');
    
    let latestBackup = null;
    let totalBackups = 0;
    let totalSize = 0;
    
    if (await directoryExists(backupDir)) {
      const files = await fs.readdir(backupDir);
      const backupFiles = files.filter(file => file.endsWith('.zip'));
      totalBackups = backupFiles.length;
      
      if (backupFiles.length > 0) {
        // Find latest backup
        let latestFile = null;
        let latestTime = 0;
        
        for (const file of backupFiles) {
          const filePath = path.join(backupDir, file);
          const stats = await fs.stat(filePath);
          totalSize += stats.size;
          
          if (stats.birthtime.getTime() > latestTime) {
            latestTime = stats.birthtime.getTime();
            latestFile = {
              filename: file,
              size: stats.size,
              created_at: stats.birthtime
            };
          }
        }
        
        latestBackup = latestFile;
      }
    }
    
    res.json({
      success: true,
      data: {
        latest_backup: latestBackup,
        total_backups: totalBackups,
        total_size: totalSize,
        backup_directory: backupDir
      }
    });
  } catch (error) {
    console.error('Error getting backup status:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت وضعیت پشتیبان‌گیری',
      error: error.message
    });
  }
};

// Helper functions
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function directoryExists(dirPath) {
  try {
    const stats = await fs.stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}
