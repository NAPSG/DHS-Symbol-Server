export enum DecoratorLocation {
  BOTH,
  TOP,
  BOTTOM
}

//TODO: Add arrows to Style Options

/**
 * Icon Style Options
 */
export interface StyleOptions {
  decoratorLocation: string; // Location relative to symbol where decorators will appear, default is bottom
  decoratorMaxCount: number; // Maximum allowed decorators to display (0-6), default is 3
  fill: boolean; // Should the frame get filled, default is true
  fillColor: string; // Frame fill color if enabled, default is white
  fillOpacity: number; // Frame fill opacity (0-1) if enabled, default is 1 fully opaque
  frame: boolean; // Should the frame be displayed, default is true
  frameName: string; // Overrides default frame, this name should correspond to a frame definition in the symbology map
  frameColor: string; // Stroke color of frame, default is black
  frameWidth: number; // Frame stroke width, default is 4
  icon: boolean; // Show inner icon, default is true
  iconScale: number; // Scale the inner icon, default is 1
  iconColor?: string; // Override icon stroke color, optional
  iconStrokeWidth: number; // Icon stroke width, default is 1
  monoColor?: string; // Draw the icon as a single color, overrides all other colors except outline, optional
  name?: string; // Name text to be shown to the right of the symbol, optional
  nameBgColor: string; // The text background color of the name, default is white
  nameColor: string; // The text color of the name, default is black
  nameFontSize: number; // The font size of the name text, default is 28
  outline: boolean; // Show an outline, default is false
  outlineColor: string; // Color of outline if enabled, default is white
  outlineWidth: number; // Outline stroke width if enabled, default is 4
  padding: number; // padding, default is 8
  size: number; // The size in pixels to draw, proportional, default is 256
  standard: string; //TODO
}

/**
 * Icon Style Validation constant
 */
export const styleValidation: Required<StyleOptions> = {
  decoratorLocation: '',
  decoratorMaxCount: 0,
  fill: false,
  fillColor: '',
  fillOpacity: 0,
  frame: false,
  frameName: '',
  frameColor: '',
  frameWidth: 0,
  icon: false,
  iconScale: 0,
  iconColor: '',
  iconStrokeWidth: 0,
  monoColor: '',
  name: '',
  nameBgColor: '',
  nameColor: '',
  nameFontSize: 0,
  outline: false,
  outlineColor: '',
  outlineWidth: 0,
  padding: 0,
  size: 0,
  standard: ''
};

/**
 * Icon Style Defaults constant
 */
export const styleDefaults: StyleOptions = {
  decoratorLocation: 'bottom',
  decoratorMaxCount: 0, // default of bottom sets this to 3
  fill: true,
  fillColor: '#FFFFFF', // white
  fillOpacity: 1,
  frame: true,
  frameName: '',
  frameColor: '#000000', // black, use %23 for #
  frameWidth: 4,
  icon: true,
  iconScale: 1,
  iconStrokeWidth: 1,
  nameBgColor: '#FFFFFF', // white
  nameColor: '#000000', // black
  nameFontSize: 28,
  outline: false,
  outlineColor: '#FFFFFF', // white
  outlineWidth: 4,
  padding: 8,
  size: 256,
  standard: ''
};
