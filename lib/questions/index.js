/**
 * * Own-Cli
 * Author: Sourav Ganguli
 * Email: mysganguli@gmail.com
 * (c) 2023 Sourav Ganguli. All rights reserved.
 */

const fs = require("fs");
const path = require("path");

/**
 * Generate an array of questions for generating a project.
 * @param {string[]} availableTemplates - The available choices for the project template.
 * @param {string} language - The selected language ("JavaScript" or "TypeScript").
 * @returns {Object[]} An array of questions.
 */
function generateProjectQuestions(availableTemplates, language) {
    /**
     * Validates whether the input string is a valid project or package name.
     * @param {string} input - The input string to validate.
     * @returns {boolean|string} Returns true if the input is valid, otherwise returns an error message.
     */
    function validateInput(input) {
        if (/^([A-Za-z\-\\_\d])+$/.test(input)) {
            return true;
        } else {
            return "Name may only include letters, numbers, underscores, and dashes.";
        }
    }

    /**
     * @typedef {Object} ProjectQuestion
     * @property {string} name - The name of the question.
     * @property {string} type - The type of the question.
     * @property {string} message - The message to display for the question.
     * @property {Function} validate - The validation function for the input.
     * @property {string} [default] - The default value for the question.
     * @property {string[]} [choices] - The choices for the question.
     * @property {boolean} [checked] - The checked status for the choice (for checkbox type).
     */

    /** @type {ProjectQuestion[]} */
    const questions = [
        {
            name: "project-name",
            type: "input",
            message: "Enter the project name:",
            validate: validateInput,
        },
        {
            name: "package-name",
            type: "input",
            message: "Enter the package name:",
            validate: validateInput,
        },
        {
            name: "version",
            type: "input",
            message: "Enter the version:",
            default: "1.0.0",
        },
        {
            name: "description",
            type: "input",
            message: "Enter a description:",
        },
        {
            name: "author",
            type: "input",
            message: "Enter the author:",
        },
        {
            name: "license",
            type: "input",
            message: "Enter the license:",
            default: "MIT",
        },
        {
            name: "project-choice",
            type: "list",
            message: "Choose a project template:",
            choices: availableTemplates,
        },
        {
            name: "package-manager",
            type: "list",
            message: "Choose a package manager:",
            choices: ["npm", "yarn", "pnpm"],
            default: "npm",
        },
        {
            name: "library-choice",
            type: "checkbox",
            message: "Select additional libraries to install:",
            choices: [
                { name: "Library A", value: "library-a", checked: false },
                { name: "Library B", value: "library-b", checked: false },
                { name: "Library C", value: "library-c", checked: false },
            ],
        },
    ];

    return questions;
}

/**
 * Generates an array of template choices based on the selected language.
 * @param {string} language - The selected language ("JavaScript" or "TypeScript").
 * @returns {string[]} An array of template choices.
 */
function generateTemplateChoices(language) {
    /**
     * Gets the directory path for the templates based on the language.
     * @param {string} lang - The selected language ("JavaScript" or "TypeScript").
     * @returns {string} The directory path for the templates.
     */
    function getTemplatesDir(lang) {
        const languageMappings = {
            JavaScript: "js",
            TypeScript: "ts",
        };
        const languageValue = languageMappings[lang];
        return path.join(__dirname, "../../templates", languageValue.toLowerCase());
    }

    const templatesDir = getTemplatesDir(language);
    return fs.readdirSync(templatesDir);
}

module.exports = {
    generateProjectQuestions,
    generateTemplateChoices,
}