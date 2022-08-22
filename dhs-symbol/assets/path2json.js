/**
 * Copyright (c) Dignitas Technologies, LLC
 *
 * This file and its contents are governed by one or more distribution and
 * copyright statements as described in the LICENSE.txt file distributed with
 * this work.
 */
let fs = require('fs');
let path = require('path');

const root = (process.argv[2]);
const logAlphabet = Math.log(26);

function dirTree(dirType, filename, nodeId, fullId) {

  let stats = fs.lstatSync(filename);
  let info = {};

  if (stats.isDirectory()) {
    if (dirType === "root") { // Process root directory

      // Add the metadata
      info.symbologyName = "";
      info.version = "";

      // init the primary dirs
      let framesDir = filename + '/frames';
      let iconsDir = filename + '/icons';
      let decsDir = filename + '/decorators';

      // Process frames directory
      if (fs.existsSync(framesDir)) {
        info.frames = fs.readdirSync(framesDir).map(function (child) {
          return dirTree("frames", framesDir + '/' + child);
        });
      }

      // Process icons directory
      if (fs.existsSync(iconsDir)) {
        let cats = fs.readdirSync(iconsDir);
        info.catIdLength = Math.ceil(Math.log(cats.length) / logAlphabet);
        // Create a category Id array using catIdLength for size
        let idArray = [64]; // First one starts at A - 1;
        for (i = 1; i < info.catIdLength; i++) {
          idArray.push(65); // A
        }
        // Loop through the categories
        info.categories = cats.map(function (child) {
          // Increment the category id
          for (i = 0; i < idArray.length; i++) {
            if (idArray[i] >= 90) { // Z has been reached
              // wrap current char back to A and continue, which will increment next char
              idArray[i] = 65;
            } else {
              // increment current char and break so that next char doesn't increment
              idArray[i]++;
              break;
            }
          }
          // Get the category id string
          let catId = "";
          // Loop through each char code and append it's string representation
          for (i = 0; i < idArray.length; i++) {
            catId = String.fromCharCode(idArray[i]) + catId;
          }
          return dirTree("category", iconsDir + '/' + child, catId, catId);
        });
      }

      // Process decorators directory
      if (fs.existsSync(decsDir)) {
        info.decorators = fs.readdirSync(decsDir).map(function (child) {
          return dirTree("decorators", decsDir + '/' + child);
        });
      }

    } else if (dirType === "category") { // Process a category directory

      // Add metadata
      info.catName = path.basename(filename);
      info.catDesc = path.basename(filename);
      info.catId = nodeId;
      // info.frameName = "square";

      // Get children
      let scats = fs.readdirSync(filename);

      let subCatCount = 0;
      let iconCount = 0;
      scats.map(function (child) {
        let stats = fs.lstatSync(filename + '/' + child);
        if (stats.isDirectory()) {
          subCatCount++;
        } else {
          iconCount++;
        }
      });

      if (subCatCount > 0) {
        // Calculate id length
        info.subcatIdLength = Math.ceil(Math.log(subCatCount) / logAlphabet);
        info.subcatIdLength = info.subcatIdLength === 0 ? 1 : info.subcatIdLength;
        // Create a category Id array using catIdLength for size
        let idArray = [64]; // First one starts at A - 1;
        for (i = 1; i < info.subcatIdLength; i++) {
          idArray.push(65); // A
        }
        // Process the subcategories
        info.subcategories = scats.map(function (child) {
          // Increment the category id
          for (i = 0; i < idArray.length; i++) {
            if (idArray[i] >= 90) { // Z has been reached
              // wrap current char back to A and continue, which will increment next char
              idArray[i] = 65;
            } else {
              // increment current char and break so that next char doesn't increment
              idArray[i]++;
              break;
            }
          }
          // Get the category id string
          let childCatId = "";
          // Loop through each char code and append it's string representation
          for (i = 0; i < idArray.length; i++) {
            childCatId = String.fromCharCode(idArray[i]) + childCatId;
          }
          let childFullCatId = fullId + childCatId;
          return dirTree("category", filename + '/' + child, childCatId, childFullCatId);
        });
        // Filter out empty ones (that were icon files, not subcat dirs)
        info.subcategories = info.subcategories.filter(value => Object.keys(value).length !== 0);
        // Remove unused properties
        if (info.subcategories.length <= 0) {
          delete (info.subcategories);
          delete (info.subcatIdLength);
        }
      } else {
        // Calculate id length
        info.iconIdLength = Math.ceil(Math.log(iconCount) / logAlphabet);
        // Create an icon Id array using iconIdLength for size
        let idArray = [64]; // First one starts at A - 1;
        for (i = 1; i < info.iconIdLength; i++) {
          idArray.push(65); // A
        }
        // Process the icons
        info.icons = scats.map(function (child) {
          // Increment the category id
          for (i = 0; i < idArray.length; i++) {
            if (idArray[i] >= 90) { // Z has been reached
              // wrap current char back to A and continue, which will increment next char
              idArray[i] = 65;
            } else {
              // increment current char and break so that next char doesn't increment
              idArray[i]++;
              break;
            }
          }
          // Get the icon id string
          let iconId = "";
          // Loop through each char code and append it's string representation
          for (i = 0; i < idArray.length; i++) {
            iconId = String.fromCharCode(idArray[i]) + iconId;
          }
          let fullIconId = fullId + iconId;
          return dirTree("icons", filename + '/' + child, iconId, fullIconId);
        });
        // Filter out empty ones (that were subcat dirs, not icon files)
        info.icons = info.icons.filter(value => Object.keys(value).length !== 0);
        // Remove unused properties
        if (info.icons.length <= 0) {
          delete (info.icons);
          delete (info.iconIdLength);
        }
      }
    } else if (dirType === "frames") {
      // Don't nest
    } else if (dirType === "decorators") {
      // Don't nest
    }
  } else {
    // Assuming it's a file. In real life it could be a symlink or something else!
    if (dirType === "frames") {
      info.frameName = path.basename(filename).replace("frame-", "").replace("\.svg", "");
    } else if (dirType === "icons") {
      info.iconName = path.basename(filename).replace("icon-", "").replace("\.svg", "");
      info.iconDesc = fullId;
      info.iconId = nodeId
    } else if (dirType === "decorators") {
      info.decName = path.basename(filename).replace("dec-", "").replace("\.svg", "");
    }
  }

  return info;
}

if (require.main === module) {
  console.log(JSON.stringify(dirTree("root", root)));
}
