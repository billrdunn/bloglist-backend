const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    const likes = blogs.map(blog => blog.likes)
    return likes.reduce((prev, cur) => prev + cur)
}

module.exports = {
    dummy,
    totalLikes
}