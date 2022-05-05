// returns a window with a document and an svg root node
// note: cannot use import for some reason
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createSVGWindow, config } = require('svgdom');
const svgWindow = createSVGWindow();
const document = svgWindow.document;

// register window and document
// note: registerWindow could not be imported for some reason
declare module '@svgdotjs/svg.js' {
  const registerWindow: (win: any, doc: any) => void;
}
import { SVG, Path, Shape, Box, Container, Element, List, Circle, registerWindow } from '@svgdotjs/svg.js';
registerWindow(svgWindow, document);

import { SVGAssets } from './svg-assets.model';
import { FrameDefinition, getFrame, findFrameDefinition, findAssetName } from './symbol-map';
import { StyleOptions, styleDefaults, DecoratorLocation } from './style';
import { BadgeOptions, badgeDefaults } from './badge';
import { Decorator, decoratorDefaults } from './decorator';
import { KVMap } from './options';

export const SVGAssetMap = SVGAssets as KVMap;

/**
 * Set up the fonts
 * Had to manually add these to fontkit as the browserify wasn't
 * properly handling the openSync (more importantly the fs.readFileSync) call
 * Note, the fonts are only needed for determining measurements
 * Currently using the Work Sans open source sans serif font
 * There is also an Open Sans open source sans serif font embedded in the svgdom pkg
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs'); // This require will get replaced via brfs during browserify
import fontkit from 'fontkit';
config.setFontFamilyMappings({
  'Work Sans': 'WorkSans-Regular.ttf',
  'Work Sans Bold': 'WorkSans-Bold.ttf'
});
const fonts = config.getFonts();
let buffer = fs.readFileSync('./fonts/WorkSans/WorkSans-Regular.ttf');
fonts['Work Sans'] = fontkit.create(buffer);
buffer = fs.readFileSync('./fonts/WorkSans/WorkSans-Bold.ttf');
fonts['Work Sans Bold'] = fontkit.create(buffer);

const noFill = '#FFFFFF00';
const defaultViewBoxWidth = 100;
const defaultViewBoxHeight = 100;
const defaultAnchor = { x: defaultViewBoxWidth * 0.5, y: defaultViewBoxHeight * 0.5 };
const defaultDecoratorRadius = 10;
const defaultDecoratorPadding = 4;
const defaultDecoratorOffsetY = defaultDecoratorRadius + defaultDecoratorPadding;
// Decorator offset maps
const decX = [[50], [39, 61], [28, 50, 72], [28, 50, 72, 50], [28, 50, 72, 39, 61], [28, 50, 72, 28, 50, 72]];
const decY = [-defaultDecoratorOffsetY, defaultViewBoxHeight + defaultDecoratorOffsetY];

/**
 * Point Type
 */
interface Point {
  x: number;
  y: number;
}

/**
 * Symbol Type
 */
export class Symbol {
  sidc: string;
  style: StyleOptions;
  badge: BadgeOptions | undefined;
  decorators: Decorator[] | undefined;
  frame: FrameDefinition | string | undefined;
  symbolAnchor: Point;
  width: number;
  height: number;

  //TODO: are we using this?
  validIcon: boolean;

  constructor(
    sidc?: string,
    style?: Partial<StyleOptions>,
    badge?: Partial<BadgeOptions>,
    decorators?: Partial<Decorator>[]
  ) {
    if (sidc) {
      this.sidc = sidc;
      this.frame = getFrame(sidc);
    } else {
      this.sidc = '';
    }

    // Set the defaults
    this.style = styleDefaults;

    if (style) {
      // Merge the arguments that were set
      this.style = { ...this.style, ...style };
    }

    if (badge) {
      // Merge the arguments that were set with the defaults
      this.badge = { ...badgeDefaults, ...badge };
    }

    if (decorators && decorators.length > 0) {
      this.decorators = [];
      decorators.forEach((partDec: Partial<Decorator>) => {
        // Merge the arguments that were set with the defaults
        this.decorators?.push({ ...decoratorDefaults, ...partDec });
      });
    }

    this.width = defaultViewBoxWidth;
    this.height = defaultViewBoxHeight;

    // The anchor point for the current symbol
    this.symbolAnchor = { x: defaultAnchor.x, y: defaultAnchor.y };

    // If we were able to find a valid icon or not.
    this.validIcon = true;
  }

  //TODO: case sensitivity

  /**
   * Returns an SVG element as a string
   */
  asSVG(): string {
    const svgContainer: Container = SVG().namespace().viewbox(0, 0, defaultViewBoxWidth, defaultViewBoxHeight);

    // Create a root group
    const svgRootGroup: Container = svgContainer.group().id('root');

    //TODO: Use SVG.Color

    /**
     * Configure Frame
     */
    if (this.style.frame) {
      // Frame enabled

      /**
       * Configure the Frame Override
       */
      if (this.style.frameName) {
        // Frame override set, ensure the frame exists
        this.frame = findAssetName(this.style.frameName, 'frame-');
        if (!this.frame) {
          // Didn't find the frame asset, check custom frames
          this.frame = findFrameDefinition(this.style.frameName);
        }
      }

      if (this.frame) {
        const frameGroup: Container = svgRootGroup.group().id('frame');

        // Has a frame
        if (Object.prototype.hasOwnProperty.call(this.frame, 'framePath')) {
          // Object is custom Frame path
          const framePath: string | undefined = (this.frame as FrameDefinition).framePath;
          if (framePath) {
            frameGroup.path(framePath);
          }
          //TODO: is frameColor set on this frame object
        } else if (typeof this.frame == 'string') {
          // Object is frame asset name string
          const frameSvg: string | undefined = SVGAssetMap[this.frame as string];
          if (frameSvg) {
            // Import the Frame Asset into temporary SVG Container
            const frameContainer: Container = SVG(frameSvg) as Container;
            //TODO: May need to fix this when viewbox adjustments are implemented
            // Update the primary viewbox based on the imported frame's viewbox
            svgContainer.viewbox(frameContainer.viewbox());
            // Move any children from the temporary SVG into the root group of the SVG Container
            frameContainer.children().forEach((c: Element) => {
              if (c instanceof Shape) {
                c.toParent(frameGroup);
              }
            });
          }
        }

        /**
         * Style the paths
         */
        const paths: List<Element> = frameGroup.find('path');
        paths.forEach((p: Element) => {
          if (p instanceof Path) {
            // Don't fill when using monoColor
            if (this.style.fill && !this.style.monoColor) {
              p.fill(this.style.fillColor);
              p.attr({ 'fill-opacity': this.style.fillOpacity });
            }
            // Draw paths with monoColor if set, otherwise use frameColor
            p.stroke(this.style.monoColor || this.style.frameColor);
            p.attr({ 'stroke-width': this.style.frameWidth });
          }
        });

        /**
         * Style the circles
         */
        const circles: List<Element> = frameGroup.find('circle');
        circles.forEach((c: Element) => {
          if (c instanceof Circle) {
            // Don't fill when using monoColor
            if (this.style.fill && !this.style.monoColor) {
              c.fill(this.style.fillColor);
              c.attr({ 'fill-opacity': this.style.fillOpacity });
            }
            // Draw paths with monoColor if set, otherwise use frameColor
            c.stroke(this.style.monoColor || this.style.frameColor);
            c.attr({ 'stroke-width': this.style.frameWidth });
          }
        });

        //TODO: Other shapes or just use shape, depends on how fill works
      }
    } // End Frame Configuration

    /**
     * Configure monoColor root
     */
    if (this.style.monoColor || !this.style.fill) {
      // Transparent fill at root, when monoColor is on or fill is off
      svgContainer.fill('#FFFFFF00'); //TODO: move hard code
    } // End MonoColor Configuration

    /**
     * Configure Inner Icon
     */
    if (this.style.icon) {
      const svgIcon: string | undefined = findAssetName(this.sidc, 'icon-');
      if (svgIcon) {
        // Create a group for this icon
        const iconGroup = svgRootGroup.group().id('icon');
        // Retrieve the svg string
        const iconSvg: string | undefined = SVGAssetMap[svgIcon as string];
        if (iconSvg) {
          // Create the svg element
          const iconContainer = SVG(iconSvg) as Container;
          // Move all the svg children to the main svg
          iconContainer.children().forEach((c: Element) => {
            if (c instanceof Shape) {
              const attributes = c.attr();
              const hasStroke: boolean = Object.prototype.hasOwnProperty.call(attributes, 'stroke');
              const hasFill: boolean = Object.prototype.hasOwnProperty.call(attributes, 'fill');
              const hasStrokeWidth: boolean = Object.prototype.hasOwnProperty.call(attributes, 'stroke-width');

              if (!hasStrokeWidth) {
                // Default the icon stroke width if it wasn't set
                c.attr({ 'stroke-width': this.style.iconStrokeWidth });
              }

              //TODO: not sure which of stroke/fill need to be set or both

              // Override stroke and fill colors if monoColor is set
              if (this.style.monoColor) {
                // Set stroke to monoColor if set
                c.stroke(this.style.monoColor);
                if (hasFill) {
                  // If fill is set, change to monoColor
                  c.attr('fill', this.style.monoColor);
                }
              } else {
                if (this.style.iconColor) {
                  // Set stroke to iconColor if set
                  c.stroke(this.style.iconColor);
                  if (hasFill) {
                    // If fill is set, change to iconColor
                    c.attr('fill', this.style.iconColor);
                  }
                } else {
                  if (!hasStroke) {
                    if (hasFill) {
                      // has a fill but no stroke, set stroke to fill color
                      c.stroke(c.attr('fill'));
                    } else {
                      // has no fill or stroke, set stroke to black
                      c.stroke('black');
                    }
                  }
                  if (!hasFill) {
                    if (hasStroke) {
                      c.fill(c.attr('stroke'));
                    } else {
                      c.fill('black');
                    }
                  }
                }
              }

              // Add the Shape to the output svg
              iconGroup.add(c);
            }
          });
        }

        iconGroup.scale(this.style.iconScale, this.style.iconScale, defaultAnchor.x, defaultAnchor.y);
      } else {
        console.log('No inner icon found for ' + this.sidc);
      }
    } // End Icon Configuration

    /**
     * Configure Badge
     */
    if (this.badge) {
      // Create a group for the badge
      const badgeGroup = svgRootGroup.group().id('badge');

      let count = this.badge.badgeCount.toFixed(0);
      if (this.badge.badgeCount > 9) {
        count = '9+';
      }

      const diameter = this.badge.badgeRadius * 2;

      badgeGroup
        .circle(diameter)
        .cx(this.badge.badgeRadius)
        .cy(this.badge.badgeRadius)
        .fill(this.badge.badgeFillColor)
        .stroke(this.badge.badgeTextColor);
      badgeGroup
        .plain(count)
        .font({
          family: 'Work Sans, sans-serif', // attr:font-family
          size: this.badge.badgeFontSize, // attr:font-size
          anchor: 'middle', // attr:text-anchor
          weight: 'bold' // attr:font-weight
        })
        //TODO: canvas doesn't handle this
        // .font('dominant-baseline', 'middle')
        .dx(this.badge.badgeRadius)
        .dy(this.badge.badgeRadius + this.badge.badgeRadius * this.badge.badgeBaselineAdjust)
        .fill(this.badge.badgeTextColor);
    } // End Badge Configuration

    /**
     * Configure Decorators
     */
    if (this.decorators && this.decorators.length > 0) {
      // Create a group for the decorators
      const decGroup = svgRootGroup.group().id('decorators');

      const dloc: string = this.style.decoratorLocation.toUpperCase();
      const eloc: keyof typeof DecoratorLocation = (dloc as unknown) as keyof typeof DecoratorLocation;
      const decoratorLocation = DecoratorLocation[eloc];

      let decSlots: number;
      if (decoratorLocation === DecoratorLocation.BOTH) {
        // both
        decSlots = 6;
      } else if (decoratorLocation === DecoratorLocation.TOP) {
        // top
        decSlots = 3;
      } else {
        // bottom
        decSlots = 3;
      }
      const decCount: number = Math.min(decSlots, this.style.decoratorMaxCount, this.decorators.length);

      const diameter = defaultDecoratorRadius * 2;

      const i: number = decCount - 1;
      let j = 0;
      let k: number = decoratorLocation === DecoratorLocation.BOTTOM ? 1 : 0;
      this.decorators.forEach((d: Decorator) => {
        if (decCount > j) {
          // break doesn't work the same in typescript

          const decAssetName = findAssetName(d.name, 'dec-');
          if (decAssetName) {
            const decAsset = SVGAssetMap[decAssetName];
            if (decAsset) {
              // Toggle k so that the other y is used
              if (j === 3) {
                k = k === 0 ? 1 : 0;
              }

              if (d.frame) {
                // Draw the decorator frame, monoColor overrides frameColor if set
                const circle = decGroup
                  .circle(diameter)
                  .cx(decX[i][j])
                  .cy(decY[k])
                  .stroke(d.monoColor || d.frameColor);
                if (d.fill) {
                  circle.fill(d.fillColor).attr({ 'fill-opacity': d.fillOpacity });
                } else {
                  circle.attr({ 'fill-opacity': 0 });
                }
              }

              const innerDecGroup = decGroup.group().id('dec-' + j);
              const decContainer = SVG(decAsset) as Container;
              decContainer.children().forEach((c: Element) => {
                if (c instanceof Shape) {
                  innerDecGroup.add(c);
                }
              });

              // Draw the decorator icon, monoColor overrides iconColor if set
              innerDecGroup
                .stroke(d.monoColor || d.iconColor)
                .fill(d.monoColor || d.iconColor)
                .transform({
                  positionX: decX[i][j],
                  positionY: decY[k],
                  scale: d.scale
                });

              // Increment the decorator position
              j++;
            }
          }
        }
      });
    } // End Decorator Configuration

    const vbox: Box = svgContainer.viewbox();

    /**
     * Configure Dimensions
     */
    const paddingDouble = this.style.padding * 2;
    // Viewbox
    let x1 = vbox.x - this.style.padding - this.style.frameWidth * 0.5;
    let y1 = this.style.decoratorMaxCount > 0 ? -(defaultDecoratorRadius * 2 + defaultDecoratorPadding * 2) : 0;
    let w = vbox.width + paddingDouble + this.style.frameWidth;
    let h =
      vbox.height +
      paddingDouble +
      (this.style.decoratorMaxCount > 0 ? defaultDecoratorRadius * 4 + defaultDecoratorPadding * 4 : 0);
    // Size
    let sizeX = w >= h ? this.style.size : (this.style.size * w) / h;
    let sizeY = h >= w ? this.style.size : (this.style.size * h) / w;

    /**
     * Configure Outline
     */
    if (this.style.outline) {
      const a = defaultViewBoxHeight * 0.5 + defaultDecoratorOffsetY;
      const b = defaultViewBoxWidth * 0.5 - decX[2][0];
      const radius = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2)) + defaultDecoratorOffsetY;
      const diameter = radius * 2;

      svgRootGroup
        .circle(diameter)
        .id('outline')
        .center(defaultAnchor.x, defaultAnchor.y)
        .stroke(this.style.outlineColor)
        .fill(noFill)
        .attr({ 'stroke-width': this.style.outlineWidth });

      x1 = y1 = 50 - radius - this.style.outlineWidth * 0.5 - this.style.padding;
      const newWidth = diameter + this.style.outlineWidth + paddingDouble;
      const newHeight = newWidth;

      const hR = h !== 0 ? newHeight / h : 1;
      const wR = w !== 0 ? newWidth / w : 1;
      w = newWidth;
      h = newHeight;
      sizeX = sizeY *= Math.min(hR, wR);
    } // End Outline Configuration

    this.symbolAnchor.x = sizeX * 0.5;
    this.symbolAnchor.y = sizeY * 0.5;

    /**
     * Configure Labels
     */
    if (this.style.name && this.style.name.length > 0) {
      const nameText = SVG().plain(this.style.name).font({
        // svg.js does not handle weights when measuring, so set to bold font file manually
        family: 'Work Sans Bold', // attr:font-family
        size: this.style.nameFontSize, // attr:font-size
        anchor: 'start', // attr:text-anchor
        weight: 'bold' // attr:font-weight
      });
      //TODO: canvas doesn't handle this
      // .font('dominant-baseline', 'bottom')

      const nameBg = nameText.clone().attr('stroke', this.style.nameBgColor).attr('stroke-width', '0.25em');

      // Now set it back to the base so that clients can use the weight attribute appropriately
      nameText.font({ family: 'Work Sans, sans-serif' });
      nameBg.font({ family: 'Work Sans, sans-serif' });

      // Force measurements
      const textBox = nameBg.bbox();
      const textX = textBox.width;
      const textY = textBox.height;

      nameText.fill(this.style.nameColor);

      // Create a group for the labels
      const labelGroup = svgRootGroup.group().id('name');
      const dx = defaultViewBoxWidth + this.style.frameWidth * 0.5 + this.style.padding;
      labelGroup
        .add(nameBg)
        .add(nameText)
        .dx(dx)
        .dy(defaultAnchor.y + textY * 0.25); // you'd think this adjustment would be 0.5

      const addWidth = dx + textX + this.style.padding - w - x1;
      if (addWidth > 0) {
        const newWidth = w + textX + this.style.padding;
        sizeX *= newWidth / w;
        w = newWidth;
      }
    } // End Label Configuration

    /**
     * Configure Size
     */
    svgContainer.size(sizeX, sizeY);
    svgContainer.viewbox(x1, y1, w, h);

    this.width = sizeX;
    this.height = sizeY;

    // add center and dimension formatted as <desc>ctr:x=76,y=76:dim:x=152,y=152</desc>
    const descString =
      'ctr:x=' +
      this.symbolAnchor.x +
      ',y=' +
      (this.symbolAnchor.y - this.style.padding) +
      ':dim:x=' +
      sizeX +
      ',y=' +
      sizeY;
    svgContainer.element('desc').words(descString);

    return svgContainer.svg();
  }
}
