import * as express from "express"
import {join} from 'path'
const app = express()

app.get('/', (_req, res) => {
  const indexPath = join(__dirname, '..','client','index.html')
  
  return res.sendFile(indexPath)
})


app.use('./client', express.static(join(__dirname,'../client')))
app.listen(9000, ()=> {
  console.log('server is listening on port 9000')
})