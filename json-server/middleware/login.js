module.exports = async (req, res, next) => {
  function error(message = 'Unknown error') {
    res.status(400).json({ message });
  }


  if(req.method == 'POST' && req.path == '/login/') {
    if(typeof req.body.name !== 'undefined' && req.body.name !== '') {
      const { db } = req.app;
      if(!db) {
        throw new Error('Lowdb not found');
      }

      let { name, token } = req.body;
    
      const usersDb = db.get('users');
      const users = usersDb.filter({ token }).value();

      let user = null;
      console.log(`old: ${JSON.stringify({ token, name })}`);

      if(!token) {
        token = makeToken();
      }
      console.log(`new: ${JSON.stringify({ token, name })}`);
      console.log(users);

      const newUser = makeUser.bind(usersDb, name, token);

      if(users.length > 0) {
        const sameNameAccounts = users.filter(({ name: n }) => name === n);
        user = sameNameAccounts.length > 0 ? sameNameAccounts[0] : await newUser();
      } else {
        user = await newUser();
      }

      console.log(user);

      if(!user) {
        error();
      } else {
        res.status(200).json(user);
      }
    } else {
      error('Name not specified');
    }
  } else {
    next();
  }
}

async function makeUser(name = '', token = '') {
  if(name === '' || token === '') {
    throw new Error('No name or token specified');
  }
  return await this
    .insert({ name, token })
    .write()
}

function makeToken() {
  return (+new Date()).toString(16)
}
