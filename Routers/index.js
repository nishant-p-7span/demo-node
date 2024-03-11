const express = require('express')
const route = express.Router()
const user = require('../Model/damn')
const { getUser } = require('../controllers/userrespond')
const { userAdd } = require('../controllers/useradd')
const { getUserByName } = require('../controllers/username')
const { userEdit } = require('../controllers/edit')
const { userRM } = require('../controllers/remove')

route.get('/',getUser)

route.post('/add', userAdd)

route.get('/:name',getUserByName)

route.patch('/edit/:name',userEdit)

route.delete('/delete/:name', userRM)

route.get('/test', (req,res) => {
  res.send("CICD Successful")
})

module.exports = route
