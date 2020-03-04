const {curry} = require('ramda')

const add = (x, y) => x + y

// const curry = f =>
//   x => y => f(x, y)

const modulo = curry((x, y) => y % x)

const isOdd = modulo(2)  // (2, y) => 2 % y


const filter = curry((f, xs) => xs.filter(f))

const getOdds = filter(isOdd)

const replace = curry((regex, replacement, str) =>
  str.replace(regex, replacement)
)

const replaceVowels = replace(/[AEIOU]/ig, '!')

const result = replaceVowels('Hey I have words')

console.log(result)
