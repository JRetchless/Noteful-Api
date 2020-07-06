const express = require('express')
const xss = require('xss')
const NotesService = require('./notes-service')

const notesRouter = express.Router()
const jsonParser = express.json()

const serializeNote = note => ({
    id: note.id,
    name: xss(note.name),
    modified: note.modified,
    folderId: String(note.folder_id),
    content: xss(note.content)
})

notesRouter
.route('/')
.get((req, res) => {
    NotesService.getAllNotes(
      req.app.get('db'),
      )
  .then(notes => {
    res.json(notes.map(serializeNote))
  }) 
  })
.post(jsonParser, (req, res, next) => {
    const { name, modified, folder_id, content } = req.body
    const newNote = {name, modified, folder_id, content}
    for (const [key, value] of Object.entries(newNote)) {
        if (value == null) {
          return res.status(400).json({
            error: { message: `Missing '${key}' in request body` }
          })
        }
    }
    NotesService.insertNote(
        req.app.get('db'),
        newNote
    )
     .then(note => {
         res
            .status(201)
            .json(serializeNote(note))
     })
     .catch(next)
      
})

notesRouter
.route('/:noteId')
.get((req, res) => {
    NotesService.getById(
        req.app.get('db'),
        req.params.noteId
    )
.then(note => {
    res
    .status(201)
    .json(serializeNote(note))
})
})
.delete((req, res, next) => {
    NotesService.deleteNote(
      req.app.get('db'),
      req.body.numNoteId
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
})
  .patch(jsonParser, (req, res, next) => {
    const { name, content, modified } = req.body
    const noteToUpdate = { name, content, modified }

    const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain 'content'`
        }
      })

    NotesService.updateNote(
      req.app.get('db'),
      req.params.noteId,
      noteToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

  module.exports = notesRouter