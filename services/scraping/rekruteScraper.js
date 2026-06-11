// services/scraping/rekruteScraper.js
const puppeteer = require('puppeteer');
const { v4: uuidv4 } = require('uuid');

class ReKruteScraper {
  constructor() {
    this.baseUrl = 'https://www.rekrute.com';
  }

  async scrapeJobs(filters = {}) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Construire l'URL avec les filtres
    let url = `${this.baseUrl}/offres.html`;
    const params = new URLSearchParams();
    if (filters.keyword) params.append('keyword', filters.keyword);
    if (filters.location) params.append('ville', filters.location);
    if (filters.contractType) params.append('contractType', filters.contractType);
    if (params.toString()) url += `?${params.toString()}`;

    await page.goto(url, { waitUntil: 'networkidle2' });

    // Attendre que les résultats se chargent
    await page.waitForSelector('.job-list-item');

    const jobs = await page.evaluate(() => {
      const jobElements = document.querySelectorAll('.job-list-item');
      return Array.from(jobElements).map(job => ({
        title: job.querySelector('.job-title')?.innerText?.trim() || '',
        company: job.querySelector('.company-name')?.innerText?.trim() || '',
        location: job.querySelector('.job-location')?.innerText?.trim() || '',
        contractType: job.querySelector('.contract-type')?.innerText?.trim() || '',
        url: job.querySelector('a')?.href || '',
        description: job.querySelector('.job-description')?.innerText?.trim() || ''
      }));
    });

    await browser.close();
    return jobs;
  }

  async scrapeJobDetails(jobUrl) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(jobUrl, { waitUntil: 'networkidle2' });

    const details = await page.evaluate(() => ({
      title: document.querySelector('h1')?.innerText?.trim() || '',
      company: document.querySelector('.company-info h2')?.innerText?.trim() || '',
      description: document.querySelector('.job-description')?.innerHTML?.trim() || '',
      requirements: document.querySelector('.job-requirements')?.innerText?.trim() || '',
      experience: document.querySelector('.experience-level')?.innerText?.trim() || '',
      education: document.querySelector('.education-level')?.innerText?.trim() || '',
      salary: document.querySelector('.salary')?.innerText?.trim() || ''
    }));

    await browser.close();
    return details;
  }
}

module.exports = new ReKruteScraper();