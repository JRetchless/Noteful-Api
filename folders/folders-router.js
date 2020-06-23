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
    FoldersService.getAllFolders(
      req.app.get('db'),
      )
  .then(folders => {
    res.json(folders.map(serializeFolder))
  }) 
  })
.post(jsonParser, (req, res, next) => {
    const { id, name, modified, folderId, content } = req.body
    const newFolder = {id, name, modified, folderId, content}
    for (const [key, value] of Object.entries(newFolder)) {
        if (value == null) {
          return res.status(400).json({
            error: { message: `Missing '${key}' in request body` }
          })
        }
    }
    FoldersService.insertFolder(
        req.app.get('db'),
        newFolder
    )
     .then(folder => {
         res
            .status(201)
            .json(serializeFolder(folder))
     })
     .catch(next)
      
})

foldersRouter
.route('/:folderId')
.get((req, res) => {
    FoldersService.getById(
        req.app.get('db'),
        req.params.folderId
    )
.then(folder => {
    res
    .status(201)
    .json(serializeFolder(folder))
})
})
.delete((req, res, next) => {
    FoldersService.deleteFolder(
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

    FoldersService.updateFolder(
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