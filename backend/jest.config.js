export default {
    // Automatically clear mock calls and instances between every test
    clearMocks: true,

    // Indicates whether the coverage information should be collected while executing the test
    collectCoverage: true,

    // The directory where Jest should output its coverage files
    coverageDirectory: "coverage",

    // A list of paths to directories that Jest should use to search for files in
    roots: [
        "<rootDir>/src"
    ],

    // The test environment that will be used for testing
    testEnvironment: "node",

    // Tell Jest to transform .js files using babel-jest
    transform: {
        "^.+\\.js$": "babel-jest",
    },

    // Need this to support ES Modules
    transformIgnorePatterns: [
        "/node_modules/"
    ],

    setupFilesAfterEnv: ['./src/tests/setup.js'],

    // This tells Jest to use the default (console) reporter AND the html reporter
    reporters: [
        "default",
        [
            "jest-html-reporters",
            {
                // The path to output the report
                publicPath: "./test-report",
                // The filename of the report
                filename: "report.html",
                // Automatically open the report in a browser after tests run
                openReport: false,
                // A title for your report
                pageTitle: "CommEff Backend API Test Report"
            }
        ]
    ]
};