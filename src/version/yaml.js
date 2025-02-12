const core = require('@actions/core')
const objectPath = require('object-path')
const yaml = require('yaml')

const BaseVersioning = require('./base')
const bumpVersion = require('../helpers/bumpVersion')

module.exports = class Yaml extends BaseVersioning {

  /**
   * Bumps the version in the package.json
   *
   * @param {!string} releaseType - The type of release
   * @return {*}
   */
  bump = async (releaseType) => {
    // Read the file
    const fileContent = this.read()
    const yamlContent = yaml.parse(fileContent) || {}
    this.oldVersion = objectPath.get(yamlContent, this.versionPath, null)


    // Get the new version
    this.newVersion = await bumpVersion(
      releaseType,
      this.oldVersion,
    )

    // Update the file
    if (this.oldVersion) {
      // Get the name of where the version is in
      const versionName = this.versionPath.split('.').pop()

      core.info(`Bumped file "${this.fileLocation}" from "${this.oldVersion}" to "${this.newVersion}"`)

      this.update(
        // We use replace instead of yaml.stringify so we can preserve white spaces and comments
        // Replace if version was used with single quotes
        fileContent.replace(
          `${versionName}: '${this.oldVersion}'`,
          `${versionName}: '${this.newVersion}'`,
        ).replace( // Replace if version was used with double quotes
          `${versionName}: "${this.oldVersion}"`,
          `${versionName}: "${this.newVersion}"`,
        ).replace( // Replace if version was used with no quotes
          `${versionName}: ${this.oldVersion}`,
          `${versionName}: ${this.newVersion}`,
        ),
      )
    } else {
      core.info(`Bumped file "${this.fileLocation}" with version "${this.newVersion}"`)

      // Update the content with the new version
      objectPath.set(yamlContent, this.versionPath, this.newVersion)
      this.update(yaml.stringify(yamlContent))
    }
  }

}
