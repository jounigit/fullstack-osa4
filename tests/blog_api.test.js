const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')

const initialBlogs = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7
  },
  {
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12
  }
]

beforeAll(async () => {
  await Blog.remove({})

  const blogObjects = initialBlogs.map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

// test all blogs
test('all blogs are returned', async () => {
  const response = await api
    .get('/api/blogs')

  expect(response.body.length).toBe(initialBlogs.length)
})

// test a specific blog
test('a specific blog is within the returned blogs', async () => {
  const response = await api
    .get('/api/blogs')

  const contents = response.body.map(r => r.title)

  expect(contents).toContain('Canonical string reduction')
})

// test a specific blog
test('a specific blog can be viewed', async () => {
  const resultAll = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const aBlogFromAll = resultAll.body[0]
  const blogId = aBlogFromAll._id

  const resultBlog = await api
    .get(`/api/blogs/${blogId}`)

  console.log('ID:::: ', aBlogFromAll._id)

  const blogObject = resultBlog.body

  expect(blogObject).toEqual(aBlogFromAll)
})

// Test adding
test('a valid blog can be added ', async () => {
  const newBlog = {
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const response = await api
    .get('/api/blogs')

  const contents = response.body.map(r => r.title)

  expect(response.body.length).toBe(initialBlogs.length + 1)
  expect(contents).toContain('TDD harms architecture')
})

// Test adding without title and url
test('blog without title and url is not added ', async () => {
  const newBlog = {
    author: 'Robert C. Martin',
    likes: 0
  }

  const initialBlogs = await api
    .get('/api/blogs')

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  const response = await api
    .get('/api/blogs')

  expect(response.body.length).toBe(initialBlogs.body.length)
})

// test with no likes
test('added blog without no likes should be 0', async () => {
  const newBlog = {
    title: 'Blog without no likes',
    author: 'Robert C. Martin',
    url: 'http://blog.html'
  }

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  //const likes = response.json(response.likes)
  console.log('LIKES::::: ', response.body.likes)

  expect(response.body.likes).toBe(0)
})

afterAll(() => {
  server.close()
})
