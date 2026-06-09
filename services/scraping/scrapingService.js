// services/scraping/scrapingService.js
const ReKruteScraper = require('./rekruteScraper');
const EmploiMaScraper = require('./emploiMaScraper');
const { pool } = require('../config/database');

class ScrapingService {
  constructor() {
    this.sources = {
      rekrute: ReKruteScraper,
      emploiMa: EmploiMaScraper
    };
  }

  async searchAllSources(filters) {
    const results = {};
    
    for (const [sourceName, scraper] of Object.entries(this.sources)) {
      try {
        console.log(`Scraping from ${sourceName}...`);
        results[sourceName] = await scraper.scrapeJobs(filters);
      } catch (error) {
        console.error(`Error scraping ${sourceName}:`, error);
        results[sourceName] = [];
      }
    }
    
    return this.mergeResults(results);
  }

  mergeResults(results) {
    const allJobs = [];
    for (const source in results) {
      allJobs.push(...results[source].map(job => ({ ...job, source })));
    }
    
    // Supprimer les doublons basés sur le titre + entreprise
    const uniqueJobs = [];
    const seen = new Set();
    for (const job of allJobs) {
      const key = `${job.title}-${job.company}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueJobs.push(job);
      }
    }
    
    return uniqueJobs;
  }

  async saveJobsToDatabase(jobs) {
    const sql = `
      INSERT INTO job_offers 
      (id, title, company, location, contract_type, description, url, source, published_at, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      title = VALUES(title), company = VALUES(company), description = VALUES(description)
    `;

    for (const job of jobs) {
      await pool.execute(sql, [
        job.id || uuidv4(),
        job.title,
        job.company,
        job.location,
        job.contractType,
        job.description,
        job.url,
        job.source,
        job.publishedAt || new Date(),
        true
      ]);
    }
    
    console.log(`Saved ${jobs.length} jobs to database`);
  }

  async startScheduledScraping() {
    // Lancer le scraping toutes les 6 heures
    setInterval(async () => {
      console.log('Starting scheduled scraping...');
      const jobs = await this.searchAllSources({});
      await this.saveJobsToDatabase(jobs);
      console.log('Scheduled scraping completed');
    }, 6 * 60 * 60 * 1000);
  }
}

module.exports = new ScrapingService();