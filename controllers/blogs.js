const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken');

blogsRouter.get('/', async (request, response) => {

  // Note difference between async/await syntax...
  const blogs = await Blog.find({}).populate('user', {username : 1, name: 1})
  response.json(blogs)

  // ... and using 'then':
  // Blog
  //   .find({})
  //   .then(blogs => {
  //     response.json(blogs)
  //   })
})

blogsRouter.post('/', async (request, response, next) => {
  
  const body = request.body
  const token = request.token
  if (!token) {
    return response.status(401).json({error: 'token is null'})
  }
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({error: 'token missing or invalid'})
  }

  const user = await User.findById(decodedToken.id)
  
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id
  })
  
  if (!blog.title && !blog.url) {
    return response.status(400).json({error: 'both blog title and URL are missing'})
  }

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  
  response.json(savedBlog)
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
  const token = request.token
  if (!token) {
    return response.status(401).json({error: 'token is null'})
  }
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({error: 'token missing or invalid'})
  }

  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(400).json({error: 'requested blog to delete does not exist'})
  }
  const user = await User.findById(decodedToken.id)
  if (!user) {
    return response.status(400).json({error: 'user could not be found matching token in request'})
  }

  if (blog.user.toString() === user.id.toString()) {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } else {
    return response.status(401).json({error: 'user is not able to delete this blog'})
  }

})

blogsRouter.put('/:id', async (request, response, next) => {
  const { body } = request

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  // { new: true } is required so that the event handler is called with
  // the new modified document instead of the original
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  response.json(updatedBlog)
})

module.exports = blogsRouter