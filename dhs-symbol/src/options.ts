export interface KVMap {
  [key: string]: any;
}

export function validateOptions(props: KVMap, validation: KVMap): KVMap {
  const obj: KVMap = {};
  if (typeof validation !== 'undefined') {
    for (const key in props) {
      if (Object.prototype.hasOwnProperty.call(validation, key)) {
        if (typeof validation[key] == 'boolean') {
          obj[key] = props[key].toUpperCase() == 'TRUE';
        } else if (typeof validation[key] == 'number') {
          obj[key] = Number(props[key]);
        } else {
          obj[key] = props[key];
        }
      }
    }
  }
  return obj;
}
