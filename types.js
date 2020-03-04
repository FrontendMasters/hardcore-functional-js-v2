const Last = x =>
({
  x,
  concat: o => o
})

// const Fn = f =>
// ({
//   runFn: f,
//   map: g => Fn(x => g(f(x))),
//   concat: o =>
//     Fn(x => f(x).concat(o.runFn(x)))
// })


const Reducer = run =>
({
    run,
    concat: other => Reducer((acc, x) => other.run(run(acc, x), x)),
    contramap: f => Reducer((acc, x) => run(acc, f(x))),
    map: f => Reducer((acc, x) => f(run(acc, x)))
})

const Id = x =>
({
  map:f => Id(f(x)),
  chain:f => f(x),
  extract: () => x,
  concat: (o) => Id(x + o.extract())
})
Id.of = x => Id(x)

const IO = run =>
({
  run,
  map: f => IO(() => f(run())),
  chain: f => IO(() => f(run()).run()),
  concat: other => IO(() => run().concat(other.run()))
})
IO.of = x => IO(() => x)

const Fn = g =>
({
  map: f =>
    Fn(x => f(g(x))),
  chain: f =>
    Fn(x => f(g(x)).run(x)),
  concat: other =>
    Fn(x => g(x).concat(other.run(x))),
  run: g
})
Fn.ask = Fn(x => x)
Fn.of = x => Fn(() => x)

const FnT = M => {
  const Fn = g =>
	({
	  map: f =>
		  Fn(x => g(x).map(f)),
	  chain: f =>
  		Fn(x => g(x).chain(y => f(y).run(x))),
    concat: other =>
      Fn(x => g(x).concat(other.run(x))),
	  run: g
	})
  Fn.ask = Fn(x => M.of(x))
  Fn.of = x => Fn(() => M.of(x))
  Fn.lift = x => Fn(() => x)
  return Fn
}

const Either = (() => {
	const Right = x =>
	({
	  chain: f => f(x),
	  ap: other => other.map(x),
	  alt: other => Right(x),
	  extend: f => f(Right(x)),
	  concat: other =>
		other.fold(x => other,
				   y => Right(x.concat(y))),
	  traverse: (of, f) => f(x).map(Right),
	  map: f => Right(f(x)),
	  fold: (_, g) => g(x),
	  toString: () => `Right(${x})`
	})

	const Left = x =>
	({
	  chain: _ => Left(x),
	  ap: _ => Left(x),
	  extend: _ => Left(x),
	  alt: other => other,
	  concat: _ => Left(x),
	  traverse: (of, _) => of(Left(x)),
	  map: _ => Left(x),
	  fold: (f, _) => f(x),
	  toString: () => `Left(${x})`
	})

	const of = Right;
	const tryCatch = f => {
		try {
			return Right(f())
		} catch(e) {
			return Left(e)
		}
	}
	
	const fromNullable = x =>
		x != null ? Right(x) : Left(x)
	
	return {Right, Left, of, tryCatch, fromNullable }
})()

const EitherT = M => {
    const Right = mx =>
        ({
            extract: () => mx,
            chain: f => Right(mx.chain(x => f(x).extract())),   
            map: f => Right(mx.map(f)),
            fold: (_, g) => g(mx)
        })

    const Left = mx =>
        ({
            chain: _ => Left(mx),
            map: _ => Left(mx),
            fold: (h, _) => h(mx)
        })

    const of = x => Right(M.of(x))
    const tryCatch = f => {
        try {
            return Right(M.of(f()))
        } catch(e) {
            return Left(e)
        }
    }

    const lift = Right

    return {of, tryCatch, lift, Right, Left }
}

const Task = fork =>
({
	fork,
  ap: other =>
	  Task((rej, res) => fork(rej, f => other.fork(rej, x => res(f(x))))),
	map: f =>
	  Task((rej, res) => fork(rej, x => res(f(x)))),
  chain: f =>
	  Task((rej, res) => fork(rej, x => f(x).fork(rej, res))),
  concat: other =>
	  Task((rej, res) => fork(rej, x => other.fork(rej, y => {
      console.log('X',x, 'Y', y)
      res(x.concat(y))
    }))),
  fold: (f, g) =>
	  Task((rej, res) => fork(x => f(x).fork(rej, res), x => g(x).fork(rej, res)))
})
Task.of = x => Task((rej, res) => res(x))
Task.rejected = x => Task((rej, res) => rej(x))
Task.fromPromised = fn => (...args) => Task((rej, res) => fn(...args).then(res).catch(rej))

const TaskT = M => {
	const Task = fork =>
	({
		fork,
		map: f =>
		  Task((rej, res) => fork(rej, mx => res(mx.map(f)))),
		chain: f =>
		  Task((rej, res) =>
			   fork(rej, mx =>
					mx.chain(x => f(x).fork(rej, res))))
	})
	Task.lift = x => Task((rej, res) => res(x))
	Task.of = x => Task((rej, res) => res(M.of(x)))
	Task.rejected = x => Task((rej, res) => rej(x))

	return Task
}

const State = run => ({
    run,
    chain: f =>
      State(x => {
        const [y, s] = run(x);
        return f(y).run(s)
      }), 
    map: f =>
      State(x => {
        const [y, s] = run(x);
        return [f(y), s];
      }),
    concat: other =>
      State(x => {
        const [y, s] = run(x);
        const [y1, _s1] = other.run(x);
        return [y.concat(y1), s];
      })
  });

  State.of = x => State(s => [x, s])
  State.get = State(x => [x, x])
  State.modify = f => State(s => [null, f(s)])
  State.put = x => State(s => [null, x])

const StateT = M => {
    const State = run => ({
        run,
        chain: f =>
          State(x => run(x).chain(([y, s]) => f(y).run(s))), 
        map: f =>
          State(x => run(x).map(([y, s]) => [f(y), s])),
        concat: other =>
          State(x =>
              run(x).chain(([y, s]) =>
                other.run(x).map(([y1, s1]) =>
                  [y.concat(y1), s]
                )
              )
          )
    });

    State.lift = m => State(s => m.map(x => [x, s]))
    State.of = x => State(s => M.of([x, s]))
    State.get = State(x => M.of([x, x]))
    State.modify = f => State(s => M.of([null, f(s)]))
    State.put = x => State(s => M.of([null, x]))

    return State
}


module.exports = {Id, Task, TaskT, State, StateT, Last, Fn, FnT, Either, EitherT, IO, Reducer}