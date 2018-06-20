const express = require('express')
const matrixRouter = express.Router()
const jsonfile = require('jsonfile')
const jwt = require('jsonwebtoken')
const paths = require('./../other/paths')
const messages = require('./../other/messages')
const accountCriteria = require('./other/passwordCriteria')
const { getAccount, getNextAccountId } = require('./../utils/accountHandler')
const bcrypt = require('bcrypt')



const validatePassword = (password) => {
    return (password !== undefined
        && password.length >= accountCriteria.PW_MIN_LENGTH
        && password.length <= accountCriteria.PW_MAX_LENGTH
        && accountCriteria.PW_REQUIRED_REGEXES.every(regex => password.matches(regex)))
}

const validateUsername = (username) => {
    return (username !== undefined
        && username.length >= accountCriteria.USERNAME_MIN_LENGTH
        && password.length <= accountCriteria.USERNAME_MIN_LENGTH
        && accountCriteria.USERNAME_REQUIRED_REGEXES.every(regex => username.matches(regex)))
}

registerRouter.post('/register', async (req, res) => {

    if (req.password === undefined || req.username === undefined) return res.status(400).json({ error: messages.NO_USERNAME_OR_PASSWORD })

    const password = req.password
    const username = req.username

    if (!validatePassword(password)) return res.status(400).json({ error: messages.PW_MIN_CRITERIA_NOT_MET })
    if (!validateUsername(username)) return res.status(400).json({ error: messages.USERNAME_MIN_CRITERIA_NOT_MET })

    // HUOM lisää regexit usernamen validoimiseksi
    if (getAccount(username)) return { error: messages.USERNAME_TAKEN }

    const passwordHash = await bcrypt.hash(password, accountCriteria.SALT_ROUNDS)

    const newAccount = {
            id: getNextAccountId(),
            username: username,
            passwordHash: passwordHash,
            role: 'user'
    }

    //jsonfile.writeFile(paths.getAccountJsPath) Tässä tallennus tietokantaan
    // jsonfile.readFile(paths.getAccountJsPath(), (err, obj) => {
    //     if (err) return res.status(500).json({ error: messages.FILE_ERROR })


    //     try {
    //         var index = obj.findIndex(item => {
    //             return (item.id !== undefined && item.id === id)
    //         })

    //     } catch (e) {
    //         return res.status(500).json({ error: messages.FILE_INCORRECT_FORMAT })
    //     }

    //     if (index === -1) {
    //         return res.status(404).json({ error: messages.NOT_FOUND })
    //     } else {
    //         obj[index] = req.body
    //     }

    //     jsonfile.writeFile(paths.getAccountJsPath(), obj, (err) => {
    //         if (err) return res.status(500).json({ error: messages.FILE_ERROR })
    //         else {
    //             return res.status(200).json({ msg: messages.UPDATE_DONE })
    //         }
    //     }
    //     )
    // })


    const token = jwt.sign({ username: req.body.username, }, process.env.SECRET)
    res.status(201).send({ token, username: req.body.username })

})