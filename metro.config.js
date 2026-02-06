// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add tflite to asset extensions for TensorFlow Lite models
config.resolver.assetExts.push("tflite");

module.exports = config;
