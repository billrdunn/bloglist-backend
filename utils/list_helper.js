const lodash = require('lodash')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    const likes = blogs.map(blog => blog.likes)
    return likes.reduce((prev, cur) => prev + cur)
}

const favouriteBlog = (blogs) => {
    const likes = blogs.map(b => b.likes)
    const maxNum = Math.max(...likes);
    return blogs.find(b => b.likes == maxNum)
}

const topAuthor = (blogs) => {
    const authors = blogs.map(b => (
        {
            author: b.author,
            blogs: 0
        }))

    return authors[0]
}

module.exports = {
    dummy,
    totalLikes,
    favouriteBlog,
    topAuthor
}