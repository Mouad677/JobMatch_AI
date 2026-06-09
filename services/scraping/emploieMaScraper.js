// services/scraping/emploiMaScraper.js
const axios = require('axios');
const cheerio = require('cheerio');

class EmploiMaScraper {
  async scrapeJobs(filters = {}) {
    const url = `https://www.emploi.ma/recherche-jobs-maroc/${filters.keyword || ''}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const jobs = [];

    $('.job-listing-item').each((i, element) => {
      jobs.push({
        id: uuidv4(),
        title: $(element).find('.job-title').text().trim(),
        company: $(element).find('.company-name').text().trim(),
        location: $(element).find('.location').text().trim(),
        contractType: $(element).find('.contract-type').text().trim(),
        experienceRequired: $(element).find('.experience').text().trim(),
        educationLevel: $(element).find('.education').text().trim(),
        url: $(element).find('a').attr('href'),
        source: 'Emploi.ma',
        publishedAt: new Date(),
        description: $(element).find('.job-description').text().trim()
      });
    });

    return jobs;
  }
}

module.exports = new EmploiMaScraper();