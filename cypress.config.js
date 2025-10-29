const { defineConfig } = require("cypress");
const fs = require("fs-extra"); // Ensure we use fs-extra for recursive folder creation
const path = require("path");
const { exec } = require("child_process");
const getCompareSnapshotsPlugin = require("cypress-image-diff-js/plugin");
const { filterUrlsFromCSV } = require('./cypress/support/parseLinkReport');
const { generateVisualUrlsJson } = require('./cypress/support/generateVisualTestURLJson');
const https = require("https");
const http = require("http");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://live-masterbond.pantheonsite.io/",
    specPattern: ["cypress/e2e/**/*.js"],
    setupNodeEvents(on, config) {
      getCompareSnapshotsPlugin(on, config);

      on("task", {
        // async runLinkChecker({ mode = "domain", urlsFile = "", baseUrl = "" }) {
        //   const reportsDir = path.resolve("cypress/reports");
        //   if (!fs.existsSync(reportsDir)) {
        //     fs.mkdirSync(reportsDir, { recursive: true });
        //     console.log(`📁 Created reports directory: ${reportsDir}`);
        //   }

        //   const combinedJsonReport = path.join(reportsDir, "link-checks-combined.json");
        //   const combinedCsvReport = path.join(reportsDir, "link-checks-combined.csv");

        //   const runCommand = (cmd) =>
        //     new Promise((resolve, reject) => {
        //       exec(cmd, (err, stdout, stderr) => {
        //         if (err) return reject(stderr || err);
        //         resolve(stdout);
        //       });
        //     });

        //   // ---------------- DOMAIN MODE ----------------
        //   if (mode === "domain") {
        //     if (!baseUrl) throw new Error("❌ baseUrl is required in domain mode.");
        //     console.log(`🌐 Running domain link check for: ${baseUrl}`);

        //     try {
        //       const stdout = await runCommand(`npx linkinator ${baseUrl} --format json`);
        //       const report = JSON.parse(stdout);
        //       const jsonPath = path.join(reportsDir, "link-checks.json");
        //       const csvPath = path.join(reportsDir, "link-checks.csv");

        //       fs.writeFileSync(jsonPath, stdout, "utf8");

        //       if (report.links) {
        //         const csvHeader = "url,status,state\n";
        //         const csvRows = report.links.map(
        //           ({ url, status, state }) => `${url},${status},${state}`
        //         );
        //         fs.writeFileSync(csvPath, csvHeader + csvRows.join("\n"), "utf8");
        //       }

        //       console.log(`✅ Domain crawl complete. Reports saved to ${reportsDir}`);
        //       return `Domain link check completed for ${baseUrl}`;
        //     } catch (err) {
        //       console.error("❌ Link check failed:", err);
        //       throw err;
        //     }
        //   }

        //   // ---------------- URL LIST MODE ----------------
        //   if (mode === "urls") {
        //     if (!urlsFile) throw new Error("❌ urlsFile path is required in urls mode.");

        //     // Resolve the file safely
        //     let urlsFilePath = path.resolve(urlsFile);
        //     if (!fs.existsSync(urlsFilePath)) {
        //       if (fs.existsSync(`${urlsFilePath}.txt`)) {
        //         urlsFilePath = `${urlsFilePath}.txt`;
        //       } else if (fs.existsSync(`${urlsFilePath}.json`)) {
        //         urlsFilePath = `${urlsFilePath}.json`;
        //       } else {
        //         throw new Error(`❌ URLs file not found at: ${urlsFilePath} (.txt or .json)`);
        //       }
        //     }

        //     console.log(`📜 Loading URLs from: ${urlsFilePath}`);
        //     const fileContent = fs.readFileSync(urlsFilePath, "utf8");
        //     const ext = path.extname(urlsFilePath).toLowerCase();

        //     let urls = [];
        //     if (ext === ".json") {
        //       urls = JSON.parse(fileContent);
        //     } else if (ext === ".txt") {
        //       urls = fileContent.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        //     }

        //     console.log(`✅ Found ${urls.length} URLs to check.`);

        //     const results = [];

        //     // Function to check one URL using HEAD or GET request
        //     const checkUrl = (url) => {
        //       return new Promise((resolve) => {
        //         const lib = url.startsWith("https") ? https : http;
        //         const req = lib.request(
        //           url,
        //           { method: "HEAD", timeout: 10000 },
        //           (res) => {
        //             resolve({ url, status: res.statusCode, state: res.statusCode === 200 ? "OK" : "BROKEN" });
        //           }
        //         );
        //         req.on("error", () => resolve({ url, status: 0, state: "ERROR" }));
        //         req.on("timeout", () => {
        //           req.destroy();
        //           resolve({ url, status: 0, state: "TIMEOUT" });
        //         });
        //         req.end();
        //       });
        //     };

        //     // Sequentially check all URLs
        //     for (const url of urls) {
        //       console.log(`🔗 Checking: ${url}`);
        //       const result = await checkUrl(url);
        //       console.log(`   ↳ ${result.status} ${result.state}`);
        //       results.push(result);
        //     }

        //     // Write reports
        //     fs.writeFileSync(combinedJsonReport, JSON.stringify(results, null, 2), "utf8");
        //     const csvHeader = "url,status,state\n";
        //     const csvRows = results.map((r) => `${r.url},${r.status},${r.state}`).join("\n");
        //     fs.writeFileSync(combinedCsvReport, csvHeader + csvRows, "utf8");

        //     console.log(`📊 Combined JSON → ${combinedJsonReport}`);
        //     console.log(`📊 Combined CSV  → ${combinedCsvReport}`);

        //     return `✅ Checked ${results.length} URLs individually.`;
        //   }

        //   throw new Error(`❌ Invalid mode: ${mode}`);
        // },
        async runLinkChecker({ mode = "domain", urlsFile = "", baseUrl = "" }) {
          const reportsDir = path.resolve("cypress/reports");
          if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
            console.log(`📁 Created reports directory: ${reportsDir}`);
          }

          const combinedJsonReport = path.join(reportsDir, "link-checks-combined.json");
          const combinedCsvReport = path.join(reportsDir, "link-checks-combined.csv");

          const runCommand = (cmd) =>
            new Promise((resolve, reject) => {
              exec(cmd, (err, stdout, stderr) => {
                if (err) return reject(stderr || err);
                resolve(stdout);
              });
            });

          // ---------------- DOMAIN MODE ----------------
          if (mode === "domain") {
            if (!baseUrl) throw new Error("❌ baseUrl is required in domain mode.");
            console.log(`🌐 Running domain link check for: ${baseUrl}`);

            try {
              const stdout = await runCommand(`npx linkinator ${baseUrl} --format json`);
              const report = JSON.parse(stdout);
              const jsonPath = path.join(reportsDir, "link-checks.json");
              const csvPath = path.join(reportsDir, "link-checks.csv");

              fs.writeFileSync(jsonPath, stdout, "utf8");

              if (report.links) {
                const csvHeader = "url,status,state\n";
                const csvRows = report.links.map(
                  ({ url, status, state }) => `${url},${status},${state}`
                );
                fs.writeFileSync(csvPath, csvHeader + csvRows.join("\n"), "utf8");
              }

              console.log(`✅ Domain crawl complete. Reports saved to ${reportsDir}`);
              return `Domain link check completed for ${baseUrl}`;
            } catch (err) {
              console.error("❌ Link check failed:", err);
              throw err;
            }
          }

          // ---------------- URL LIST MODE ----------------
          if (mode === "urls") {
            if (!urlsFile) throw new Error("❌ urlsFile path is required in urls mode.");

            // Resolve the file safely
            let urlsFilePath = path.resolve(urlsFile);
            if (!fs.existsSync(urlsFilePath)) {
              if (fs.existsSync(`${urlsFilePath}.txt`)) {
                urlsFilePath = `${urlsFilePath}.txt`;
              } else if (fs.existsSync(`${urlsFilePath}.json`)) {
                urlsFilePath = `${urlsFilePath}.json`;
              } else {
                throw new Error(`❌ URLs file not found at: ${urlsFilePath} (.txt or .json)`);
              }
            }

            console.log(`📜 Loading URLs from: ${urlsFilePath}`);
            const fileContent = fs.readFileSync(urlsFilePath, "utf8");
            const ext = path.extname(urlsFilePath).toLowerCase();

            let urls = [];
            if (ext === ".json") {
              urls = JSON.parse(fileContent);
            } else if (ext === ".txt") {
              urls = fileContent.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
            }

            if (!baseUrl) {
              console.warn("⚠️ baseUrl not provided. Relative paths will be skipped.");
            }

            console.log(`✅ Found ${urls.length} URLs or paths to check.`);

            const results = [];

            // Function to check one URL using HEAD or GET request
            const checkUrl = (url) => {
              return new Promise((resolve) => {
                const lib = url.startsWith("https") ? https : http;
                const req = lib.request(
                  url,
                  { method: "HEAD", timeout: 10000 },
                  (res) => {
                    resolve({ url, status: res.statusCode, state: res.statusCode === 200 ? "OK" : "BROKEN" });
                  }
                );
                req.on("error", () => resolve({ url, status: 0, state: "ERROR" }));
                req.on("timeout", () => {
                  req.destroy();
                  resolve({ url, status: 0, state: "TIMEOUT" });
                });
                req.end();
              });
            };

            // Sequentially check all URLs or paths
            for (const input of urls) {
              // If it’s a relative path, prefix baseUrl
              let finalUrl = input;
              if (!/^https?:\/\//i.test(input)) {
                if (baseUrl) {
                  finalUrl = baseUrl.endsWith("/")
                    ? `${baseUrl}${input.replace(/^\/+/, "")}`
                    : `${baseUrl}/${input.replace(/^\/+/, "")}`;
                } else {
                  console.warn(`⚠️ Skipping relative path (no baseUrl): ${input}`);
                  continue;
                }
              }

              console.log(`🔗 Checking: ${finalUrl}`);
              const result = await checkUrl(finalUrl);
              console.log(`   ↳ ${result.status} ${result.state}`);
              results.push(result);
            }

            // Write reports
            fs.writeFileSync(combinedJsonReport, JSON.stringify(results, null, 2), "utf8");
            const csvHeader = "url,status,state\n";
            const csvRows = results.map((r) => `${r.url},${r.status},${r.state}`).join("\n");
            fs.writeFileSync(combinedCsvReport, csvHeader + csvRows, "utf8");

            console.log(`📊 Combined JSON → ${combinedJsonReport}`);
            console.log(`📊 Combined CSV  → ${combinedCsvReport}`);

            return `✅ Checked ${results.length} URLs or paths individually.`;
          }

          throw new Error(`❌ Invalid mode: ${mode}`);
        },
        getFilteredUrls() {
          const urls = filterUrlsFromCSV('cypress/reports/link-checks.csv', config.baseUrl);
          fs.writeFileSync('cypress/fixtures/visual_test_urls.json', JSON.stringify(urls, null, 2));
          return urls;
        },
        generateVisualTestJson({ csvPath, baseUrl, outputPath }) {
          return generateVisualUrlsJson(csvPath, baseUrl, outputPath).then(() => null);
        }
      });

      return config;
    },
  },
});
