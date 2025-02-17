const { defineConfig } = require("cypress");
const fs = require("fs-extra"); // ✅ Ensure we use fs-extra for recursive folder creation
const path = require("path");
const { exec } = require("child_process");
const getCompareSnapshotsPlugin = require("cypress-image-diff-js/plugin");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://drupal.apollohospitals.com",
    setupNodeEvents(on, config) {
      getCompareSnapshotsPlugin(on, config);

      on("task", {
        runLinkChecker() {
          return new Promise((resolve, reject) => {
            const baseUrl = config.baseUrl; // ✅ Correct way to get baseUrl
            const reportsDir = path.resolve("cypress/reports"); // ✅ Report directory
            const reportPath = path.join(reportsDir, `link-checks.json`); // ✅ Report file path

            // ✅ Ensure the reports directory exists
            if (!fs.existsSync(reportsDir)) {
              fs.mkdirSync(reportsDir, { recursive: true }); // ✅ Create directory recursively
              console.log(`✅ Created reports directory: ${reportsDir}`);
            }

            // ✅ Command to run linkinator
            const linkCheckCommand = `npx linkinator ${baseUrl} --format json`;
            console.log(`Running link checker for: ${baseUrl}`);

            exec(linkCheckCommand, (error, stdout, stderr) => {
              if (error) {
                console.error(`❌ Error during link check: ${stderr}`);
                return reject(error);
              }
              console.log(stdout);
              console.log(`✅ Link checker completed successfully.`);

              try {
                const report = JSON.parse(stdout);
                if (!report.passed) {
                  console.error("❌ Broken links detected. Failing the test.");
                  fs.writeFileSync(reportPath, stdout);
                  return reject(new Error("Link checker failed. Broken links detected."));
                }

                fs.writeFileSync(reportPath, stdout);
                console.log(`✅ Link checker report saved to: ${reportPath}`);
                resolve(`Report generated at: ${reportPath}`);
              } catch (parseError) {
                console.error(`❌ Error parsing link checker output: ${parseError}`);
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
