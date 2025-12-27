const { getDefaultConfig: getReactNativeDefaultConfig } = require("@react-native/metro-config");
const { getDefaultConfig: getExpoDefaultConfig } = require("expo/metro-config");
const { mergeConfig } = require("metro-config");
const { withNativeWind } = require("nativewind/metro");

const reactNativeConfig = getReactNativeDefaultConfig(__dirname);
const expoConfig = getExpoDefaultConfig(__dirname);

const config = mergeConfig(reactNativeConfig, expoConfig);

module.exports = withNativeWind(config, { input: "./global.css" });