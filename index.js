
function convert(code) {
  let result = code;
  result = cyclePasses(computedPass, result);
  result = cyclePasses(observesPass, result);
  result = cyclePasses(onPass, result);
  return result;
}

function cyclePasses(pass, code) {
  let result = null;
  while(result !== code) {
    code = result || code;
    result = pass(code);
  }
  return result;
}

function genericPass(code, method, rewrite) {
  const snippet = `}.${method}(`;
  const index = code.indexOf(snippet);
  if(index === -1) return code;

  const blockEnd = index;
  const argsStart = index + snippet.length - 1;

  const blockStart = followBack('{', '}', code, blockEnd);
  const argsEnd = followForward('(', ')', code, argsStart);

  const funcStart = funcNameBefore(code, blockStart);

  const funcBlock = code.substring(funcStart, blockEnd + 1);
  const argsBlock = code.substring(argsStart, argsEnd + 1);
  const freeArgs = argsBlock.slice(1, -1);

  const computed = rewrite(freeArgs, funcBlock);

  const formerCode = code.slice(0, funcStart);
  const latterCode = code.slice(argsEnd + 1);

  return formerCode + computed + latterCode;
}

function computedPass(code) {
  return genericPass(code, 'property', (args, func) => {
    return args.length
      ? `Ember.computed(${args}, ${func})`
      : `Ember.computed(${func})`; 
  });
}

function observesPass(code) {
  return genericPass(code, 'observes', (args, func) => {
    return `Ember.observer(${args}, ${func})`;
  });
}

function onPass(code) {
  return genericPass(code, 'on', (args, func) => {
    return `Ember.on(${args}, ${func})`;
  });
}

function followBack(begin, end, source, index) {
  if(source.charAt(index) !== end) {
    throw new Error('index misplacement');
  }

  let depth = 1;

  while(depth && index > 0) {
    index = index - 1;
    const char = source.charAt(index);
    if(char === begin) depth--;
    if(char === end) depth++;
  }

  if(depth !== 0) {
    throw new Error(`${begin}...${end} mismatch @ "${source}"`);
  }

  return index;
}

function followForward(begin, end, source, index) {
  if(source.charAt(index) !== begin) {
    throw new Error('index misplacement');
  }

  const len = source.length;
  let depth = 1;

  while(depth && index < len) {
    index = index + 1;
    const char = source.charAt(index);
    if(char === begin) depth++;
    if(char === end) depth--;
  }

  if(depth !== 0) {
    throw new Error(`${begin}...${end} mismatch @ "${source}"`);
  }

  return index;
}

function funcNameBefore(source, index) {
  if(index < 0) return -1;
  const formerSource = source.slice(0, index);
  const keyword = 'function';
  const start = formerSource.lastIndexOf(keyword);
  if(start === -1) {
    throw new Error('`function` keyword not found before "'+formerSource+'"');
  }

  const prevChar = source.charAt(start - 1);
  const nextChar = source.charAt(start + keyword.length);

  if(isSafeChar(prevChar) && isSafeChar(nextChar)) return start;
  return funcNameBefore(source, start - 1);
}

function isSafeChar(char) {
  if(!char) return true;
  if(char === ' ') return true;
  if(char === '(') return true;
  return false;
}

module.exports = {
  convert,
  computedPass,
  observesPass,
  onPass,
  followBack,
  followForward,
  funcNameBefore,
};

