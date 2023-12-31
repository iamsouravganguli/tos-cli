#!/usr/bin/env node
/**
 * * Tos-Cli
 * Author: Sourav Ganguli
 * Email: mysganguli@gmail.com
 * (c) 2023 Sourav Ganguli. All rights reserved.
 */

const {ProjectGenerator} = require('./generator/ProjectGenerator.js')

/**
 * Represents a project generator.
 * @class
 */

const projectGenerator = new ProjectGenerator();

/**
 * Generates a project.
 * @memberof ProjectGenerator
 * @method
 */
projectGenerator.generateProject()
