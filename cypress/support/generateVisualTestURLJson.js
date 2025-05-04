const fs = require('fs');
const path = require('path');
const { filterUrlsFromCSV } = require('../support/parseLinkReport'); // adjust path if needed

async function generateVisualUrlsJson(csvPath, baseUrl, outputPath) {
  const filtered = await filterUrlsFromCSV(csvPath, baseUrl);

  const json = {
    pages: {},
  };

  filtered.forEach(({ name, url }) => {
    json.pages[name] = url;
  });

  fs.writeFileSync(outputPath, JSON.stringify(json, null, 2), 'utf-8');
  console.log(`✅ Wrote ${filtered.length} URLs to ${outputPath}`);
}

module.exports = { generateVisualUrlsJson };
