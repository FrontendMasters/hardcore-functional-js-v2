const {Task} = require('../types')

const testUser = {id: 2, name: 'user1'}

const Db = ({
  find: _id =>
    Task((rej, res) => res(testUser))
})

Db.find(3)
.fork(console.log, console.log)
