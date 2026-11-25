const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withCMakeVersion(config) {
  return withAppBuildGradle(config, (config) => {
    const gradle = config.modResults.contents;
    if (!gradle.includes('externalNativeBuild') && gradle.includes('ndkVersion')) {
      config.modResults.contents = gradle.replace(
        'ndkVersion rootProject.ext.ndkVersion',
        'ndkVersion rootProject.ext.ndkVersion\n\n    externalNativeBuild {\n        cmake {\n            version "4.1.2"\n        }\n    }'
      );
    }
    return config;
  });
};
