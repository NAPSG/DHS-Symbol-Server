import { KVMap } from './options';

export interface Decorator {
  name: string; // Unique name of decorator icon
  scale: number; // Relative size of decorator icon in relation with base symbol
  fill: boolean; // Should the frame get filled, optional
  fillColor: string; // Override frame fill color, optional
  fillOpacity: number; // Override frame fill opacity (0-1), optional
  frame: boolean; // Should the frame be displayed, optional
  frameColor: string; // Override frame stroke color, optional
  iconColor: string; // Override icon stroke color, optional
  monoColor?: string; // Draw the icon as a single color, overrides all other colors, optional
}

export const decoratorValidation: Required<Decorator> = {
  name: '',
  scale: 0,
  fill: false,
  fillColor: '',
  fillOpacity: 0,
  frame: false,
  frameColor: '',
  iconColor: '',
  monoColor: ''
};

export const decoratorDefaults: Decorator = {
  name: '',
  scale: 0.18,
  fill: false,
  fillColor: '#FFFFFF', // white
  fillOpacity: 1,
  frame: true,
  frameColor: '#000000', // black
  iconColor: '#000000' // black
};

export function validateDecorators(props: KVMap): undefined | Partial<Decorator>[] {
  let decArray: undefined | Partial<Decorator>[];

  const decs = props['decorator'];
  if (decs) {
    decArray = [];
    if (Array.isArray(decs)) {
      decs.forEach((s: string) => {
        try {
          const decorator = JSON.parse(s);
          if (Object.prototype.hasOwnProperty.call(decorator, 'name')) {
            decArray?.push(decorator);
          }
        } catch (e) {
          console.log('Invalid decorator: ' + s);
        }
      });
    } else {
      try {
        const decorator = JSON.parse(decs);
        if (Object.prototype.hasOwnProperty.call(decorator, 'name')) {
          decArray?.push(decorator);
        }
      } catch (e) {
        console.log('Invalid decorator: ' + decs);
      }
    }
  }

  return decArray;
}
