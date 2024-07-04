// cache.js
const NodeCache = require("node-cache");
const sharedCache = new NodeCache();
module.exports = sharedCache;
