const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const Blog = require('../models/blog')
const bcrypt = require('bcrypt')
const User = require('../models/user')


beforeEach(async () => {

  // Remove all blogs
  await Blog.deleteMany({})

  // Create an array of new (Mongoose) blog objects
  const blogObjects = await helper.initialBlogs
    .map(blog => new Blog(blog))

  // Create an array of promises
  const promiseArray = blogObjects.map(blog => blog.save())

  // Transform an array of promises into a single promise
  // which is fulfilled when every individual promise is resolved 
  await Promise.all(promiseArray)

  // Note that we can access the returned values for each promise
  // in the array using "results = await Promise.all(promiseArray)"

  // Note Promise.all executes in parallel, so the promises may not be
  // executed in order. Using a "for... of" block instead 
  // will guarantee specific execution order.
})

// Wrap the imported application with the supertest function
// to make a superagent object
const api = supertest(app)

test('blogs are returned as json', async () => {
  await api
    // make HTTP GET request
    .get('/api/blogs')
    // expect status code 200
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  // this is executed only after await HTTP request is complete
  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('a specific blog title is within the returned blogs', async () => {
  const response = await api.get('/api/blogs')

  const titles = response.body.map(r => r.title)

  expect(titles).toContain('This is a blog title')
})

test('a valid blog can be added', async () => {

  const users = await helper.usersInDb()

  const newBlog = {
    title: 'new blog',
    author: 'new author',
    url: 'new url',
    likes: 1,
    userId: users[0].id
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  const titles = blogsAtEnd.map(r => r.title)

  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
  expect(titles).toContain('new blog')
})

test('a blog with no title is not added', async () => {
  const users = await helper.usersInDb()

  const newBlog = {
    author: 'new author',
    url: 'new url',
    likes: 1,
    userId: users[0].id
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()

  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
})

test('a specific blog can be viewed', async () => {
  const blogsAtStart = await helper.blogsInDb()

  const blogToView = blogsAtStart[0]

  const resultBlog = await api
    .get(`/api/blogs/${blogToView.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/)
  const processedBlogToView = JSON.parse(JSON.stringify(blogToView))

  expect(resultBlog.body).toEqual(processedBlogToView)
})

test('a blog can be deleted', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)
  const blogsAtEnd = await helper.blogsInDb()

  expect(blogsAtEnd).toHaveLength(
    helper.initialBlogs.length - 1
  )

  const titles = blogsAtEnd.map(r => r.title)

  expect(titles).not.toContain(blogToDelete.title)
})

test('verify that blogs contain an id parameter', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body[0].id).toBeDefined()
})

test('if a blog is added with the likes property missing, it will default to zero', async () => {
  const users = await helper.usersInDb()

  const newBlog = {
    title: 'new blog',
    author: 'new author',
    url: 'new url',
    userId: users[0].id
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  const titles = blogsAtEnd.map(r => r.title)
  expect(titles).toContain('new blog')

  const addedBlog = blogsAtEnd.find(blog => blog.title === 'new blog')
  expect(addedBlog.likes).toEqual(0)
})

test('if a blog is posted with no title or url the response is status 400', async () => {
  const users = await helper.usersInDb()

  const newBlog = {
    author: 'new author',
    likes: 23,
    userId: users[0].id
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

test('a blog can be updated to have a new number of likes', async () => {
  const blogsAtStart = await helper.blogsInDb()
  
  const newBlog = {
    title: blogsAtStart[0].title,
    author: blogsAtStart[0].author,
    url: blogsAtStart[0].url,
    likes: blogsAtStart[0].likes + 1,
    id: blogsAtStart[0].id
  }

  await api
    .put(`/api/blogs/${newBlog.id}`)
    .send(newBlog)
    .expect(200)

  const blogsAtEnd = await helper.blogsInDb()

  expect(blogsAtEnd[0].likes).toEqual(blogsAtStart[0].likes + 1)

})

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })
  
  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
})