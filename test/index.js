
var assert = require('assert');
var byeDot = require('..');

describe('ember-replace-extensions', function() {
  describe('convert(code String) String', function() {
    const { convert } = byeDot;
  
    it('should return code with no property changes needed', function() {
      const plainFunc = `function test() {}`;
      const plainFuncWithProperyWord = `function test() { var property = 1; }`;
      const plainFuncWithOtherDot = `function test() { var property = 1; }.property`;

      assert.equal(convert(plainFunc), plainFunc);
      assert.equal(convert(plainFuncWithProperyWord), plainFuncWithProperyWord);
      assert.equal(convert(plainFuncWithOtherDot), plainFuncWithOtherDot);
    });

    it('should modify .property to Ember.computed', function() {
      const badFunc = 'function() { ... }.property(...)';
      const goodFunc = 'Ember.computed(..., function() { ... })';
      assert.equal(convert(badFunc), goodFunc);

      const badFun = `
        function(foo, bar) {
          return doSomething(foo, bar);
        }.property(bin, baz);
      `;

      const goodFun = `
        Ember.computed(bin, baz, function(foo, bar) {
          return doSomething(foo, bar);
        });
      `;
      assert.equal(convert(badFun), goodFun);
    });

  });

  describe('followBack(start Char, end Char, source String, index Int) Int', () => {
    const { followBack } = byeDot;

    it('should go to the correct start of a block', () => {
      const emptyBlock = '{}';
      assert.equal(followBack('{', '}', emptyBlock, 1), 0);

      const spacedBlock = '  {      }    ';
      assert.equal(followBack('{', '}', spacedBlock, 9), 2);

      const nestedBlock = '{ { {} , {} }}';
      assert.equal(followBack('{', '}', nestedBlock, 13), 0);
    });
  });

  describe('followForward(start Char, end Char, source String, index Int) Int', () => {
    const { followForward } = byeDot;

    it('should go to the correct end of a block', () => {
      const emptyBlock = '{}';
      assert.equal(followForward('{', '}', emptyBlock, 0), 1);

      const spacedBlock = '  {      }    ';
      assert.equal(followForward('{', '}', spacedBlock, 2), 9);

      const nestedBlock = '{ { {} , {} }}';
      assert.equal(followForward('{', '}', nestedBlock, 0), 13);
    });
  });

  describe('funcNameBefore(source String, index Int) Int', () => {
    const { funcNameBefore } = byeDot;

    it('should go to the beginning for the function expression', () => {
      const anonymousFunc = 'function () ';
      assert.equal(funcNameBefore(anonymousFunc, anonymousFunc.length), 0);

      const namedFunc = 'function test() ';
      assert.equal(funcNameBefore(namedFunc, namedFunc.length), 0);

      const trickNamedFunc = 'function functionTrick() ';
      assert.equal(funcNameBefore(trickNamedFunc, trickNamedFunc.length), 0);

      const nestedFunc = 'function() { function foo()';
      assert.equal(funcNameBefore(nestedFunc, nestedFunc.length), 13);
      return;

    });
  });

});

