let fs = require('fs');
// let path = require('path');

const fileArg = (process.argv[2]);

function parseFile(filename) {

  let stats = fs.lstatSync(filename);
  if (stats.isFile()) {
    try {
      const jsonString = fs.readFileSync(filename);
      const jsonObj = JSON.parse(jsonString);
      if (jsonObj && Array.isArray(jsonObj.categories)) {
        jsonObj.categories.forEach((cat) => {
          if (cat) {
            console.log((cat.catName ? cat.catName : "") + "\;\;\;" +
              (cat.catId ? cat.catId : ""));
            if (Array.isArray(cat.icons)) {
              cat.icons.forEach((icon) => {
                if (icon) {
                  console.log("\;\;" + (icon.iconName ? icon.iconName : "") + "\;" +
                    (icon.iconDesc ? icon.iconDesc : ""));
                }
              });
            } else if (Array.isArray(cat.subcategories)) {
              cat.subcategories.forEach((subcat) => {
                if (subcat) {
                  console.log("\;" + (subcat.catName ? subcat.catName : "") + "\;\;" +
                    (subcat.catId ? subcat.catId : ""));
                  if (Array.isArray(subcat.icons)) {
                    subcat.icons.forEach((icon) => {
                      if (icon) {
                        console.log("\;\;" + (icon.iconName ? icon.iconName : "") + "\;" +
                          (icon.iconDesc ? icon.iconDesc : ""));
                      }
                    });
                  }
                }
              });
            }
          }
        });
      }
    } catch (err) {
      console.error("Could not parse " + filename, err);
    }
  } else {
    console.error(filename + " is not a file.");
  }

}

if (require.main === module) {
  if (fileArg && fileArg.length > 0) {
    parseFile(fileArg);
  }
}
