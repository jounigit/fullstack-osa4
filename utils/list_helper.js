const dummy = (blogs) => {
  console.log(blogs)
  return 1
}

const totalLikes = (blogs) => {
  return blogs.map(blog => blog.likes).reduce((sum, item) => sum + item, 0)
}

const favoriteBlog = (blogs) => {
  return blogs.reduce((bigger, item) => (bigger.likes > item.likes) ? bigger : item)
}

const mostBlogs = (blogs) => {
  const authors = [...new Set( blogs.map(blog => blog.author ) )]
  const blogsByAuthor =  authors.map(a => {
    return {
      author: a,
      blogs: blogs.filter(blog => blog.author === a).length
    }
  })
  return blogsByAuthor.reduce((most, item) => (most.blogs > item.blogs) ? most : item)
}

const mostLikes = (blogs) => {
  const authors = [...new Set( blogs.map(blog => blog.author ) )]
  const authorsLikes =  authors.map(a => {
    let blogsBy = blogs.filter(blog => blog.author === a)
    return {
      author: a,
      likes: blogsBy.map(blog => blog.likes).reduce((sum, item) => sum + item, 0)
    }
  })

  return authorsLikes.reduce((most, item) => (most.likes > item.likes) ? most : item)
}

module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}
