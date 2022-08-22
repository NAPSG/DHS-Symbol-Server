/**
 * Copyright (c) Dignitas Technologies, LLC
 *
 * This file and its contents are governed by one or more distribution and
 * copyright statements as described in the LICENSE.txt file distributed with
 * this work.
 */
import { SVGAssets } from './svg-assets.model';

/**
 * Definable Color Type
 */
interface ColorDefinition {
  // Unique name of color
  colorName: string;
  // A standard CSS hex or rgb color string
  // ex. "red" or "#00FF00" or "rgb(0,0,255)"
  colorString: string;
}

/**
 * Definable Frame Type
 */
export interface FrameDefinition {
  // Unique frame name
  // This should match a frame asset or
  // set framePath to define a dynamic frame
  frameName: string;
  // Optional SVG path string for dynamically creating a custom frame
  framePath?: string;
  // Optional color of frame
  // Locally defined colors are checked first
  // If not present, then assume CSS Color syntax
  // ex. "red" or "#00FF00" or "rgb(0,0,255)"
  frameColor?: string;
}

interface DecoratorDefinition {
  // Unique decorator name
  // This should match a decorator asset or
  // set decPath to define a dynamic decorator
  decName: string;
  // Optional SVG path string for dynamically creating a custom decorator
  decPath?: string;
  // Optional color of decorator
  // Locally defined colors are checked first
  // If not present, then assume CSS Color syntax
  // ex. "red" or "#00FF00" or "rgb(0,0,255)"
  decColor?: string;
}

/**
 * Icon Type
 */
interface IconDefinition {
  // Unique icon name
  iconName: string;
  // Icon description
  iconDesc: string;
  // Set of unique characters to use in symbol id code (sidc)
  // The number of valid characters is defined by
  // the parent category or the symbol map itself
  iconId: string;
  // Optional frame assigned to this icon
  // This corresponds to a frame defined in the symbology map
  // and defaults to the category/subcategory frame
  frameName?: string;
}

/**
 * Category Type
 * Note: Categories may have icons or subcategories, but not both.
 */
interface CategoryDefinition {
  // Displayable name
  catName: string;
  // Displayable description
  catDesc: string;
  // Set of unique characters to use in symbol id code (sidc)
  // The number of valid characters is defined by
  // the parent category or the symbol map itself
  catId: string;
  // Optional frame assigned to this category
  // This corresponds to a frame defined in the symbology map
  // and defaults to outline of viewbox if not set or
  // or overridden by subcategory
  frameName?: string;
  // Optional set of this category's icons instances
  icons?: IconDefinition[];
  // Optional number of characters used to represent
  // the symbol id code (sidc) of the icons in this category
  // Needs to be present if icons are used
  iconIdLength?: number;
  // Optional set of this category's sub-categories
  subcategories?: CategoryDefinition[];
  // Optional number of characters used to represent
  // the symbol id code (sidc) of the subcats in this cat
  // Needs to be present if subcategories are used
  subcatIdLength?: number;
}

/**
 * Symbology Map
 */
interface SymbolMap {
  // Name of the symbology map/definition
  symbologyName: string;
  // Version of the symbology map
  version: string;
  // Set of categories
  categories: CategoryDefinition[];
  // Number of characters used to represent the symbol id code (sidc)
  catIdLength: number;
  // Optional set of defined frames
  frames?: FrameDefinition[];
  // Optional set of defined colors
  colors?: ColorDefinition[];
  // Optional set of defined decorators
  decorators?: DecoratorDefinition[];
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const symbolMap: SymbolMap = require('../assets/symbol-map.json');
export const getSymbolMap: string = JSON.stringify(symbolMap);

/**
 * Validate the symbol map json and ensure corresponding assets exist
 *
 * @returns true if symbol map is valid, else false
 */
function validateSymbolMap(): boolean {
  //TODO: validate symbolMap json

  // Validate Colors are legal
  if (symbolMap.colors) {
    symbolMap.colors.forEach((color: ColorDefinition) => {
      if (!color.colorName) {
        return false;
      }
      //TODO: validate color.colorString
    });
  }

  // Validate Frames have corresponding svg assets
  if (symbolMap.frames) {
    symbolMap.frames.forEach((frame: FrameDefinition) => {
      console.log('Validating Frame: ' + frame.frameName);
      //TODO: validate
    });
  }

  if (symbolMap.decorators) {
    symbolMap.decorators.forEach((decorator: DecoratorDefinition) => {
      console.log('Validating Frame: ' + decorator.decName);
      //TODO: validate
    });
  }

  // Validate Icons have corresponding svg assets
  symbolMap.categories.forEach((category) => {
    console.log('Validating Category: ' + category.catName);
    //TODO: validate
  });

  console.log('Symbol Map valid');

  return true;
}
export const isSymbolMapValid: boolean = validateSymbolMap();

/**
 * Retrieve the frame for the given sidc
 *
 * @param sidc the symbol id code
 * @returns the mapped frame as a frame asset name or a frame definition, undefined if not mapped
 */
export function getFrame(sidc: string): FrameDefinition | string | undefined {
  let returnFrame: FrameDefinition | string | undefined;

  if (sidc && sidc.length > 0 && symbolMap.catIdLength) {
    let index = 0;

    let parentCat: CategoryDefinition | undefined;

    // Get the category id
    let parentId: string = sidc.substr(index, symbolMap.catIdLength);
    if (parentId && parentId.length > 0) {
      // Find the category
      parentCat = symbolMap.categories.find((category) => {
        if (category.catId && category.catId.toLocaleUpperCase() === parentId.toLocaleUpperCase()) {
          return category;
        }
      });
    }

    if (parentCat) {
      if (parentCat.frameName) {
        // Start with the parent frame if defined
        returnFrame = 'frame-' + parentCat.frameName;
      }

      // The root category of the id has been processed so increment the index
      index += symbolMap.catIdLength;

      // Traverse the hierarchy
      while (index < sidc.length) {
        // Need to re-check for parent cat undefined as we traverse
        if (parentCat) {
          if (parentCat.iconIdLength && parentCat.icons) {
            // This category has icons

            let iconDef: IconDefinition | undefined;

            // Get the icon id
            const iconId: string = sidc.substr(index, parentCat.iconIdLength);
            if (iconId && iconId.length > 0) {
              // Find the icon
              iconDef = parentCat.icons.find((icon) => {
                if (icon.iconId && icon.iconId.toLocaleUpperCase() === iconId.toLocaleUpperCase()) {
                  return icon;
                }
              });
            }

            if (iconDef) {
              // Found the icon we were looking for
              if (iconDef.frameName) {
                // Icon has a frame defined so use it
                returnFrame = 'frame-' + iconDef.frameName;
              }
            }

            // Can't go any deeper
            break;
          } else if (parentCat.subcatIdLength && parentCat.subcategories) {
            // this category has subcategories

            let childCat: CategoryDefinition | undefined;

            // Get the subcategory id
            const childId: string = sidc.substr(index, parentCat.subcatIdLength);
            if (childId && childId.length > 0) {
              // Find the category
              childCat = parentCat.subcategories.find((category) => {
                if (category.catId && category.catId.toLocaleUpperCase() === childId.toLocaleUpperCase()) {
                  return category;
                }
              });
            }

            if (childCat) {
              if (childCat.frameName) {
                // Subcategory has a frame defined
                returnFrame = 'frame-' + childCat.frameName;
              }

              // Increment the index
              index += parentCat.subcatIdLength;
              // Update the parent category
              parentId = childId;
              parentCat = childCat;
            } else {
              console.warn('Invalid subcategory id: ' + childId);
              break;
            }
          } else {
            break;
          }
        } else {
          break;
        }
      }
    } else {
      console.warn('Invalid category id: ' + parentId);
    }
  }

  return returnFrame;
}

/**
 * Finds a Frame Definition from the symbol map
 * Ignores case
 *
 * @param frameName Name of frame to find
 * @returns If found, the Frame Definition, else undefined
 */
export function findFrameDefinition(frameName: string): FrameDefinition | undefined {
  let frameDef;
  if (frameName && frameName.length > 0) {
    if (symbolMap.frames) {
      frameDef = symbolMap.frames.find((frame) => {
        if (frame.frameName && frame.frameName.toLocaleUpperCase() === frameName.toLocaleUpperCase()) {
          return frame;
        }
      });
    }
    if (!frameDef) {
      console.warn('Did not find specified frame using ' + frameName);
    }
  } else {
    console.error('Invalid frameName');
  }
  return frameDef;
}

/**
 * Finds the corresponding asset for the given name
 * Ignores case
 *
 * @param name The name of the asset
 * @param prefix prefix to use in asset search
 * @returns If found, the name of the asset, else undefined
 */
export function findAssetName(name: string, prefix?: string): string | undefined {
  const assetName: string = (prefix ? prefix : '') + name;
  return Object.keys(SVGAssets).find((key) => {
    if (key.toLocaleUpperCase() === assetName.toLocaleUpperCase()) {
      // Found the svg asset
      return key;
    }
  });
}
