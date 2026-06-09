import { api } from "./api";

const SCRAPING_SOURCES = [
  { name: "ReKrute", url: "https://www.rekrute.com", selector: ".job-item" },
  {
    name: "Indeed",
    url: "https://www.indeed.ma",
    selector: ".jobsearch-ResultsList",
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/jobs",
    selector: ".jobs-search__results-list",
  },
  {
    name: "EmploiPublic",
    url: "https://www.emploi-public.ma",
    selector: ".offer-item",
  },
  {
    name: "MarocAnnonces",
    url: "https://www.marocannonces.com",
    selector: ".listing-item",
  },
];

export async function scrapeJobsFromUrl(url: string): Promise<any> {
  return api.post("/scraping/scrape", { url });
}

export async function scrapeFromSource(sourceName: string): Promise<any> {
  const source = SCRAPING_SOURCES.find((s) => s.name === sourceName);
  if (!source) throw new Error("Source non trouvée");
  return api.post("/scraping/source", source);
}

export async function getScrapingStatus(): Promise<any> {
  return api.get("/scraping/status");
}

export async function startAutomatedScraping(): Promise<void> {
  return api.post("/scraping/start");
}

export async function stopAutomatedScraping(): Promise<void> {
  return api.post("/scraping/stop");
}

export { SCRAPING_SOURCES };

