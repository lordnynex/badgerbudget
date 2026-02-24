"use strict";
// Stub so TypeORM can require("better-sqlite3") without installing the native package.
// This app uses sql.js only; better-sqlite3 is never instantiated.
function Database() {
  throw new Error("better-sqlite3 is not used; this app uses sql.js. If you see this, do not use the better-sqlite3 driver.");
}
module.exports = Database;
