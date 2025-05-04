const fs = require('fs');
const csv = require('csv-parser');

// Match full path prefixes
const EXCLUDED_PATHS = ['/files/', '/themes/', '/modules/', '/sites/', '/content/'];
const EXCLUDED_EXTENSIONS = ['.ico', '.js', '.css', '.png', '.jpg', '.svg', '.webp', '.woff', '.ttf'];

const hasInvalidExtension = (url) =>
  EXCLUDED_EXTENSIONS.some(ext => url.toLowerCase().endsWith(ext));

function filterUrlsFromCSV(csvPath, baseUrl ) {
  return new Promise((resolve) => {
    const filtered = [];

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        const url = row.url?.trim();
        const status = row.status?.trim();

        if (!url) return;

        const isSameDomain = url.startsWith(baseUrl);
        const path = new URL(url).pathname;

        const isValid = (
          status === '200' &&
          isSameDomain &&
          !EXCLUDED_PATHS.some(p => path.startsWith(p)) &&
          !hasInvalidExtension(url)
        );

        if (isValid) {
          const name = url
            .replace(/^https?:\/\//, '')
            .replace(/[^a-zA-Z0-9]/g, '_');
          filtered.push({ name, url });
        }
      })
      .on('end', () => resolve(filtered));
  });
}

module.exports = { filterUrlsFromCSV };
