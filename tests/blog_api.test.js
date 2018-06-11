const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const helper = require('./test_helper')

describe('when there is initially some blogs saved', async () => {
  beforeAll(async () => {
    await Blog.remove({})

    const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
    await Promise.all(blogObjects.map(blog => blog.save()))
  })

  test('blogs are returned as json by GET /api/blogs', async () => {
    const blogsInDatabase = await helper.blogsInDb()

    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.length).toBe(blogsInDatabase.length)

    const returnedContents = response.body.map(n => n.title)
    blogsInDatabase.forEach(blog => {
      expect(returnedContents).toContain(blog.title)
    })
  })

  // test a specific blog
  test('individual blogs are returned as json by GET /api/blogs/:id', async () => {
    const blogsInDatabase = await helper.blogsInDb()
    const aBlog = blogsInDatabase[0]

    const response = await api
      .get(`/api/blogs/${aBlog.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.title).toEqual(aBlog.title)
  })

  test('404 returned by GET /api/blogs/:id with nonexisting valid id', async () => {
    const validNonexistingId = await helper.nonExistingId()

    await api
      .get(`/api/blogs/${validNonexistingId}`)
      .expect(404)
  })

  /*
  test('400 is returned by GET /api/notes/:id with invalid id', async () => {
    const invalidId = 'id=5b18de12a45'

    const response = await api
      .get(`/api/notes/${invalidId}`)
      .expect(400)
  }) */

  describe('addition of a new blog', async () => {
  // Test adding
    test('a valid blog can be added', async () => {
      const blogsBefore = await helper.blogsInDb()

      const newBlog = {
        title: 'TDD harms architecture',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
        likes: 0
      }

      const response = await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const blogsAfter = await helper.blogsInDb()
      console.log(response.body)
      expect(blogsAfter.length).toBe(blogsBefore.length + 1)
      //expect(blogsAfter).toContainEqual(response.body)
      const contents = blogsAfter.map(r => r.title)
      expect(contents).toContain('TDD harms architecture')
    })


    // Test adding without title and url
    test('fails if title and url is missing', async () => {
      const newBlog = {
        author: 'Robert C. Martin',
        likes: 0
      }

      const blogsBefore = await helper.blogsInDb()

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

      const blogsAfter = await helper.blogsInDb()

      expect(blogsAfter.length).toBe(blogsBefore.length)
    })

    // test with no likes
    test('default value is added if likes is missing', async () => {
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

      expect(response.body.likes).toBe(0)
    }) /**/
  })

  describe('deletion of a note', async () => {
    let addedBlog

    beforeAll(async () => {
      addedBlog = new Blog({
        title: 'Blog to be deleted',
        author: 'Robert C. Martin',
        url: 'http://blogdelete.html'
      })
      await addedBlog.save()
    })

    test('DELETE succeeds with proper statuscode', async () => {
      const blogsBefore = await helper.blogsInDb()

      await api
        .delete(`/api/blogs/${addedBlog._id}`)
        .expect(204)

      const blogsAfter = await helper.blogsInDb()

      const contents = blogsAfter.map(r => r.title)
      expect(contents).not.toContain(addedBlog.title)
      expect(blogsAfter.length).toBe(blogsBefore.length - 1)
    })
  })

  describe('updating blog', async () => {
    const newLikes = {
      likes: 100
    }

    test('UPDATE succeeds with proper statuscode', async () => {
      const blogsBefore = await helper.blogsInDb()
      const aBlog = blogsBefore[0]

      await api
        .put(`/api/blogs/${aBlog.id}`)
        .send(newLikes)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const blogsAfter = await helper.blogsInDb()
      expect(blogsAfter[0].likes).toBe(newLikes.likes)
    })

    test('UPDATE fails 404 returned, nonexisting valid id', async () => {
      const validNonexistingId = await helper.nonExistingId()

      await api
        .get(`/api/blogs/${validNonexistingId}`)
        .send(newLikes)
        .expect(404)
    })

  })

  /**/

  afterAll(() => {
    server.close()
  })
})
