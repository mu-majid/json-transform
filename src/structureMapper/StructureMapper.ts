import {
  INode,
  IPushCondition,
  IFor,
  IPush,

} from './interfaces';
import {
  PATH_IDENTIFIER,
  PUSH,
  CONDITIONS,
  ATTRIBUTE_VALUE,
  CONCAT,
  LOOP,
  ARR_ELEM,
  ELEM_PARENT,
  SET_ATTRIBUTE_VALUE
} from './constants';
import { isString, isObject, set, get2, removeUndeifined, clone, merge, flatten } from './helpers';
import { comparators } from './comparators';

export class StructureMapper {
  private pathIdentifier: string;
  private arrElem: string = ARR_ELEM;
  private elemParent: string = ELEM_PARENT;

  constructor(config: { pathIdentifier: string; }) {
    this.pathIdentifier = config.pathIdentifier || PATH_IDENTIFIER;
  }

  public map(rawData: any, pdfSchema:any[], chunkPaths?: string[], chunkData?: any) {
    const mapped: any[] = [];
    pdfSchema.forEach((node:INode, index) =>{
      // Only Push
      if (node.hasOwnProperty(PUSH) && !node.hasOwnProperty(CONDITIONS) && !node.hasOwnProperty(LOOP)) {
        mapped.push(this.mapPush(rawData, node.push, chunkPaths, chunkData));
      }
      // push + for
      else if (node.hasOwnProperty(PUSH) && !node.hasOwnProperty(CONDITIONS) && node.hasOwnProperty(LOOP)) {
        mapped.push(this.mapFor(rawData, node));
      }
      // push + for + conditions
      else if (node.hasOwnProperty(PUSH) && node.hasOwnProperty(CONDITIONS) && node.hasOwnProperty(LOOP)) {
        const conditionResult = this.evalConditions(rawData, node.conditions, true);
        
        if (conditionResult) {
          delete node.conditions;
          mapped.push(this.map(rawData, [node])); // should i call this.mapFor instead ? 
        }
      }
      // push + conditions
      else if (node.hasOwnProperty(PUSH) && node.hasOwnProperty(CONDITIONS) && !node.hasOwnProperty(LOOP)) {
        const conditionResult = this.evalConditions(rawData, node.conditions, true);

        if (conditionResult) {
          mapped.push(this.mapPush(rawData, node.push)); // should i call this.map instead ? 
        }
      }
      else {
        throw new Error('Invalid Schema Structure.\nUsage: [{push}] or [{push, for}] or [{push, conditions}] or [{push, for, conditions}]');
      }
    });

    return flatten(mapped);
  }

  private evalConditions(rawData: any, conditions: any, isPushCond: boolean) {
    let result, defCond;
    if (conditions) {
      const { defaultCond, filteredConds } = this.getDefaultCondition(conditions);
      defCond = defaultCond;
      
      for (const condition of filteredConds) {
        if (Object.keys(condition).length !== 1 && isPushCond) {
          throw new Error(`condition ${JSON.stringify(condition)} is invalid.\nUsage: PushCondition object only contain onr key: [ { operator: [] | str } ].`)
        }
        let [operator, conditionToEval] = Object.entries(condition)[0];

        if (!Array.isArray(conditionToEval)) {
          conditionToEval = [conditionToEval];
        }

        result = this.resolveCondition(operator, conditionToEval, rawData);

        if (result) {
          return condition;
        }
      }
    }
    return defCond ? defCond : result;
  }

  private getDefaultCondition (condsArr: any[]) {
    
    const defaultCond = condsArr.find((c: any) => c.default);
    const filteredConds = condsArr.filter(e => !e.default);
    
    return { defaultCond, filteredConds };
  }

  private resolveCondition(operator: string, condArr: any, rawData: any){

    if (!Object.keys(comparators).includes(operator)) {
      throw new Error(`${operator} is not supported. Supported Operators are :\n[ ${Object.keys(comparators)} ].`);
    }

    const resolvedConds = condArr.map((param: string) => {
      if (isString(param)) {
        return this.mapStringValue(rawData, param);
      }
      else {
        return param;
      }
    });
    
    // @TODO: should check if operator is (exist or notExist), and change their impl.
    return comparators[operator](...resolvedConds);
  }

  private mapFor(rawData: any, node: INode, currentpaths?: string[], cData?: any): any {
    const forloop = node.for;
    const mappedArr: any[] = [];

    if (forloop) {
      let chunkSize = (forloop.count || 1);
      let pathsarray = forloop.path;

      if(!Array.isArray(pathsarray)){
        pathsarray = [pathsarray];
      }

      if (currentpaths) {
        pathsarray = this.parsePaths(pathsarray, currentpaths);
      }
    
      const resolvedPaths = this.resolvePaths(pathsarray, rawData);

      for (let i = (forloop.start || 0); i < (forloop.end || resolvedPaths.length); i += chunkSize) {
        const chunkPaths = resolvedPaths.slice(i, i+chunkSize);        
        const chunkData = this.getChunkData(rawData, chunkPaths);
        mappedArr.push(this.mapPush(rawData, node.push, chunkPaths, chunkData));        
      }
    }

    return flatten(mappedArr);
  }

  private resolvePaths (paths: string[], rawData: any) {
    const actualPaths = this.loopPaths(paths, rawData);
    
    return actualPaths;
  }

  private getChunkData(rawData: any, chunkPaths: string[]) {
    return chunkPaths.map((chunkPath) => {
      return get2(rawData, chunkPath.replace(this.pathIdentifier, ''));
    })
  }

  private mapPush(rawData: any, schema: any, paths?: string[], chunkData?: any) {
    let mappedValue;

    if (Array.isArray(schema)) { // push: [] not {} (in case arr to primitve mapping)
      mappedValue = this.mapSchemaArray(schema, rawData, paths, chunkData);
    } else {
      mappedValue = this.mapObject(schema, rawData, paths, chunkData);
    }

    return mappedValue;
  }
  
  private mapObject(obj: any, data: any, currentPaths?: string[], chunkData?: any) {    
    let mappedObj: any = {};

    for (const key in obj) {
      const elem = obj[key];      

      if (Array.isArray(elem)) {
        mappedObj[key] = this.mapSchemaArray(elem, data, currentPaths, chunkData);
      }
      else if (isObject(elem)) {

        if (elem.hasOwnProperty(CONDITIONS)) {

          const resolvedCondition = this.evalConditions(data, elem.conditions, false);
          let mappedValue;

          if (resolvedCondition) {
            mappedValue = this.mapValue(data, resolvedCondition.value);
          }

          mappedObj[key] = mappedValue;
        }
        else if (elem.hasOwnProperty(ATTRIBUTE_VALUE)) {
          mappedObj[key] = this.mapValue(data, elem.value);
        }
        else if (elem.hasOwnProperty(LOOP) && elem.hasOwnProperty(SET_ATTRIBUTE_VALUE)){
          mappedObj[key] = this.mapFor(data, elem, currentPaths, chunkData);
        }
        else {
          mappedObj[key] = this.mapObject(elem, data, currentPaths, chunkData);
        }
      }
      else if (isString(elem)) {
        mappedObj[key] = this.mapStringValue(data, elem, currentPaths, chunkData);
      }
      else {
        mappedObj[key] = elem;
      }
    }

    return mappedObj;
  }

  // @TODO : format the string after resolving value
  private mapValue(rawData: any, value: any) {
    if (isString(value)) {
      return this.mapStringValue(rawData, value);
    }
    else if (isObject(value) && value.hasOwnProperty(CONCAT)) {

      const concat = value.concat.map((elem: string) => {
        return this.mapStringValue(rawData, elem);
      });

      return concat.join('');
    }
    else if (Array.isArray(value)) {
      return this.mapSchemaArray(value, rawData);

    }
    else if (isObject(value)) {
      return this.mapObject(value, rawData);
    }
    else {
      return value;
    }
  }

  private mapSchemaArray(arr: any[], data: any, paths?: string[], chunkData?: any): any[] {
    let mappedArr: any = [];

    arr.forEach((elem) => {
      if (Array.isArray(elem)) {
        mappedArr.push(this.mapSchemaArray(elem, data, paths, chunkData));
      }
      else if (isObject(elem)) {
        mappedArr.push(this.mapObject(elem, data, paths, chunkData));

      }
      else if (isString(elem)) {
        mappedArr.push(this.mapStringValue(data, elem, paths, chunkData));
      }
      else {
        mappedArr.push(elem);
      }
    });
  
    return mappedArr;
  }

  private mapStringValue(rawData: any, valueToMap: string, paths?: string[], chunkData?: any) {
    let  pathValue: any = valueToMap;

    if (valueToMap.startsWith(this.pathIdentifier)) {

      pathValue = get2(rawData, valueToMap.replace(this.pathIdentifier, ''));
    }
    else if (valueToMap.includes(this.elemParent)) {

      pathValue = this.resolveParentPathValue(valueToMap, paths, rawData);
    }
    else if (valueToMap.startsWith(this.arrElem)) { 

      pathValue = this.resolveElemPathValue(valueToMap, chunkData);
    }
    
    return pathValue;
  }

  private resolveParentPath(valuePath: string, actualPaths?: string[]): string {
    let parentPath;
    let index: number = 0;

    const splittedPath = valuePath.split('.');
    const { dropCount, remainderPath } = this.splitArrPaths(splittedPath);
    const matchedIndexes = splittedPath[0].match(/([0-9]+)/g);

    if (matchedIndexes) {
      index = parseInt(matchedIndexes[0]);
    }
    
    if (actualPaths) {

      const completePath = actualPaths[index] ? actualPaths[index].split('.') : null
      if (completePath) {
        parentPath = completePath.slice(0, (completePath.length - dropCount)).join('.');
      }
    }

    return (parentPath + '.' + remainderPath.join('.'));
  }

  private resolveParentPathValue(valuePath: string, actualPaths?: string[], data?: any) {
    
    const completePath = this.resolveParentPath(valuePath,  actualPaths);
    const value = get2(data, completePath.replace(this.pathIdentifier, ''));

    return value ? value : (value === null ? null : undefined);
  }

  private resolveElemPath(elemPath: string, parentPath: string[]): string {
    let index: number = 0;
    const splittedPath = elemPath.split('.');
    const matchedIndexes = splittedPath[0].match(/([0-9]+)/g);

    if (matchedIndexes) {
      index = parseInt(matchedIndexes[0]);
      return elemPath.replace(this.arrElem+`[${index}]`, parentPath[index]);
    }
    else{
      return elemPath.replace(this.arrElem, parentPath[index]);
    }
  }

  private resolveElemPathValue(valuePath: string, chunkData: any[]) {
    let index: number = 0;
    const splittedPath = valuePath.split('.');
    const matchedIndexes = splittedPath[0].match(/([0-9]+)/g);

    if (!matchedIndexes) {
      valuePath = valuePath.replace(this.arrElem, `${this.arrElem}[${index}]`)
    }

    const chunk = {
      $elem: chunkData
    }
    const value = get2(chunk, valuePath);
    
    return value ? value : (value === null ? null : undefined);
  }

  // @TODO: rename it
  private splitArrPaths(splittedPath: string[]) {
    let dropCount = 0;
    let remainderPath: string[] = [];
    splittedPath.forEach(part => {
      if (part === this.elemParent) {
        dropCount++;
      }
      else if (!part.includes(this.arrElem)) {
        remainderPath.push(part);
      }
    });

    return  { dropCount , remainderPath };
  }

  private loopPaths(pathsToLoopOver: string[], rawData: any): string[] {
    let allPaths: string[] = [];    

    pathsToLoopOver.forEach((path: string) => {
      const actualPaths = this.getActualPaths(path, rawData);
      allPaths = allPaths.concat(actualPaths);
    });

    return allPaths;
  }

  private getActualPaths(path: string, raw: any): string[] {
    let splittedPaths = path.split('.');
    const headPath = splittedPaths[0];

    let extractedPaths;

    try {
      extractedPaths = this.getRepeatedPaths(headPath, raw);
    } catch (e) {
      return [];
    }
    let tailPath = splittedPaths.slice(1);
    while (tailPath.length !== 0) {
      let concatedPaths: any[] = [];
      extractedPaths.forEach((headPath: any) => {
        try {
          const subExtractedPaths = this.getRepeatedPaths(`${headPath}.${tailPath[0]}`, raw);
          concatedPaths = concatedPaths.concat(subExtractedPaths);
        }
        catch (error) {
          return true; // continue loop
        }
      });

      extractedPaths = clone(concatedPaths);
      tailPath = tailPath.slice(1);
    }

    return extractedPaths;
  }

  private getRepeatedPaths(pathName: string, raw: any): string[] {

    const data = get2(raw, pathName.replace(this.pathIdentifier, ''));
    
    if (!data) {
      throw new Error(`Data at path ${pathName} is not an array`);
    }

    if (!Array.isArray(data)) {
      return [pathName];
    }

    return data.map((item, index) => pathName + "[" + index + "]");
  }

  private parsePaths (pathsNames: string[],  parentPath: string[]): string[] {
    let pathsArr: string[] = [];

    pathsNames.forEach(pathName => {
      if (pathName.includes(this.elemParent)) {
        pathsArr.push(this.resolveParentPath(pathName, parentPath));
      }
      else if (pathName.startsWith(this.arrElem)) { 
        pathsArr.push(this.resolveElemPath(pathName, parentPath));
      }
      else {
        pathsArr.push( pathName);
      }
    });    

    return pathsArr;
  } 
}
