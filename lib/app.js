/* eslint-disable no-console */
import express from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import logger from 'morgan';
import routes from './routes';
import config from './config/config';
import db from './models/index.js';
import path from 'path';
import fs from 'fs';

const cleanupOrphanFiles = async () => {
  try {
    const uploadDir = path.join(process.cwd(), 'uploads', 'materiales');
    
    if (!fs.existsSync(uploadDir)) {
      return;
    }

    const files = fs.readdirSync(uploadDir);
    
    if (files.length === 0) {
      return;
    }

    const materials = await db.Material.findAll({
      where: { tipo: 'file' },
      attributes: ['url']
    });

    const storedUrls = materials
      .map(m => m.url)
      .filter(Boolean)
      .map(url => path.basename(url));

    const orphanFiles = files.filter(file => !storedUrls.includes(file));

    if (orphanFiles.length > 0) {
      console.log(`Found ${orphanFiles.length} orphan files, cleaning up...`);
      orphanFiles.forEach(file => {
        const filePath = path.join(uploadDir, file);
        fs.unlinkSync(filePath);
        console.log(`Deleted orphan file: ${file}`);
      });
      console.log('Orphan file cleanup completed');
    }
  } catch (error) {
    console.error('Error during orphan file cleanup:', error.message);
  }
};

cleanupOrphanFiles();

const app = express();

/**
 * Get port from environment and store in Express.
 */

app.set('port', config.port || '3001');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet());
app.use(cors());
app.use(compression());
app.use('/uploads', express.static('uploads'));

app.use('/', routes);

module.exports = app;
