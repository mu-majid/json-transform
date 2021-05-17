import { describe, it } from 'mocha';
import chai, { expect } from 'chai';
import { comparators } from './comparators';

describe('comparators', () => {
  describe('isNumber', () => {
    it('Should check if value given is number', () => {
      let res = comparators.isNumber(15);
      expect(res).to.be.true;
      res = comparators.isNumber("15");
      expect(res).to.be.false;
      res = comparators.isNumber(Infinity);
      expect(res).to.be.false;
    });
  });

  describe('equal', () => {
    it('Should check if 1st value === 2nd value', () => {
      let res = comparators.equal(15, "15");
      expect(res).to.be.true;
      res = comparators.equal("15", "5");
      expect(res).to.be.false;
      res = comparators.equal("10", true);
      expect(res).to.be.false;
      res = comparators.equal("string test", "string test");
      expect(res).to.be.true;
      res = comparators.equal([1,2,3], [1,2,3]);
      expect(res).to.be.true;
      res = comparators.equal({one:1}, {one:1});
      expect(res).to.be.true;
    });
  });

  describe('notEqual', () => {
    it('Should check if 1st value !== 2nd value', () => {
      let res = comparators.notEqual(15, "15");
      expect(res).to.be.false;
      res = comparators.notEqual("15", "5");
      expect(res).to.be.true;
      res = comparators.notEqual("10", true);
      expect(res).to.be.true;
      res = comparators.notEqual("string test", "string test");
      expect(res).to.be.false;
      res = comparators.notEqual([1,2,3], [1,2,3]);
      expect(res).to.be.false;
      res = comparators.notEqual({one:1}, {one:1});
      expect(res).to.be.false;
    });
  });

  describe('gt', () => {
    it('Should check if 1st value > 2nd value, otherwise return null', () => {
      let res = comparators.gt(15, "15");
      expect(res).to.be.false;
      res = comparators.gt("15", "5");
      expect(res).to.be.true;
      res = comparators.gt("10", true);
      expect(res).to.be.null;
      res = comparators.gt("string test", "string test");
      expect(res).to.be.null;
      res = comparators.gt([1,2,3], [1,2,3]);
      expect(res).to.be.false;
      res = comparators.gt({one:1}, {one:1});
      expect(res).to.be.null;
    });
  });

  describe('lt', () => {
    it('Should check if 1st value < 2nd value, otherwise return null', () => {
      let res = comparators.lt(15, "15");
      expect(res).to.be.false;
      res = comparators.lt("15", "5");
      expect(res).to.be.false;
      res = comparators.lt("1", 5);
      expect(res).to.be.true;
      res = comparators.lt("10", true);
      expect(res).to.be.null;
      res = comparators.lt("string test", "string test");
      expect(res).to.be.null;
      res = comparators.lt([1,2,3], [1,2,3]);
      expect(res).to.be.false;
      res = comparators.lt({one:1}, {one:1});
      expect(res).to.be.null;
    });
  });

  describe('or', () => {
    it('Should eval (1st val || 2nd val)', () => {
      let res = comparators.or(false, true);
      expect(res).to.be.true;
      res = comparators.or(true, true);
      expect(res).to.be.true;
      res = comparators.or('string', 50);      
      expect(res).to.be.true;
      res = comparators.or(0, false);
      expect(res).to.be.false;
      res = comparators.or('', 5);
      expect(res).to.be.true;
    });
  });

  describe('and', () => {
    it('Should eval (1st val && 2nd val)', () => {
      let res = comparators.and(false, true);
      expect(res).to.be.false;
      res = comparators.and(true, true);
      expect(res).to.be.true;
      res = comparators.and('string', 50);      
      expect(res).to.be.true;
      res = comparators.and(0, false);
      expect(res).to.be.false;
      res = comparators.and('', 5);
      expect(res).to.be.false;
    });
  });

  describe.skip('exist', () => {
    it('Should check property exist on object', () => {
      let res = comparators.exist("consent", {consent: true});
      expect(res).to.be.true;
      res = comparators.exist("consent", {consent: false});
      expect(res).to.be.true;
      res = comparators.exist("consent", {consent: null});
      expect(res).to.be.true;
      res = comparators.exist("consent", {consent: undefined});
      expect(res).to.be.true;
      res = comparators.exist("consent", {one: true});      
      expect(res).to.be.false;
    });
  });

  describe.skip('notExist', () => {
    it('Should check property exist on object', () => {
      let res = comparators.notExist("consent", {consent: true});
      expect(res).to.be.false;
      res = comparators.notExist("consent", {consent: false});
      expect(res).to.be.false;
      res = comparators.notExist("consent", {consent: null});
      expect(res).to.be.false;
      res = comparators.notExist("consent", {consent: undefined});
      expect(res).to.be.false;
      res = comparators.notExist("consent", {one: true});      
      expect(res).to.be.true;
    });
  });
});