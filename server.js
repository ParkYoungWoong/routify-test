const { ssr } = require('@sveltech/ssr')
const express = require('express')
const app = express()

const ENTRYPOINT = 'dist/__app.html'
const APP = 'dist/build/bundle.js'
const PORT = 5005

// serve assets, if they exist
app.use(express.static('dist'))

// otherwise serve Routify
app.get('*', async (req, res) => {
  const html = await ssr(ENTRYPOINT, APP, req.url)
  res.send(html)
})

// You can also serve in SPA mode without SSR (uncomment below)
// app.get('*', async (req, res) => {
//    res.sendFile(ENTRYPOINT, { root: __dirname })
// })

// start server
app.listen(PORT)
console.log('serving on port', PORT)
