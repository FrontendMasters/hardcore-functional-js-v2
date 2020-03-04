const toUpper = x => x.toUpperCase()
const exclaim = x => x + '!'

const compose = (f, g) => x => f(g(x))

const res = compose(exclaim, toUpper)
console.log(res('hi'))