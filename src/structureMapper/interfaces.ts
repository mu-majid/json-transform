import { CONCAT } from './constants';

export interface IPush {
  key: string,
  data: any,
  pages: Array<number>
}

export interface IFor {
  path: Array<string> | string;
  start?: number;
  end?: number;
  count?: number;
}

export interface IValueCondition {
  [operator: string]: Array<any>;
  value: any;
}

export interface IPushCondition {
  [operator: string]: Array<any>
}

export interface IValueNode {
  concat: Array<string>;
  format?: string
}

export interface INode {
  push: IPush;
  for?: IFor;
  conditions?: Array<IPushCondition>
}
