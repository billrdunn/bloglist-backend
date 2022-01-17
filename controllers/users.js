const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response, next) => {

  const body = request.body
  
  if (body.password.length < 4) {
    throw new Error('password must be minimum 3 characters')
  }
    
  else {
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)
    
    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash,
    })
    
    const savedUser = await user.save()
    
    response.json(savedUser)
  }
  
})

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', {title : 1, likes: 1})
  response.json(users)
})

module.exports = usersRouter