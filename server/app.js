import {join} from 'path'

import * as express from "express"
const app = express()
app.get('/', (_req, res) => {
  const indexPath = join(__dirname, '..','client','index.html')
  
  return res.sendFile(indexPath)
})

app.use('./client', express.static(join(__dirname,'../client')))

export {app}