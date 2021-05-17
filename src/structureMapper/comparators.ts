import { exists } from "fs";

export const comparators: any = {

  isNumber(value: any) {
    return typeof value === 'number' && isFinite(value);
 },

  equal(firstValue: any, secondValue: any) {
    if (firstValue && secondValue) {
      return firstValue.toString() === secondValue.toString();
    }
  },

  notEqual(firstValue: any, secondValue: any) {
    if (firstValue && secondValue) {
      return firstValue.toString() !== secondValue.toString();
    }
  },

  gt(firstValue: any, secondValue: any) {
    let result;
    firstValue = parseInt(firstValue);
    secondValue = parseInt(secondValue);

    if (this.isNumber(firstValue) && this.isNumber(secondValue)) {
      result = firstValue > secondValue;
    } else {
      result = null;
    }

    return result;
  },

  lt(firstValue: any, secondValue: any) {
    let result;
    firstValue = parseInt(firstValue);
    secondValue = parseInt(secondValue);

    if (this.isNumber(firstValue) && this.isNumber(secondValue)) {
      result = firstValue < secondValue;
    } else {
      result = null;
    }

    return result;
  },

  // @TODO : should take array and `or` between them.
  or(firstValue: any, secondValue: any): boolean {
    if (firstValue || secondValue) {
      return true;
    }
    else{
      return false;
    }
  },

  // @TODO : should take array and `and` between them.
  and(firstValue: any, secondValue: any): boolean {
    if (firstValue && secondValue) {
      return true;
    }
    else{
      return false;
    }
  },

  // @TODO : enhance impl., to accept array
  exist(value: any){
    return value !== undefined;
  },

  // @TODO : enhance impl., to accept array
  notExist(value: any) {
    return value === undefined;
  }
};
