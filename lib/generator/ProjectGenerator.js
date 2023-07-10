const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");
const util = require("util");
const ncp = require("ncp");
const {exec} = require("child_process");
const {generateProjectQuestions, generateTemplateChoices} = require("../questions/index.js");
const ncpPromise = util.promisify(ncp);
const figlet = require('figlet');
const colors = require('colors');

/**
 * * Tos-Cli
 * Author: Sourav Ganguli
 * Email: mysganguli@gmail.com
 * (c) 2023 Sourav Ganguli. All rights reserved.
 */

/**
 * The Project Generator class is responsible for generating project templates.
 */
class ProjectGenerator {
    /**
     * Constructs an instance of ProjectGenerator.
     */
    constructor() {
        /**
         * The directory path for project templates.
         * @type {string}
         */
        this.templatesDir = path.join(__dirname, "../../templates");
        /**
         * The array of questions for project generation.
         * @type {Object[]}
         */
        this.questions = [];
    }

    /**
     * Generates a new project based on user input.
     * @returns {Promise<void>} A promise that resolves when the project generation is complete.
     */
    async generateProject() {
        try {
            figlet('WELCOME TO TOS-CLI\n', function (err, data) {
                if (err) {
                    console.info('Something went wrong...');
                    console.dir(err);
                    return;
                }
                console.info(data);
            });
            await new Promise(resolve => setTimeout(resolve, 1000));
            const infoText = [`${colors.green("Author:")} Sourav Ganguli`, `${colors.green("Github Repo:")} ${"https://github.com/iamsouravganguli/tos-cli"}`, `${colors.green("License:")} MIT\n`]

            infoText.forEach((value) => {
                console.info(value)
            })

            const languageAnswer = await inquirer.prompt([
                /**
                 * @typedef {Object} LanguageAnswer
                 * @property {string} language - The chosen language.
                 */

                /**
                 * @type {LanguageAnswer}
                 */
                {
                    name: "language",
                    type: "list",
                    message: "Choose a language:",
                    choices: ["JavaScript", "TypeScript"],
                },
            ]);
            const language = languageAnswer["language"];

            const availableTemplates = generateTemplateChoices(language);

            this.questions = generateProjectQuestions(availableTemplates, language);

            const answers = await inquirer.prompt(this.questions);

            let projectName = answers["project-name"];
            let isProjectNameValid = false;

            while (!isProjectNameValid) {
                const projectPath = path.join(process.cwd(), projectName);
                if (fs.existsSync(projectPath)) {
                    console.log("The project name already exists. Please choose another name.\n");
                    const newNameAnswer = await inquirer.prompt([
                        /**
                         * @typedef {Object} NewNameAnswer
                         * @property {string} project-name - The new project name.
                         */

                        /**
                         * @type {NewNameAnswer}
                         */
                        {
                            name: "project-name",
                            type: "input",
                            message: "Project name:",
                            validate: function (input) {
                                if (/^([A-Za-z\-\\_\d])+$/.test(input)) return true;
                                else return "Project name may only include letters, numbers, underscores, and dashes.";
                            },
                        },
                    ]);
                    projectName = newNameAnswer["project-name"];
                } else {
                    isProjectNameValid = true;
                }
            }

            const projectChoice = answers["project-choice"];
            const packageName = answers["package-name"];
            const packageManager = answers["package-manager"];
            const version = answers["version"];
            const description = answers["description"];
            const author = answers["author"];
            const license = answers["license"];
            const libraryChoice = answers["library-choice"]
            const templateLanguage = language === "JavaScript" ? "js" : "ts";
            const templatePath = path.join(this.templatesDir, templateLanguage, projectChoice);
            const projectPath = path.join(process.cwd(), projectName);
            console.clear();
            fs.mkdirSync(projectPath, {recursive: true});
            console.log(colors.bgBlue.white(`🔄 ${"Generating project template..."}`));
            await this.copyTemplateFiles(templatePath, projectPath);


            console.log(colors.bgGreen.white(`✅ ${"Project template generated successfully!\n"}`));

            await this.updateProject(projectPath, packageName, version, description, author, license);

            console.log(colors.bgBlue.white(`🔄 ${"Downloads dependencies..."}`));
            await this.installDependencies(projectPath, packageManager);

            console.log(colors.bgBlue.white(`🔄 ${"Downloads Packages..."}`));
            await this.installPackages(projectPath, packageManager, libraryChoice)
            const infoTextCompleted = [colors.bgGreen.white(`\n✅  ${"Project setup is complete!"}`), `\nYour ${projectName} project has been generated in the following directory: ${colors.bgCyan.white(projectPath)}`, "To get started, navigate to the project directory and run the following command:\n", `cd ${projectName}`, " npm start",]

            infoTextCompleted.forEach((value) => {
                console.info(value);
            })
            await new Promise(resolve => setTimeout(resolve, 1000));
            figlet('HAPPY CODING!', function (err, data) {
                if (err) {
                    console.info('Something went wrong...');
                    console.dir(err);
                    return;
                }
                console.info(data);
            });


        } catch (error) {
            console.error("An error occurred while generating the project template:", error);
        }
    }

    /**
     * Copies template files to the project directory.
     * @param {string} templatePath - The path to the template directory.
     * @param {string} projectPath - The path to the project directory.
     * @returns {Promise<void>} A promise that resolves when the template files are copied.
     */
    async copyTemplateFiles(templatePath, projectPath) {
        return new Promise((resolve, reject) => {
            ncpPromise(templatePath, projectPath, {
                filter: (src) => {
                    const basename = path.basename(src);
                    return basename !== "node_modules";
                },
            })
                .then(() => {
                    resolve();
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    /**
     * Updates the project with user-defined package details.
     * @param {string} projectPath - The path to the project directory.
     * @param {string} packageName - The name of the package.
     * @param {string} version - The version of the package.
     * @param {string} description - The description of the package.
     * @param {string} author - The author of the package.
     * @param {string} license - The license of the package.
     * @returns {Promise<void>} A promise that resolves when the project is updated.
     */
    async updateProject(projectPath, packageName, version, description, author, license) {
        const packageJsonPath = path.join(projectPath, "package.json");

        try {
            const packageJson = require(packageJsonPath);

            packageJson.name = packageName;
            packageJson.version = version;
            packageJson.description = description;
            packageJson.author = author;
            packageJson.license = license;

            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

            console.log(colors.bgGreen.white(`✅ ${"Package.json created successfully!"}`));
        } catch (error) {
            console.error("An error occurred while updating the project:", error);
        }
    }

    /**
     * Installs project dependencies using the specified package manager.
     * @param {string} projectPath - The path to the project directory.
     * @param {string} packageManager - The package manager to use (e.g., "npm", "yarn", "pnpm").
     * @returns {Promise<void>} A promise that resolves when the dependencies are installed.
     */
    async installDependencies(projectPath, packageManager) {
        return new Promise((resolve, reject) => {
            console.log(colors.bgBlue.white(`🔄 ${"Installing dependencies..."}`));

            let installCommand;
            if (packageManager === "yarn") {
                installCommand = "yarn add";
            } else if (packageManager === "pnpm") {
                installCommand = "pnpm install";
            } else {
                installCommand = "npm install";
            }

            const childProcess = exec(installCommand, {cwd: projectPath});

            childProcess.on("close", (code) => {
                if (code === 0) {
                    console.log(colors.bgGreen.white(`✅ ${"Dependencies installed successfully!\n"}`));
                    resolve();
                } else {
                    reject(new Error(colors.bgRed.white(`❌Failed to install dependencies. Exit code: ${code}`)));
                }
            });
        });
    }

    /**
     * Installs project dependencies using the specified package manager.
     * @param {string} projectPath - The path to the project directory.
     * @param {string} packageManager - The package manager to use (e.g., "npm", "yarn", "pnpm").
     * @param {string} libraryChoice - The libraryChoice to use (install package from package manager ).
     * @returns {Promise<void>} A promise that resolves when the dependencies are installed.
     */
    async installPackages(projectPath, packageManager, libraryChoice) {
        return new Promise((resolve, reject) => {
            console.log(colors.bgBlue.white(`🔄 ${"Installing Packages..."}`));

            let installCommand;
            if (packageManager === "yarn") {
                installCommand = "yarn add";
            } else if (packageManager === "pnpm") {
                installCommand = "pnpm install";
            } else {
                installCommand = "npm install";
            }

            const childProcess = exec(`${installCommand} ${libraryChoice}`, {cwd: projectPath});

            childProcess.on("close", (code) => {
                if (code === 0) {
                    console.log(colors.bgGreen.white(`✅ ${"Packages installed successfully!"}`));
                    resolve();
                } else {
                    reject(new Error(`Failed to install Packages. Exit code: ${code}`));
                }
            });
        });
    }
}

module.exports = {ProjectGenerator};
