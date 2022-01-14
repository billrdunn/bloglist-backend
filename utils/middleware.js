const logger = require('./logger')

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
    logger.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    }
    if (error.name === 'ValidationError') {
      return response.status(400).send({ error: error.message })
    }
  
    next(error)
    return null
  }
  
  module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler,
  }