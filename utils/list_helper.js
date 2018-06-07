const dummy = (blogs) => {
  console.log(blogs)
  return 1
}

const totalLikes = (blogs) => {
  const likes = blogs.map(blog => blog.likes)

  const reducer = (sum, item) => {
    return sum + item
  }

  return likes.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  const favorite = blogs.reduce((bigger, item) => {
    console.log('Vertailu: ', bigger, item)
    return (bigger.likes > item.likes) ? bigger : item
  })

  return favorite
}

module.exports = {
  dummy, totalLikes, favoriteBlog
}
