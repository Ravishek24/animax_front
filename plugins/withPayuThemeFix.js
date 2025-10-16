const { withAndroidManifest } = require('@expo/config-plugins');

const withPayuThemeFix = (config) => {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;
    
    // Find the application element
    const application = androidManifest.manifest.application[0];
    
    // Add tools:replace attribute to handle PayU theme conflict
    if (application && application.$) {
      application.$['tools:replace'] = 'android:theme';
    }
    
    return config;
  });
};

module.exports = withPayuThemeFix;
