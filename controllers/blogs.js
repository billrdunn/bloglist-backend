const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {

  // Note difference between async/await syntax...
  const blogs = await Blog.find({})
  response.json(blogs)

  // ... and using 'then':
  // Blog
  //   .find({})
  //   .then(blogs => {
  //     response.json(blogs)
  //   })
})

blogsRouter.post('/', async (request, response, next) => {

  const blog = new Blog(request.body)

  if (!blog.title && !blog.url) {
    response.status(400).end()
  }

  const result = await blog.save()
  response.status(201).json(result)

  // Note that because of the express-async-errors library
  // which eliminates the need for try/catch and next,
  // what is actually being performed under the hood is this:

  // try {
  //   const blog = new Blog(request.body)
  //   const result = await blog.save()
  //   response.status(201).json(result)
  // }
  // catch (error) {
  //   next(error)
  // }
})

blogsRouter.get('/:id', async (request, response, next) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogsRouter.delete('/:id', async (request, response, next) => {
  await Blog.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

module.exports = blogsRouter