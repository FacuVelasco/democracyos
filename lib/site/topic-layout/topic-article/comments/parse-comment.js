import marked from 'marked'

const renderer = new marked.Renderer()

renderer.heading = function (text, level) {
  return `<h${level}>${text}</h${level}>`
}

export default function parseComment (comment) {
  return new Promise((resolve, reject) => {
    marked(comment.text, {
      sanitize: true,
      smartypants: true,
      renderer
    }, function (err, textHtml) {
      if (err) return reject(err)
      comment.textHtml = textHtml
      resolve(comment)
    })
  })
  .then((comment, err) => {
    if (err) return Promise.reject(err)
    return Promise.all(
      comment.replies.map(
        (reply) => {
          return new Promise((resolve, reject) => {
            marked(reply.text, {
              sanitize: true,
              smartypants: true,
              renderer
            }, function (err, textHtml) {
              if (err) return reject(err)
              resolve(textHtml)
            })
          })
        }
      )
    )
    .then((replies, err) => {
      if (err) return Promise.reject(err)
      comment.replies = comment.replies.map((reply, i) => {
        reply.textHtml = replies[i]
        return reply
      })
      return Promise.resolve(comment)
    })
  })
}