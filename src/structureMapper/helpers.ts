export function isString(value: any): value is string {
  return typeof value === 'string' || value instanceof String;
}

export function isObject(value: any): value is any {
  const type = typeof value;
  return value != null && (type === 'object' || type === 'function');
}

export function assignValue(objRef: any, key: string, value: any) {
  if (Array.isArray(objRef[key]) && Array.isArray(value)) {
    objRef[key].push(...value);
  }
  else if (isObject(objRef[key]) && isObject(value)) {
    Object.assign(objRef[key], value);
  }
  else {
    objRef[key] = value;
  }
}

export function handleObjectPath(objPath: any) {
  let pathParts;

  if (typeof objPath === 'string') {
    pathParts = objPath.split('.');
  }
  else if (objPath && objPath.length) {
    pathParts = objPath;
  }
  else {
    throw new Error('path should be either dotted string or array of strings');
  }

  return pathParts;
}

export function set(obj: any, dottedPath: any, value: any): any {
  const pathParts = handleObjectPath(dottedPath);
  const lastPathPart = pathParts[pathParts.length - 1];

  let objRef = obj;

  // loop over path parts except the last part to ensure the path is exist
  for (let i = 0; i < pathParts.length - 1; i++) {
    const pathPart = pathParts[i];

    // if path doesn't exist create it
    if (!objRef[pathPart]) {
      objRef[pathPart] = {};
    }

    // change the reference to the nested object
    objRef = objRef[pathPart];
  }

  assignValue(objRef, lastPathPart, value);

  return obj;
}

export function get(obj: any, dottedPath: any) {
  const pathParts = handleObjectPath(dottedPath);

  let nested = obj;

  for (let i = 0; i < pathParts.length; i++) {
    if (!nested[pathParts[i]]) {
      return null;
    }

    nested = nested[pathParts[i]];
  }

  return nested;
}

export function get2(object: any, path: string) {
  path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
  path = path.replace(/^\./, ''); // strip a leading dot
  const a = path.split('.');
  for (let i = 0, n = a.length; i < n; ++i) {
    const k = a[i];
    if (isObject(object) && k in object) {
      object = (object as any)[k];
    } else {
      return;
    }
  }
  return object;
}

export function removeUndeifined (obj: any)  {
  Object.keys(obj).forEach(key => {
    if (obj[key] && typeof obj[key] === 'object') removeUndeifined(obj[key]);
    else if (obj[key] === undefined) delete obj[key];
  });
  return obj;
};

export function isSpecial(value: any) {
  const stringValue = Object.prototype.toString.call(value);
  return stringValue === '[object RegExp]' || stringValue === '[object Date]';
}

export function isNonNullObject(value: any) {
  return !!value && typeof value === 'object';
}

export function mergeObject(target: any, source: any) {
  const destination: any = {};
  if (isMergeableObject(target)) {
    Object.keys(target).forEach(function(key) {
      destination[key] = clone(target[key]);
    });
  }

  Object.keys(source).forEach(function(key) {
    if (!isMergeableObject(source[key]) || !target[key]) {
      destination[key] = clone(source[key]);
    }
    else {
      destination[key] = merge(target[key], source[key]);
    }
  });

  return destination;
}

export function isMergeableObject(value: any) {
  return isNonNullObject(value) && !isSpecial(value);
}

export function emptyTarget(val: any) {
  return Array.isArray(val) ? [] : {};
}

export function arrayMerge(target: any, source: any) {
  return target.concat(source).map(function(element: any) {
    return clone(element);
  });
}

export function clone(value: any) {
  return isMergeableObject(value) ? merge(emptyTarget(value), value) : value;
}

export function merge(target: object, source: object): object {
  const sourceIsArray = Array.isArray(source);
  const targetIsArray = Array.isArray(target);
  const sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

  if (!sourceAndTargetTypesMatch) {
    return clone(source);
  }
  else if (sourceIsArray) {
    return arrayMerge(target, source);
  }
  else {
    return mergeObject(target, source);
  }
}

export function flatten(arr: any[]): any {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}

