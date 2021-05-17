import { describe, it } from 'mocha';
import chai, { expect } from 'chai';
import { StructureMapper } from './StructureMapper';

import constSchema from './testData/test-pdf-mapper/const-schema.json';
import basicForNode from './testData/test-pdf-mapper/basic-for-node.json';
import pushWithConditions from './testData/test-pdf-mapper/push-condition.json';
import condWithForAndPush from './testData/test-pdf-mapper/condition-for-push.json';
import valueConditionOne from './testData/test-pdf-mapper/value-condition.json';
import valueConditionUndef from './testData/test-pdf-mapper/undefined-val-cond.json';
import valueAsObj from './testData/test-pdf-mapper/value-as-object.json';
import mapValue from './testData/test-pdf-mapper/map-value.json';
import nestedSchemaArr from './testData/test-pdf-mapper/nested-schema-array.json';
import undefinedElemAccess from './testData/test-pdf-mapper/resolve-elem-and-parent-undefined.json';
import complexForloop from './testData/test-pdf-mapper/complex-loop-with-chunks.json';
import multiSchema from './testData/test-pdf-mapper/multi-schema.json';



import objToObj from './testData/arr-obj-functionality/object-to-object.json';
import objToNestedArr from './testData/arr-obj-functionality/obj-to-nested-arr.json';
import objToArr from './testData/arr-obj-functionality/obj-to-array.json';
import nestedArrToNormArr from './testData/arr-obj-functionality/nested-arr-to-normalized-arr.json';
import arrInArrToArrInArr from './testData/arr-obj-functionality/arr-within-arr-to-arr-within-arr.json';
import nestedObjWithNullArr from './testData/arr-obj-functionality/array-is-null-obj.json';
import nestedObjWithArrs from './testData/arr-obj-functionality/arr-in-nested-obj-to-arr.json';
import arrToArr from './testData/arr-obj-functionality/array-to-array-mapping.json';
import arrToPrimitive from './testData/arr-obj-functionality/arr-of-obj-to-arr-of-primitives.json';
import arrWithinArrParent from './testData/arr-obj-functionality/arr-within-arr-parent-access.json';
import arrWithinArrParentChunks from './testData/arr-obj-functionality/complex-arr-with-in-arr-parent-access.json';




import invalidPushCond from './testData/invalid-structures/invalid-push-condition.json';
import invalidSchemaKey from './testData/invalid-structures/invalid-schema-keys.json';
import invalidForPath from './testData/invalid-structures/invalid-arr-paths-in-for-loop.json';
import unsupportedOperators from './testData/invalid-structures/unsupported-operator.json';





describe('StructureMapper', () => {
  const StructureMapper = new StructureMapper({pathIdentifier:'@'});

  describe('map schema array , basic functionality', () => {

    it('should map schema with constants', () => {
      const mapped = StructureMapper.map({}, constSchema.schema);
      expect(mapped).to.deep.equal(constSchema.output);
    });

    it('should loop over push and generate mapped schemas', () => {
      let mapped = StructureMapper.map(basicForNode.source, basicForNode.schema);
      expect(mapped).to.deep.equal(basicForNode.output);
    });

    it('should map push if condition is true', () => {
      let mapped = StructureMapper.map(pushWithConditions.source, pushWithConditions.schema);
      
      expect(mapped).to.deep.equal(pushWithConditions.output);
    });

    it('should map array within arr to arr within arr with chunks', () => {
      const mapped = StructureMapper.map(complexForloop.source, complexForloop.schema);
      
      expect(JSON.parse(JSON.stringify(mapped))).to.deep.equal(complexForloop.output);
    });

    it('should map array within arr to arr within arr with parent access with chunks', () => {
      const mapped = StructureMapper.map(arrWithinArrParentChunks.source, arrWithinArrParentChunks.schema);
      
      expect(JSON.parse(JSON.stringify(mapped))).to.deep.equal(arrWithinArrParentChunks.output);
    });

    it('should map push n times if conditions result true', () => {
      let mapped = StructureMapper.map(condWithForAndPush.source, condWithForAndPush.schema);      
      expect(mapped).to.deep.equal(condWithForAndPush.output);
    });

    it('should map eval conditions on value level', () => {
      let mapped = StructureMapper.map(valueConditionOne.source, valueConditionOne.schema);
      
      expect(mapped).to.deep.equal(valueConditionOne.output);
    });

    it('should map eval conditions on value level and return undefined if no cond is true', () => {
      let mapped = StructureMapper.map(valueConditionUndef.source, valueConditionUndef.schema);
      expect(mapped[0].data.name).to.be.undefined;
    });

    it('should eval value as object', () => {
      let mapped = StructureMapper.map(valueAsObj.source, valueAsObj.schema);
      
      expect(mapped).to.deep.equal(valueAsObj.output);
    });

    it('Should map value object correctly', () => {
      const mapped = StructureMapper.map(mapValue.source, mapValue.schema);
      expect(mapped).to.deep.equal(mapValue.output);
    });

    it('Should map nested schema array', () => {
      const mapped = StructureMapper.map(nestedSchemaArr.source, nestedSchemaArr.schema);
      expect(mapped).to.deep.equal(nestedSchemaArr.output);
    });

    it('Should map multiple schema', () => {
      const mapped = StructureMapper.map(multiSchema.source, multiSchema.schema);      
      expect(mapped).to.deep.equal(multiSchema.output);
    });
  });

  describe('old sharp mapper functionality', () => {
    it('should map object-to-object', () => {
      const mapped = StructureMapper.map(objToObj.source, objToObj.schema);      
      expect(mapped).to.deep.equal(objToObj.output);
    });

    it('should map object-to-nested-arr', () => {
      const mapped = StructureMapper.map(objToNestedArr.source, objToNestedArr.schema);      
      expect(mapped).to.deep.equal(objToNestedArr.output);
    });

    it('should map object-to-arr', () => {
      const mapped = StructureMapper.map(objToArr.source, objToArr.schema);      
      expect(mapped).to.deep.equal(objToArr.output);
    });

    it('should map nested arrays to normalized array', () => {
      const mapped = StructureMapper.map(nestedArrToNormArr.source, nestedArrToNormArr.schema);
        
      expect(mapped).to.deep.equal(nestedArrToNormArr.output);
    });

    it('should map array within arr to arr within arr', () => {
      const mapped = StructureMapper.map(arrInArrToArrInArr.source, arrInArrToArrInArr.schema);
      expect(mapped).to.deep.equal(arrInArrToArrInArr.output);
    });

    it('should work if one of the arrays to be mapped is null', () => {
      const mapped = StructureMapper.map(nestedObjWithNullArr.source, nestedObjWithNullArr.schema);      
      expect(mapped).to.deep.equal(nestedObjWithNullArr.output);
    });

    it('should map arrays in nested objects to one array of objects', () => {
      const mapped = StructureMapper.map(nestedObjWithArrs.source, nestedObjWithArrs.schema);      
      expect(mapped).to.deep.equal(nestedObjWithArrs.output);
    });

    it('should map array of objects to another array of objects', () => {
      const mapped = StructureMapper.map(arrToArr.source, arrToArr.schema);      
      expect(mapped).to.deep.equal(arrToArr.output);
    });

    it('should map array of objects to another array of primitives', () => {
      const mapped = StructureMapper.map(arrToPrimitive.source, arrToPrimitive.schema);      
      expect(mapped).to.deep.equal(arrToPrimitive.output);
    });

    it('should access array element\'s parent (which is arr) and loop over it', () => {
      const mapped = StructureMapper.map(arrWithinArrParent.source, arrWithinArrParent.schema);      
      expect(mapped).to.deep.equal(arrWithinArrParent.output);
    });
    
    // @TODO : remove undefined could be tested here
    it('should return undefined if property not found', () => {
      const mapped = StructureMapper.map(undefinedElemAccess.source, undefinedElemAccess.schema);  
                  
      expect(mapped[0].data).instanceOf(Array);
      expect(mapped[0].data[0].cname).to.be.undefined;
      expect(mapped[0].data[0].parentVin).to.be.undefined;
    });
  });

  describe('Errors testing', () => {
    it('Should throw error, if push cond is in correct', () => {
      expect(() => StructureMapper.map({}, invalidPushCond.schema)).to.throw('Usage: PushCondition object only contain onr key: [ { operator: [] | str } ].');
    });

    it('Should throw error, if schema keys are invalid (if push not found)', () => {
      expect(() => StructureMapper.map({}, invalidSchemaKey.schema)).to.throw('Invalid Schema Structure.');
    });

    it('Should throw error internally, path given to for loop is incorrect, and return empty array', () => {
      const mapped = StructureMapper.map(invalidForPath.source, invalidForPath.schema);
      expect(mapped).instanceOf(Array).and.is.empty;
    });

    it('Should throw error, if condition obj has unsupported operator', () => {
      expect(() => StructureMapper.map(unsupportedOperators.source, unsupportedOperators.schema))
        .to
        .throw('unsupportedOperator is not supported. Supported Operators are :\n[ isNumber,equal,notEqual,gt,lt,or,and,exist,notExist ].');
    });
  });
});