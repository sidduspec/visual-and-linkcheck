const config ={
    FAILURE_THRESHOLD: 0.1,
    FAIL_ON_MISSING_BASELINE: false,
    COMPARISION_OPTIONS: {
        threshold: 0.1,
    },
    CYPRESS_SCREENSHOT_OPTIONS:{
        capture: "fullPage",
    },
    NAME_TEMPLATE: "[givenName]"
}

module.exports = config;