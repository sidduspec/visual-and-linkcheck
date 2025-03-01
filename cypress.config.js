const { defineConfig } = require("cypress");
const fs = require("fs-extra"); // Ensure we use fs-extra for recursive folder creation
const path = require("path");
const { exec } = require("child_process");
const getCompareSnapshotsPlugin = require("cypress-image-diff-js/plugin");
const { parse } = require("json2csv");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://www.apollohospitals.com/",
    specPattern: ["cypress/e2e/**/*.js"],
    setupNodeEvents(on, config) {
      getCompareSnapshotsPlugin(on, config);

      on("task", {
        runLinkChecker() {
          return new Promise((resolve, reject) => {
            const baseUrl = config.baseUrl; // Correct way to get baseUrl
            const reportsDir = path.resolve("cypress/reports"); // Report directory
            const jsonReportPath  = path.join(reportsDir, `link-checks.json`); // Report file path
            const csvReportPath = path.join(reportsDir, "link-checks.csv");

            // Ensure the reports directory exists
            if (!fs.existsSync(reportsDir)) {
              fs.mkdirSync(reportsDir, { recursive: true }); // Create directory recursively
              console.log(`Created reports directory: ${reportsDir}`);
            }

            // Command to run linkinator
            const linkCheckCommand = `npx linkinator ${baseUrl} --format json`;
            console.log(`Running link checker for: ${baseUrl}`);

            exec(linkCheckCommand, (error, stdout, stderr) => {
              if (error) {
                console.error(`Error during link check: ${stderr}`);
                return reject(error);
              }
              console.log(stdout);
              console.log(`Link checker completed successfully.`);

              try {
                const report = JSON.parse(stdout);
                fs.writeFileSync(jsonReportPath, stdout); // Save JSON report
                // Extract links and convert to CSV
                if (report.links) {
                  const csvData = report.links
                    .map(
                      ({ url, status, state }) => `${url},${status},${state}`
                    )
                    .join("\n");
                  const csvHeader = "url,status,state\n";
                  fs.writeFileSync(csvReportPath, csvHeader + csvData, "utf8");
                  console.log(`CSV report saved to: ${csvReportPath}`);
                }

                resolve(
                  `Report generated at: ${jsonReportPath} & CSV at: ${csvReportPath}`
                );
              } catch (parseError) {
                console.error(
                  `Error parsing link checker output: ${parseError}`
                );
                reject(parseError);
              }
            });
          });
        },
      });

      return config;
    },
  },
});
