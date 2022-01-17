const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: 'This is a blog title',
    author: 'William Dunn',
    url: 'https://blah.com',
    likes: 123
  },
  {
    title: 'Meaningless title',
    author: 'Harriet Jones',
    url: 'https://whut.com',
    likes: 456
  },
]

// Create a database object ID that does not belong to 
// any note object in the database
const nonExistingTitle = async () => {
  const blog = new Blog({ 
    title: 'blah1',
    author: 'blah2',
    url: 'blah3',
    likes: 100
  })
  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(b => b.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}
  
module.exports = {
  initialBlogs,
  nonExistingTitle,
  blogsInDb,
  usersInDb,
}

