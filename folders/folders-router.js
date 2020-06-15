const express = require('express')
const xss = require('xss')
const FoldersService = require('./folders-service')

const foldersRouter = express.Router()
const jsonParser = express.json()

const serializeFolder = folder => ({
    id: folder.id,
    name: xss(folder.name),
    modified: folder.modified,
    folderId: folder.folderId,
    content: xss(folder.content)
})

foldersRouter
.route('/')
.get((req, res) => {
    foldersService.getAllfolders(
      req.app.get('db'),
      )
  .then(folders => {
    res.json(folders.map(serializefolder))
  }) 
  })
.post(jsonParser, (req, res, next) => {
    const { id, name, modified, folderId, content } = req.body
    const newfolder = {id, name, modified, folderId, content}
    for (const [key, value] of Object.entries(newfolder)) {
        if (value == null) {
          return res.status(400).json({
            error: { message: `Missing '${key}' in request body` }
          })
        }
    }
    foldersService.insertfolder(
        req.app.get('db'),
        newfolder
    )
     .then(folder => {
         res
            .status(201)
            .json(serializefolder(folder))
     })
     .catch(next)
      
})

foldersRouter
.route('/:folderId')
.get((req, res) => {
    foldersService.getById(
        req.app.get('db'),
        req.params.folderId
    )
.then(folder => {
    res
    .status(201)
    .json(serializefolder(folder))
})
})
.delete((req, res, next) => {
    foldersService.deletefolder(
      req.app.get('db'),
      req.params.folderId
    )

      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
})
  .patch(jsonParser, (req, res, next) => {
    const { name, content, modified } = req.body
    const folderToUpdate = { name, content, modified }

    const numberOfValues = Object.values(folderToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain 'content'`
        }
      })

    foldersService.updatefolder(
      req.app.get('db'),
      req.params.folderId,
      folderToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

  module.exports = foldersRouter