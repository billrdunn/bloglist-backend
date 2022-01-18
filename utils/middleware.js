const logger = require('./logger')
const jwt = require('jsonwebtoken')
const User = require('../models/user')


const requestLogger = (request, response, next) => {
  logger.info('Method: ', request.method)
  logger.info('Path:   ', request.path)
  logger.info('Body:   ', request.body)
  logger.info('---')
  
  // yield control to next middleware
  next()
}
  
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
  
// Express error handlers are middleware that are defined with a function
// that accepts four parameters
const errorHandler = (error, request, response, next) => {
  // TIP: when dealing with promises, always add error and exception handling 
  // and print the object that caused the exception to the console
  logger.error('Error!', error.message)
  
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }
  if (error.name === 'JsonWebTokenError') {
    return response.status(401).send({ error: 'invalid token' })
  }
  
  next(error)
  return null
}

const tokenExtractor = (request, response, next) => {
  const authorisation = request.get('authorization')
  if (authorisation && authorisation.toLowerCase().startsWith('bearer ')) {
    request.token = authorisation.substring(7)
  } 

  next()
}

const userExtractor = async (request, response, next) => {
  const token = request.token
  if (!token) {
    return response.status(401).json({error: 'token is null'})
  }
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({error: 'token missing or invalid'})
  }
  const user = await User.findById(decodedToken.id)
  if (!user) {
    return response.status(400).json({error: 'user could not be found matching token in request'})
  }

  request.user = user

  next()
}
  
module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor
}